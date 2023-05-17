// Importing helper modules
import { Router } from 'express'
import dotenv from 'dotenv'

// Importing controllers
import { validateSession } from '../controllers/auth'
import { getUserTransactions } from '../controllers/users'

dotenv.config()

// Initializing router
const usersRouter = Router()

usersRouter.get(
	'/account-summary',
	validateSession,
	getUserTransactions,
	(req, res) => {
		res.status(200).send(req.body)
	}
)

export default usersRouter
