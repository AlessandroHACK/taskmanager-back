import express from 'express'
import dotenv from "dotenv"
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'
import AuthRoutes from './routes/authRoutes'
dotenv.config()

connectDB()

const app = express()
//habilitar cors
app.use(cors(corsConfig))
//morgan
app.use(morgan('dev'))
//leer datos del formualrio
app.use(express.json())
// Routes
app.use('/api/auth', AuthRoutes)
app.use('/api/projects', projectRoutes)


export default app