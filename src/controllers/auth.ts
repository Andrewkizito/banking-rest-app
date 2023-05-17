// Importing helper modules
import { Response, Request, NextFunction } from 'express'
import { UserAuth } from '../utilities/types'
import {
	generateHash,
	generateToken,
	validateToken,
} from '../utilities/modules'
import sql_connection from '../utilities/mysql'

export const validatePassword = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const password = req.body.password

	if (!password) {
		res.status(400).send('Password is required')
		return
	}

	if (password.length < 8 || password.length > 40) {
		res.status(400).send('Password must be between 8 and 40 characters')
		return
	}

	const passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z0-9!@#$%^&*()]+$/

	if (!passwordRegex.test(password)) {
		res
			.status(400)
			.send(
				'Password must contain a lowercase, uppercase, number and special character'
			)
		return
	}

	next()
}

export const generateUsername = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const name = req.body.name
	if (!name) {
		res.status(400).send('Name is required')
		return
	}

	req.body.username = `${name.split(' ').join('-')}`
	next()
}

export const authenticateUser = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { username, password } = req.body as {
		username: string | undefined
		password: string | undefined
	}

	if (!username || !password) {
		res.status(400).send('Username and password is required')
		return
	}

	sql_connection.query(
		`SELECT id, username,password,email FROM USERS WHERE username='${username.toLowerCase()}'`,
		(error, results) => {
			if (error) {
				res.status(500).send(error)
				return
			}

			const response = results as UserAuth[]
			const user = response[0]

			if (user) {
				const hashedPassword = generateHash(password)

				if (hashedPassword === user.password) {
					req.body = {
						authToken: generateToken({
							id: user.id,
							username: user.username,
							email: user.email,
						}),
						message: 'Credentials Authenticated Successfully',
					}
					next()
				} else {
					res.status(404).send('Username or Password is invalid')
				}
			} else {
				res.status(404).send('Account Not Found')
			}
		}
	)
}

export const validateSession = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.headers.authorization) {
		res.status(403).send('Access token is required')
		return
	}

	const session_validity = validateToken(req.headers.authorization)
	if (!session_validity.validity) {
		res.status(403).send('Access token has expired')
		return
	}
	req.body.token_payload = session_validity.payload
	next()
}
