// Importing dependencies
import express from 'express'
import dotenv from 'dotenv'

// Importing middleware
import { logger_morgan } from './utilities/middleware'
import bodyParser from 'body-parser'
import cors from 'cors'

// Importing partial routers
import authRouter from './routers/auth'
import usersRouter from './routers/users'

// Loading environment
dotenv.config()

// Initializing application
export const app = express()

// Adding middleware
app.use(cors())
app.use(logger_morgan)
app.use(bodyParser.json())

// Adding routers
app.use('/auth', authRouter)
app.use('/users', usersRouter)

const environment = process.env.NODE_ENV as 'production' | 'development'
const port = environment === 'development' ? 5000 : 80

// Starting server
app.listen(port, () => console.log(`Server started on localhost:${port}`))
