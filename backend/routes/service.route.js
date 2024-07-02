import express from 'express'
import { verifyToken } from '../utils/verifyuser.js'
import { createProject, deployProject, getLogs, getStatus, projects } from '../controller/service.controller.js'


const router = express.Router()

router.post('/createProject', createProject)
router.post('/deployProject', deployProject)
router.get('/getProjects', projects)
router.get('/getStatus/:id', getStatus)
router.get('/getLogs/:id', getLogs)

export default router