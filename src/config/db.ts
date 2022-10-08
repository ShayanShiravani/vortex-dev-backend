const dotenv = require('dotenv')
dotenv.config()

const DB_URL = process.env.DB_URL || ""

export {
  DB_URL
}