import express from 'express'
import { Redis } from 'ioredis'
import { PrismaClient } from '@prisma/client'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import { createClient } from '@clickhouse/client'
import { Kafka } from 'kafkajs'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid';


const __dirname = path.resolve()
const prismaClient = new PrismaClient()
const subscriber = new Redis('rediss://default:AVNS_hdBsx-1bttYrCcV2waN@caching-1e9117e8-vercelclonenit.l.aivencloud.com:16236')
const client = createClient({
    url: 'https://avnadmin:AVNS_BqXfRsdV9Ds6-BUAX84@clickhouse-250c669d-vercelclonenit.g.aivencloud.com:16236',
    database: 'default',
    username: 'avnadmin',
    password: 'AVNS_BqXfRsdV9Ds6-BUAX84'
})


const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIA3FLD4SMG4CM6FEX5',
        secretAccessKey: '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'
    }
})

const config = {
    CLUSTER: 'arn:aws:ecs:ap-south-1:767398023949:cluster/builder-cluster-nit',
    TASKDEFINIION: 'arn:aws:ecs:ap-south-1:767398023949:task-definition/builder-task'
}

const kafka = new Kafka({
    clientId: `worker-server`,
    brokers: ['kafka-d15b351-vercelclonenit.g.aivencloud.com:16248'],
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')]
    },
    sasl: {
        username: 'avnadmin',
        password: 'AVNS_wlgt-_13yTSplw5vrzE',
        mechanism: 'plain'
    }
})
const consumer = kafka.consumer({ groupId: 'consumer-logs' })


subscriber.subscribe('deployments', (err, count) => {
    if (err) {
        console.log(`could not subscribe to channel`)
    } else {
        console.log('subscribed successfully')

    }
})

subscriber.on("message", async (channel, message) => {
    if (channel === 'deployments') {
        const id = message.toString()
        console.log(`recievedMessage:${id}`)
        const deployment = await prismaClient.deployement.findUnique({
            where: {
                id: id
            }
        });
        console.log(deployment)
        if (!deployment) {
            throw new Error(`Deployment with id ${id} not found`);
        }
        const project_id = deployment.projectId;
        const project = await prismaClient.project.findUnique({
            where: {
                id: project_id
            }
        });

        //spin the container
        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASKDEFINIION,
            launchType: 'FARGATE',
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: 'ENABLED',
                    subnets: ['subnet-070d55e087886163f', 'subnet-0b8c856c7c9c511a8', 'subnet-0633ba80fc8f249ec'],
                    securityGroups: ['sg-07f3e89d527360008']
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: 'builder-image',
                        environment: [
                            { name: 'GIT_REPOSITORY_URL', value: project.gitURL },
                            { name: 'project_id', value: project_id },
                            { name: 'Deployment_Id', value: deployment.id }
                        ]
                    }
                ]
            }
        })

        await ecsClient.send(command)
        await prismaClient.deployement.update({
            data: {
                status: 'READY'
            },
            where: {
                id: deployment.id
            }
        });
    }
})

async function initkafkaConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['container-logs'], fromBeginning: true })

    await consumer.run({

        eachBatch: async function ({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset }) {

            const messages = batch.messages;
            console.log(`Recv. ${messages.length} messages..`)
            for (const message of messages) {
                if (!message.value) continue;
                const stringMessage = message.value.toString()
                const { PROJECT_ID, Deployment_Id, log } = JSON.parse(stringMessage)
                console.log({ log, Deployment_Id })
                try {
                    const { query_id } = await client.insert({
                        table: 'log_events',
                        values: [{ event_id: uuidv4(), deployment_id: Deployment_Id, log }],
                        format: 'JSONEachRow'
                    })
                    console.log(query_id)
                    resolveOffset(message.offset)
                    await commitOffsetsIfNecessary(message.offset)
                    await heartbeat()
                } catch (err) {
                    console.log(err)
                }

            }
        }
    })
}
initkafkaConsumer()



const app = express()
app.listen(9004, () => {
    console.log(`server started at port 9003`)
})