import express, { Router, Request, Response } from 'express'
import { AccessToken, RoomServiceClient, Room } from 'livekit-server-sdk'
import livekitConfig from '../config/livekit'

const router: Router = express.Router()
const livekitHost = livekitConfig.host||"ws://localhost:7880";

router.get('/', async (req: Request, res: Response, next): Promise<void> => {
  const svc = new RoomServiceClient(livekitHost);
  svc.listRooms().then((rooms: Room[]) => {
    res.json({
      success: true,
      data: rooms
    })
  }).catch(error => {
    res.json({
      success: false,
      message: error.message?error.message:error
    })
  })
})

router.post('/join', async (req: Request, res: Response, next): Promise<void> => {

  const {room, participant}: { room: string, participant: string } = req.body

  try {

    const roomName = room
    const participantName = participant

    const at = new AccessToken(undefined, undefined, {
      identity: participantName,
    })

    at.addGrant({ roomJoin: true, room: roomName });

    const token = at.toJwt()
    
    res.json({
      success: true,
      data: token
    })

  } catch(err: any) {
    let message = err.message?err.message:err
    res.json({
      success: false,
      message: message
    })
  }
})

router.post('/create', async (req: Request, res: Response, next): Promise<void> => {

  const {room: name}: { room: string } = req.body

  try {
    
    const svc = new RoomServiceClient(livekitHost)

    const opts = {
      name: name,
      emptyTimeout: 10 * 60, // timeout in seconds
      maxParticipants: 5,
    };

    let room = await svc.createRoom(opts)
    
    res.json({
      success: true,
      data: room
    })

  } catch(err: any) {
    let message = err.message?err.message:err
    res.json({
      success: false,
      message: message
    })
  }
})

router.post('/mute', async (req: Request, res: Response, next): Promise<void> => {

  const {room, identity}: { room: string, identity: string } = req.body

  try {
    
    const svc = new RoomServiceClient(livekitHost)

    let participantInfo = await svc.updateParticipant(room, identity, undefined, {
      canSubscribe: true,
      canPublish: false,
      canPublishData: false,
      hidden: false,
      recorder: true
    })
    
    res.json({
      success: true,
      data: participantInfo
    })

  } catch(err: any) {
    let message = err.message?err.message:err
    res.json({
      success: false,
      message: message
    })
  }
})

router.post('/unmute', async (req: Request, res: Response, next): Promise<void> => {

  const {room, identity}: { room: string, identity: string } = req.body

  try {
    
    const svc = new RoomServiceClient(livekitHost)

    let participantInfo = await svc.updateParticipant(room, identity, undefined, {
      canSubscribe: true,
      canPublish: true,
      canPublishData: true,
      hidden: false,
      recorder: true
    })
    
    res.json({
      success: true,
      data: participantInfo
    })

  } catch(err: any) {
    let message = err.message?err.message:err
    res.json({
      success: false,
      message: message
    })
  }
})

router.post('/leave', async (req: Request, res: Response, next): Promise<void> => {

  const {room, identity}: { room: string, identity: string } = req.body

  try {
    
    

  } catch(err: any) {
    let message = err.message?err.message:err
    res.json({
      success: false,
      message: message
    })
  }
})

router.post('/skip-turn', async (req: Request, res: Response, next): Promise<void> => {

  const {room, identity}: { room: string, identity: string } = req.body

  try {
    
    

  } catch(err: any) {
    let message = err.message?err.message:err
    res.json({
      success: false,
      message: message
    })
  }
})

export default router