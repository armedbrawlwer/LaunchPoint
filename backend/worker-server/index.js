import express from 'express';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { createClient } from '@clickhouse/client';
import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const prismaClient = new PrismaClient();
const subscriber = new Redis(process.env.REDIS_URL);

const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    database: process.env.CLICKHOUSE_DATABASE,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD
});

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const config = {
    CLUSTER: process.env.AWS_CLUSTER,
    TASK_DEFINITION: process.env.AWS_TASK_DEFINITION
};

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKERS],
    ssl: {
        ca: [fs.readFileSync(process.env.KAFKA_SSL_CA, 'utf-8')]
    },
    sasl: {
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD,
        mechanism: 'plain'
    }
});
const consumer = kafka.consumer({ groupId: 'consumer-logs' });

subscriber.subscribe('deployments', (err, count) => {
    if (err) {
        console.log(`could not subscribe to channel`);
    } else {
        console.log('subscribed successfully');
    }
});

subscriber.on("message", async (channel, message) => {
    if (channel === 'deployments') {
        const id = message.toString();
        console.log(`receivedMessage:${id}`);
        const deployment = await prismaClient.deployement.findUnique({
            where: {
                id: id
            }
        });
        console.log(deployment);
        if (!deployment) {
            throw new Error(`Deployment with id ${id} not found`);
        }
        const project_id = deployment.projectId;
        const project = await prismaClient.project.findUnique({
            where: {
                id: project_id
            }
        });

        // Spin the container
        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASK_DEFINITION,
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
        });

        await ecsClient.send(command);
        await prismaClient.deployement.update({
            data: {
                status: 'READY'
            },
            where: {
                id: deployment.id
            }
        });
    }
});

async function initKafkaConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['container-logs'], fromBeginning: true });

    await consumer.run({
        eachBatch: async function ({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset }) {
            const messages = batch.messages;
            console.log(`Recv. ${messages.length} messages..`);
            for (const message of messages) {
                if (!message.value) continue;
                const stringMessage = message.value.toString();
                const { PROJECT_ID, Deployment_Id, log } = JSON.parse(stringMessage);
                console.log({ log, Deployment_Id });
                try {
                    const { query_id } = await client.insert({
                        table: 'log_events',
                        values: [{ event_id: uuidv4(), deployment_id: Deployment_Id, log }],
                        format: 'JSONEachRow'
                    });
                    console.log(query_id);
                    resolveOffset(message.offset);
                    await commitOffsetsIfNecessary(message.offset);
                    await heartbeat();
                } catch (err) {
                    console.log(err);
                }
            }
        }
    });
}
initKafkaConsumer();

const app = express();
app.listen(9004, () => {
    console.log(`server started at port 9004`);
});
