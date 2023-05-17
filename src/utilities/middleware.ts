// Importing middleware
import morgan from 'morgan'
import winston from "winston";

export const logger = winston.createLogger({
	level: 'error',
	format: winston.format.json(),
	transports: [new winston.transports.File({ filename: 'logs/error.log' })],
})

export const logger_morgan = morgan(
	':method :url :status :res[content-length] - :response-time ms'
)