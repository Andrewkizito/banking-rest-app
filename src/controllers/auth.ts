// Importing helper modules
import { Response, Request, NextFunction } from 'express'

export const validatePassword = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const password = req.body.password

	if(!password){
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
