import dotenv from 'dotenv'
dotenv.config()

const host = process.env.LIVEKIT_HOST || "ws://localhost:7880"
const apiKey = process.env.LIVEKIT_API_KEY || "devkey"
const apiSecret = process.env.LIVEKIT_API_SECRET || "secret"

export {
  host,
  apiKey,
  apiSecret
}