// Importing helper modules
import { JWTTokenPayload, TokenPayload, TokenVerificationResult } from './types'
import { createHmac } from 'crypto'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// Importing middleware
import { logger } from './middleware'

// Loading env
dotenv.config()

// Auth functions
export function generateHash(data: string): string {
	return createHmac('sha256', process.env.app_secret!)
		.update(data)
		.digest('hex')
}

export function generateToken(data: TokenPayload) {
	return jwt.sign(data, process.env.app_secret!, {
		expiresIn: 60 * 60,
	})
}

export function validateToken(token: string): TokenVerificationResult {
	const result: TokenVerificationResult = {
		validity: false,
		payload: null,
	}
	try {
		const payload = jwt.verify(
			token,
			process.env.app_secret!
		) as JWTTokenPayload
		result.validity = true
		result.payload = payload
	} catch (error) {
		logger.error(`${new Date()} - ${error}`)
	}

	return result
}

export const formatDate = (
	dateString: string
): { date: string; time: string } => {
	const dateObj = new Date(dateString)

	const formattedDate = dateObj.toISOString().split('T')[0]

	const formattedTime = dateObj.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	})

	return { date: formattedDate, time: formattedTime }
}
