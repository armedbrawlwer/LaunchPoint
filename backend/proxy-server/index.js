import express from 'express'
import httpProxy from 'http-proxy'


const BASE_PATH = "https://vercel-clone-output-nit.s3.ap-south-1.amazonaws.com/__outputs"
const proxy = httpProxy.createProxy()

app.use((req, res) => {
    const hostname = req.hostname
    console.log(subdomain)
    const subdomain = hostname.split('.')[0]
    const resovleTo = `${BASE_PATH}/${subdomain}`

    return proxy.web(req, res, { target: resovleTo, changeOrigin: true })
})


proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html'

})


const app = express();
app.listen(9002, () => {
    console.log(`server started at 9000`)
})
