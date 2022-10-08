import config from './config/core'
import express, { Express } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import gateway from './gateway/index'
import { connectDB } from './db/global'

const app: Express = express()
connectDB()

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/v1/', gateway)

const port = config.server.port || 5003

app.listen(port, () => console.log(`Server running on port ${port}`))