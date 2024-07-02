import { PrismaClient } from "@prisma/client";
import { errorHandler } from "../utils/error.js";
import { generateSlug } from "random-word-slugs";
import { createClient } from '@clickhouse/client'
import { Redis } from "ioredis";




//update the details
//clickhouse client to access logs
const prismaClient = new PrismaClient()
const client = createClient({
    url: 'https://avnadmin:AVNS_BqXfRsdV9Ds6-BUAX84@clickhouse-250c669d-vercelclonenit.g.aivencloud.com:16236',
    database: 'default',
    username: 'avnadmin',
    password: 'AVNS_BqXfRsdV9Ds6-BUAX84'
})
const publisher = new Redis('rediss://default:AVNS_hdBsx-1bttYrCcV2waN@caching-1e9117e8-vercelclonenit.l.aivencloud.com:16236')


//function to pushproject id into the redis queue
async function publishWork(projectId) {
    publisher.publish('deployments', projectId)
}



export const createProject = async (req, res, next) => {
    const { name, gitURL, user } = req.body;

    try {
        console.log(user)
        const project = await prismaClient.project.create({
            data: {
                name: name,
                gitURL: gitURL,
                subDomain: generateSlug(),
                userId: user.id
            }
        })

        return res.status(200).json({
            data: project
        })
    } catch (e) {
        next(e)
    }
}

export const deployProject = async (req, res, next) => {
    const { projectId } = req.body;
    const project = await prismaClient.project.findFirst({
        where: {
            id: projectId
        }
    })
    if (!project) {
        return next(errorHandler(404, `project does not exist`))
    }

    try {
        //deployment banakar redis-queue mein daalna hai
        //worker server will act as consumer and deploy the projects individually

        const deployment = await prismaClient.deployement.create({
            data: {
                project: {
                    connect: {
                        id: projectId
                    }
                },
                status: 'QUEUED'
            }
        })

        publishWork(deployment.id.toString())
        return res.status(200).json({
            data: deployment,
            message: `deployment will start soon`
        })

    } catch (e) {
        next(e)
    }
}

export const getStatus = async (req, res) => {
    const id = req.params.id
    const dstat = await prismaClient.deployement.findUnique({
        where: {
            id: id
        }
    })
    if (!dstat) {
        return next(errorHandler(404, `deployment does not exist`))
    }
    return res.json({
        status: dstat.status
    })
}

export const getLogs = async (req, res) => {
    const id = req.params.id;
    const logs = await client.query({
        query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String}`,
        query_params: {
            deployment_id: id
        },
        format: 'JSONEachRow'
    })

    const rawLogs = await logs.json()

    return res.json({ logs: rawLogs })
}

export const projects = async (req, res, next) => {
    const { id } = req.body;
    try {
        const projects = await prismaClient.project.findMany({
            where: {
                userId: id
            }
        })
        return res.status(200).json(projects)
    } catch (e) {
        next(e)
    }
}