// Importing dependencies
import mysql from 'mysql2'
import dotenv from 'dotenv'

//Loading environment
dotenv.config()

const sql_connection = mysql.createConnection({
	database: process.env.db_name,
	user: process.env.db_user,
	password: process.env.db_password,
	host: process.env.db_host,
	multipleStatements: true
})

export default sql_connection
