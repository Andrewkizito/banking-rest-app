// Importing helper modules
import { Response, Request, NextFunction } from 'express'
import { JWTTokenPayload, Transaction } from '../utilities/types'
import sql_connection from '../utilities/mysql'

// Importing middleware
import { logger } from '../utilities/middleware'
import { formatDate } from '../utilities/modules'

export const getAccountSummary = (
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
				sql_connection.end()
				return
			}

			const data = results as Array<Transaction>

			let payload = {}

			if (data.length) {
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

				const lastTransaction: Partial<Transaction> = {
					amount: data[0].amount,
					transaction_type: data[0].transaction_type,
					transaction_date: data[0].transaction_date,
				}

				payload = {
					total_transactions: data.length,
					transactions: result,
					lastTransaction: lastTransaction,
					balance: data[0].balance,
				}
			} else {
				payload = {
					total_transactions: 0,
					transactions: [],
					lastTransaction: {
						amount: 0,
						transaction_type: 'N/A',
						transaction_date: 'N/A',
					},
					balance: 0,
				}
			}

			req.body = payload
			next()
			sql_connection.end()
		}
	)
}

export const depositFinances = (req: Request, res: Response) => {
	const { id } = req.body.token_payload as JWTTokenPayload

	if (!id) {
		res.status(400).send('Token has no ID encoded')
		return
	}

	if (!req.body.amount) {
		res.status(400).send('Invalid deposit amount submitted')
		return
	}

	sql_connection.beginTransaction((err) => {
		if (err) {
			logger.error(err)
			res.status(500).send(err.message)
			return
		}

		const selectBalanceSql = 'SELECT balance FROM USERS WHERE id = ?'
		sql_connection.query(selectBalanceSql, id, (error, results: any[]) => {
			if (error) {
				logger.error(error)
				res.status(500).send(error.message)
				sql_connection.rollback(() => {
					logger.error('Transaction rolled back')
					sql_connection.end()
				})
				return
			}

			const balance = results[0].balance
			const newBalance = balance + req.body.amount
			const transactionDate = `${formatDate(new Date().toISOString()).date} ${
				formatDate(new Date().toISOString()).time
			}`
			console.log(transactionDate)

			const payload: Transaction = {
				id: 1,
				owner_id: id,
				message: `Amount of $${req.body.amount} was deposited to your account at ${transactionDate}`,
				new_balance: newBalance,
				amount: req.body.amount,
				transaction_type: 'deposit',
				transaction_date: transactionDate,
			}

			const updateBalanceSql = 'UPDATE USERS SET balance = ? WHERE id = ?'
			sql_connection.query(updateBalanceSql, [newBalance, id], (err) => {
				if (err) {
					logger.error(err)
					res.status(500).send(err.message)
					sql_connection.end()
					return
				}

				const insertTransactionSql =
					'INSERT INTO TRANSACTIONS (owner_id, message, new_balance, amount, transaction_type, transaction_date) VALUES (?, ?, ?, ?, ?, ?)'
				const values = [
					payload.owner_id,
					payload.message,
					payload.new_balance,
					payload.amount,
					payload.transaction_type,
					payload.transaction_date,
				]
				sql_connection.query(insertTransactionSql, values, (err) => {
					if (err) {
						logger.error(err)
						res.status(500).send(err.message)
						sql_connection.rollback(() => {
							logger.error('Transaction rolled back')
							sql_connection.end()
						})
						return
					}

					sql_connection.commit((err) => {
						if (err) {
							logger.error(err)
							sql_connection.rollback(() => {
								logger.error('Transaction rolled back')
								sql_connection.end()
							})
							res.status(500).send(err.message)
							return
						}

						const memoryUsage = process.memoryUsage()
						const heapTotalMB = memoryUsage.heapTotal / (1024 * 1024)
						const heapUsedMB = memoryUsage.heapUsed / (1024 * 1024)
						console.log(`Heap total: ${heapTotalMB.toFixed(2)} MB`)
						console.log(`Heap used: ${heapUsedMB.toFixed(2)} MB`)
						res.status(200).send('Balance has been updated')
						sql_connection.end()
					})
				})
			})
		})
	})
}
