// Auth types
export interface UserAuth {
	id: string
	username: string
	password: string
	email: string
}

export interface TokenPayload {
	id: string
	username: string
	email: string
}

export interface JWTTokenPayload {
	id: number
	username: string
	email: string
	iat: number
	exp: number
}

export interface TokenVerificationResult {
	validity: boolean
	payload: JWTTokenPayload | null
}

// Data types
export interface Transaction {
	id: number
	amount: number
	message: string
	transaction_date: string
	transaction_type: 'withdraw' | 'deposit' | 'sent' | 'recieved'
	owner_id: number
	account_from?: string | null
	account_to?: string | null
	balance?: number
	new_balance: number
}
