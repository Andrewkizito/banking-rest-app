// Importing helper modules
import { Router } from 'express'
import dotenv from 'dotenv'

// Importing controllers
import { validateSession } from '../controllers/auth'
import {
	depositFinances,
	getAccountSummary,
	getTransactions,
} from '../controllers/users'

dotenv.config()

// Initializing router
const usersRouter = Router()

usersRouter.get(
	'/account-summary',
	validateSession,
	getAccountSummary,
	(req, res) => {
		res.status(200).send(req.body)
	}
)

usersRouter.get(
	'/transactions',
	validateSession,
	getTransactions,
	(req, res) => {
		res.status(200).send(req.body)
	}
)

usersRouter.post('/deposit', validateSession, depositFinances, (req, res) => {
	res.status(200).send(req.body)
})

export default usersRouter
