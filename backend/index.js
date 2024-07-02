import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'
import serviceRoutes from './routes/service.route.js'
import dotenv from 'dotenv'

dotenv.config();





const app = express()
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  })
);
const PORT = 9000;
app.use(express.json())
// const prismaClient = new PrismaClient()
// const io = new Server({ cors: '*' })

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//creating a clickhouse client
// const client = createClient({
//     url: 'https://avnadmin:AVNS_froDMbKPe5TVX5ZiDVn@clickhouse-1902e310-tripathi-4ba7.g.aivencloud.com:13094',
//     database: 'default',
//     username: 'avnadmin',
//     password: 'AVNS_froDMbKPe5TVX5ZiDVn'
// })


//create a kafka consumer
// const kafka = new Kafka({
//     clientId: `api-server`,
//     brokers: ['kafka-100d53a4-tripathi-4ba7.d.aivencloud.com:13106'],
//     ssl: {
//         ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')]
//     },
//     sasl: {
//         username: 'avnadmin',
//         password: 'AVNS_G9qZ1ObekrNcJABQObi',
//         mechanism: 'plain'
//     }
// })
// const consumer = kafka.consumer({ groupId: 'consumer-logs' })


// const subsciber = new Redis('rediss://default:AVNS_p_v-JSmDDW3y1DhBtpf@caching-7abe228-tripathi-4ba7.j.aivencloud.com:13094')

//websocket logs(we used kafka instead of this =>only for referebnce to futuer projects)
// io.listen(9001, () => {
//     console.log(`socket server started at port 9001`)
// })

// io.on('connection', socket => {
//     socket.on('subscribe', channel => {
//         socket.join(channel)
//         socket.emit('message', `joinee ${channel}`)
//     })
// })

//create ECS client
// const ecsClient = new ECSClient({
//     region: 'ap-south-1',
//     credentials: {
//         accessKeyId: 'AKIA3FLD4SMG4CM6FEX5',
//         secretAccessKey: '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'
//     }
// })

// const config = {
//     CLUSTER: 'arn:aws:ecs:ap-south-1:767398023949:cluster/builder-cluster-nit',
//     TASKDEFINIION: 'arn:aws:ecs:ap-south-1:767398023949:task-definition/builder-task'
// }


// async function initkafkaConsumer() {
//     await consumer.connect();
//     await consumer.subscribe({ topics: ['container-logs'], fromBeginning: true })

//     await consumer.run({

//         eachBatch: async function ({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset }) {

//             const messages = batch.messages;
//             console.log(`Recv. ${messages.length} messages..`)
//             for (const message of messages) {
//                 if (!message.value) continue;
//                 const stringMessage = message.value.toString()
//                 const { PROJECT_ID, Deployment_Id, log } = JSON.parse(stringMessage)
//                 console.log({ log, Deployment_Id })
//                 try {
//                     const { query_id } = await client.insert({
//                         table: 'log_events',
//                         values: [{ event_id: uuidv4(), deployment_id: Deployment_Id, log }],
//                         format: 'JSONEachRow'
//                     })
//                     console.log(query_id)
//                     resolveOffset(message.offset)
//                     await commitOffsetsIfNecessary(message.offset)
//                     await heartbeat()
//                 } catch (err) {
//                     console.log(err)
//                 }

//             }
//         }
//     })
// }
// initkafkaConsumer()

// ROutes starting
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// app.post('/deploy', async (req, res) => {
//     const { projectId } = req.body;

//     const project = await prismaClient.project.findUnique({
//         where: {
//             id: projectId
//         }
//     })
//     if (!project) return res.status(404).json({ message: 'project does not exist' });

//     //check if there is no running deployment
//     const deployment = await prismaClient.deployement.create({
//         data: {
//             project: {
//                 connect: {
//                     id: projectId
//                 }
//             },
//             status: 'QUEUED'
//         }
//     })



//     const projectSlug = generateSlug()
//     //spin container
// const command = new RunTaskCommand({
//     cluster: config.CLUSTER,
//     taskDefinition: config.TASKDEFINIION,
//     launchType: 'FARGATE',
//     count: 1,
//     networkConfiguration: {
//         awsvpcConfiguration: {
//             assignPublicIp: 'ENABLED',
//             subnets: ['subnet-070d55e087886163f', 'subnet-0b8c856c7c9c511a8', 'subnet-0633ba80fc8f249ec'],
//             securityGroups: ['sg-07f3e89d527360008']
//         }
//     },
//     overrides: {
//         containerOverrides: [
//             {
//                 name: 'builder-image',
//                 environment: [
//                     { name: 'GIT_REPOSITORY__URL', value: project.gitURL },
//                     { name: 'project_id', value: projectId },
//                     { name: 'Deployment_Id', value: deployment.id }
//                 ]
//             }
//         ]
//     }
// })

// await ecsClient.send(command)

//     //update the deployment status
//     await prismaClient.deployement.update({
//         data: {
//             status: 'READY'
//         }, where: {
//             id: deployment.id
//         }
//     })


//     return res.json({
//         status: 'Ready',
//         data: {
//             deployment
//         }
//     })

// })
app.use('/api/auth', authRoutes)
app.use('/api/service', serviceRoutes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});





app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`)
})