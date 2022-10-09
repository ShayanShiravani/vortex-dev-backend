
import express, { Router } from 'express'
import { WebhookEvent } from 'livekit-server-sdk/dist/proto/livekit_webhook'
import { setParticipantNo, setRoomTurn } from '../utils/livekit'
import { apiKey, apiSecret } from '../config/livekit'
import { WebhookReceiver } from 'livekit-server-sdk'
import { getCurrentTimestamp } from '../utils/common'

const router: Router = express.Router()
const receiver = new WebhookReceiver(apiKey, apiSecret)

router.use(express.raw())
router.post('/', async (req, res): Promise<void> => {
  try {
    const event: WebhookEvent = receiver.receive(req.body, req.get('Authorization'))
    switch (event.event) {
      case 'room_started':
        break
      case 'room_finished':
        break
      case 'participant_joined':
        console.log(event)
        const { room, participant } = event
        if(!room || !participant) {
          return
        }
        const no = room.numParticipants + 1
        setParticipantNo(room.name, participant.identity, no)
        setRoomTurn(room.name, no, getCurrentTimestamp())
        break
      case 'participant_left':
        break
      default:
        break
    }
  } catch (error: any) {
    console.log(error.message?error.message:error)
  }

})

export default router