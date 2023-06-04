import { Router } from 'express'
import { createHmac } from 'crypto'
import dotenv from 'dotenv'
import sql_connection from '../utilities/mysql'
import {
	authenticateUser,
	generateUsername,
	validatePassword,
} from '../controllers/auth'
import { validateToken } from '../utilities/modules'

dotenv.config()

const authRouter = Router()

authRouter.get('/', (_, res) => {
	sql_connection.query(
		'SELECT username,email,password,balance FROM USERS',
		(error, results) => {
			if (error) {
				res.status(500).send(error.message)
			} else {
				res.status(200).send(results)
			}
		}
	)

	sql_connection.end()
})

authRouter.post(
	'/register',
	validatePassword,
	generateUsername,
	async (req, res) => {
		const { name, email, username, password } = req.body

		if (name && username && email && password) {
			try {
				const hashedPassword = createHmac('sha256', process.env.app_secret!)
					.update(password)
					.digest('hex')

				sql_connection.execute(
					`
          INSERT INTO USERS (name, email, username, password)
          VALUES ('${name}', '${email}', '${username}', '${hashedPassword}')
          `,
					(error) => {
						if (error) {
							res.status(500).send(error.message)
						} else {
							res.status(200).send('Account Registered Successfully')
						}
					}
				)
			} catch (error) {
				res.status(500).send(error.message)
			}
		} else {
			res.status(400).send('Name, email and password are required')
		}
	}
)

authRouter.post('/login', authenticateUser, (req, res) => {
	res.status(200).send(req.body)
})

authRouter.post('/verify-session', (req, res) => {
	if (!req.body.token) {
		res.status(400).send('Token missing in body')
		return
	}
	const { validity } = validateToken(req.body.token)

	if (validity) {
		res.status(200).send('Session is valid')
	} else {
		res.status(403).send('Session expired')
	}
})

export default authRouter
