import { Request, Response, NextFunction } from 'express'
import * as utils from '../../controllers/auth'

describe('Test password validation', () => {
	let req: Partial<Request>
	let res: Partial<Response>
	let next: jest.Mock<NextFunction>

	beforeEach(() => {
		req = {
			body: {
				password: '',
			},
		}
		res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		}
		next = jest.fn()
	})

	it("password should be invalid if it doesn't fit the regex", () => {
		req.body.password = 'mmmcm'
		utils.validatePassword(req as Request, res as Response, next)
		expect(res.status).toBeCalledWith(400)
	})

	it('password should be invalid if length is less that 8', () => {
		req.body.password = 'Kitab7!'
		utils.validatePassword(req as Request, res as Response, next)
		expect(res.status).toBeCalledWith(400)
	})
	it('password should be invalid if length is greater than 40', () => {
		req.body.password = 'Kitab7!mvjvjjjjjkdbbbbviowif4h79377&&9494'
		utils.validatePassword(req as Request, res as Response, next)
		expect(res.status).toBeCalledWith(400)
	})

	it('password should pass regex' ,() => {
		req.body.password = 'Kitab777!'
		utils.validatePassword(req as Request, res as Response, next)
		expect(next).toBeCalled()
	})
})
