// build code and publish to s3
import { exec } from 'child_process'
import path from 'path'
import fs from "fs"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { Kafka } from 'kafkajs'
import mime from 'mime-types'

const __dirname = path.resolve()

const s3client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: 'AKIA3FLD4SMG4CM6FEX5',
        secretAccessKey: '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'
    }
})


const project_id = process.env.project_id
const Deployment_Id = process.env.Deployment_Id

const kafka = new Kafka({
    clientId: `docker-server-build-${project_id}`,
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

const producer = kafka.producer()



async function publishLog(log) {
    // publisher.publish(`logs:${project_id}`, JSON.stringify({ log }))
    await producer.send({
        topic: `container-logs`, messages: [{
            key: `logs`, value: JSON.stringify({
                project_id, Deployment_Id, log
            })
        }]
    })
}




async function init() {
    await producer.connect()
    console.log("executing script")
    await publishLog(`build started`)
    const outDirPath = path.join(__dirname, 'output')
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    p.stdout.on('data', async function (data) {
        console.log(data.toString())
        await publishLog(data.toString())
    })
    p.stdout.on('error', async function (error) {
        console.log('error: ', error)
        await publishLog(`error:${data.toString()}`)
    })
    p.on('close', async function () {
        console.log("build complete")
        await publishLog(`build completed`)
        const distPath = path.join(__dirname, 'output', 'dist')
        const distFolderContent = fs.readdirSync(distPath, { recursive: true })

        for (const file of distFolderContent) {
            const filepath = path.join(distPath, file)
            if (fs.lstatSync(filepath).isDirectory()) continue;
            console.log('uploading: ', filepath)
            const command = new PutObjectCommand({
                Bucket: 'vercel-clone-output-nit',
                Key: `__outputs/${project_id}/${file}`,
                Body: fs.createReadStream(filepath),
                ContentType: mime.lookup(filepath)

            })
            await s3client.send(command)
            console.log('uploading', filepath)
            await publishLog('uploading')
        }
        await publishLog(`done`)
        process.exit(0)
    })
}

init()