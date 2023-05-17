// Importing helper modules
import { Response, Request, NextFunction } from 'express'
import { JWTTokenPayload, Transaction } from '../utilities/types'
import sql_connection from '../utilities/mysql'

// Importing middleware
import { logger } from '../utilities/middleware'

export const getUserTransactions = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.body.token_payload as JWTTokenPayload

	if (!id) {
		res.status(400).send('Token has no ID encoded')
		return
	}

	sql_connection.query(
		`SELECT transaction.*,user.balance FROM TRANSACTIONS transaction INNER JOIN USERS user ON user.id = transaction.owner_id WHERE user.id=${id} ORDER BY transaction.id DESC`,
		(error, results) => {
			if (error) {
				logger.error(error)
				res.status(500).send(error)
				return
			}

			const data = results as Array<Transaction>

			const result = data.map((item) => {
				return Object.entries(item).reduce(
					(result: { [key: string]: string | number }, [key, value]) => {
						if (value) {
							result[key] = value
						}
						return result
					},
					{}
				)
			}) as { id: number }[]

			const payload = {
				total_transactions: data.length,
				transactions: result,
				balance: data[0].balance,
			}

			req.body = payload
			next()
		}
	)

	sql_connection.end()
}
