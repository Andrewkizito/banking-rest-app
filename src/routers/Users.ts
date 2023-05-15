// Importing helper modules
import { Router } from 'express'
import sql_connection from '../config/mysql'

// Importing controllers
import { validatePassword } from '../controllers/auth'

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

usersRouter.post('/register', validatePassword, (req, res) => {
	const { name, email, password } = req.body

	if (name && email && password) {
		res.status(200).send({ name, email, password })
		return
	}
	res.status(400).send('Name, email and password are reuired')
})

export default usersRouter
