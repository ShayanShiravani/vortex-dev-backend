import { DB_URL } from "../config/db"
import { connect } from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    await connect(DB_URL)
    console.log('DB is Connected...')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}