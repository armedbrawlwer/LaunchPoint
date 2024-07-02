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

/
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