// Importing helper modules
import { Router } from 'express'
import crypto from 'crypto'
import sql_connection from '../config/mysql'
import dotenv from 'dotenv'

dotenv.config()

// Importing controllers
import { generateUsername, validatePassword } from '../controllers/auth'

// Initializing router
const usersRouter = Router()

// Defining routes
usersRouter.get('/', (_, res) => {
	sql_connection.query('SELECT * FROM USERS', (error, results) => {
		if (error) {
			res.status(500).send(error.message)
		} else {
			res.status(200).send(results)
		}
	})

	sql_connection.end()
})

usersRouter.post(
	'/register',
	validatePassword,
	generateUsername,
	async (req, res) => {
		const { name, email, username, password } = req.body

		if (name && username && email && password) {
			try {
				const hashedPassword = crypto
					.createHmac('sha256', process.env.app_secret!)
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
				sql_connection.end()
			} catch (error) {
				res.status(500).send(error.message)
			}
		} else {
			res.status(400).send('Name, email and password are required')
		}
	}
)

export default usersRouter
