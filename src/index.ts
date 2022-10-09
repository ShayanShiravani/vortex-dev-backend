import config from './config/core'
import express, { Express } from 'express'
import cors from 'cors'
import gateway from './gateway/index'
import webhook from './gateway/webhook'
import { connectDB } from './db/global'

const app: Express = express()
connectDB()

app.use(cors({ origin: true, credentials: true }))
app.use('/v1/', gateway)
app.use('/webhook/', webhook)

const port = config.server.port || 5003

app.listen(port, () => console.log(`Server running on port ${port}`))