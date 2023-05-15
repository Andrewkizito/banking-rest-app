// Importing dependencies
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import usersRouter from './routers/Users'
import bodyParser from 'body-parser'

// Loading environment
dotenv.config()

// Initializing application
export const app = express()

const logger = morgan(
	':method :url :status :res[content-length] - :response-time ms'
)

// Adding middleware
app.use(logger)
app.use(bodyParser.json())

// Adding routers
app.use('/users', usersRouter)

const environment = process.env.NODE_ENV as 'production' | 'development'
const port = environment === 'development' ? 8000 : 80

// Starting server
app.listen(port, () => console.log(`Server started on localhost:${port}`))
