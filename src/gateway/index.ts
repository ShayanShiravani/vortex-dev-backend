import express, { Router, Request, Response } from 'express'
import { AccessToken } from 'livekit-server-sdk'
import { body, validationResult } from 'express-validator'
import bodyParser from 'body-parser'
// import db from "../db/models"
// import { create as createRoom } from "../db/models/Room"
// import { create as createParticipant } from "../db/models/Participant"
import { changeParticipantMetadata, changeParticipantStatus, createRoom, getAllRooms, getParticipant, 
  getRoom, getRoomParticipants, setRoomTurn } from '../utils/livekit'
import { getCurrentTimestamp } from '../utils/common'

const router: Router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/', async (req: Request, res: Response, next): Promise<void> => {

  let result = await getAllRooms()
  if(result) {
    res.json({
      success: true,
      data: result
    })
  } else {
    res.json({
      success: false,
      message: "LIVEKIT_ERROR"
    })
  }

})

router.post('/join', 
  body('room').isString().not().isEmpty().trim().escape(),
  body('participant').isString().not().isEmpty().trim().escape(),
  async (req: Request, res: Response, next): Promise<void> => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({
        success: false,
        message: "INVALID_PARAMS"
      })
      return next()
    }

    const {room: roomName, participant: participantName}: 
    { room: string, participant: string } = req.body

    try {

      // let room = await db.Room.
      //   findOne({ name: roomName })
      //   .populate({
      //     path: 'participants', 
      //     match: { username: participantName }
      //   })
      //   .exec()

      // if(!room) {
      //   res.json({
      //     success: false,
      //     message: "INVALID_ROOM"
      //   })
      //   return next()
      // }

      let room = await getRoom(roomName)
      if(!room) {
        res.json({
          success: false,
          message: "INVALID_ROOM"
        })
        return next()
      }
      
      if(await getParticipant(roomName, participantName)) {
        res.json({
          success: false,
          message: "DUPLICATE_USERNAME"
        })
        return next()
      }

      const at = new AccessToken(undefined, undefined, {
        identity: participantName,
      })
      at.addGrant(
        { 
          roomJoin: true, 
          room: roomName, 
          // canPublish: room.numParticipants < 1 ? true : false 
        }
      )
      const token = at.toJwt()

      // if(at) {
      //   let participant = await createParticipant({
      //     username: participantName,
      //     room: room._id
      //   })

      //   room.participants.push(participant)
      //   room.save()
        
      //   res.json({
      //     success: true,
      //     data: token
      //   })
      // }
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

router.post(
  '/create', 
  body('room').isString().not().isEmpty().trim().escape(), 
  async (req: Request, res: Response, next): Promise<void> => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({
        success: false,
        message: "INVALID_PARAMS"
      })
      return next()
    }

    const {room: name}: { room: string } = req.body

    try {
      // if(await db.Room.exists({ name: name })) {
      //   res.json({
      //     success: false,
      //     message: "DUPLICATE_NAME"
      //   })
      //   return next()
      // }
      if(await getRoom(name)) {
        res.json({
          success: false,
          message: "DUPLICATE_NAME"
        })
        return next()
      }

      let room = await createRoom(name)

      if(room) {
        // await createRoom({
        //   sid: room.sid,
        //   name: room.name,
        //   maxParticipants: room.maxParticipants,
        //   creationTime: new Date(room.creationTime * 1000)
        // })
        res.json({
          success: true,
          data: room
        })
        return next()
      }

    } catch(err: any) {
      let message = err.message?err.message:err
      res.json({
        success: false,
        message: message
      })
      return next()
    }
})

router.post('/change-turn', 
  body('room').isString().not().isEmpty().trim().escape(),
  async (req: Request, res: Response, next): Promise<void> => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({
        success: false,
        message: "INVALID_PARAMS"
      })
      return next()
    }

    const {room: roomName}: { room: string } = req.body

    try {
      let room = await getRoom(roomName)
      if(!room) {
        res.json({
          success: false,
          message: "INVALID_ROOM"
        })
        return next()
      }

      const rMetadata = JSON.parse(room.metadata)

      if(
        getCurrentTimestamp() < rMetadata.end_time || 
        room.numParticipants <= 1
      ) {
        res.json({
          success: false,
          message: "INVALID_REQUEST"
        })
        return next()
      }
      
      const currentNo = rMetadata.no == room.numParticipants ? 1 : rMetadata.no + 1
      const participants = await getRoomParticipants(roomName)

      const prevParticipant = participants?.find(p => {
        const pMetadata = JSON.parse(p.metadata)
        return pMetadata.no == rMetadata.no
      })
      const currentParticipant = participants?.find(p => {
        const pMetadata = JSON.parse(p.metadata)
        return pMetadata.no == currentNo
      })

      setRoomTurn(roomName, currentNo, getCurrentTimestamp())

      // if(prevParticipant && prevParticipant.permission?.canPublish) {
      //   await changeParticipantStatus(roomName, prevParticipant.identity, false)
      // }
      // setTimeout(async () => {
      //   if(currentParticipant && !currentParticipant.permission?.canPublish) {
      //     await changeParticipantStatus(roomName, currentParticipant.identity, true)
      //   }
      // }, 20000);

      if(prevParticipant) {
        await changeParticipantMetadata(roomName, prevParticipant, false)
      }
      if(currentParticipant) {
        await changeParticipantMetadata(roomName, currentParticipant, true)
      }

      res.json({
        success: true,
        data: "TURN_CHANGED"
      })

    } catch(err: any) {
      let message = err.message?err.message:err
      res.json({
        success: false,
        message: message
      })
    }
  })

router.post('/skip-turn', 
  body('room').isString().not().isEmpty().trim().escape(),
  body('identity').isString().not().isEmpty().trim().escape(),
  async (req: Request, res: Response, next): Promise<void> => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({
        success: false,
        message: "INVALID_PARAMS"
      })
      return next()
    }

    const {room: roomName, identity}: { room: string, identity: string } = req.body

    try {
      let room = await getRoom(roomName)
      if(!room) {
        res.json({
          success: false,
          message: "INVALID_ROOM"
        })
        return next()
      }

      let participant = await getParticipant(roomName, identity)

      if(!participant) {
        res.json({
          success: false,
          message: "INVALID_PARTICIPANT"
        })
        return next()
      }

      const pMetadata = JSON.parse(participant.metadata)
      const rMetadata = JSON.parse(room.metadata)

      if(pMetadata.no != rMetadata.no || room.numParticipants <= 1) {
        res.json({
          success: false,
          message: "INVALID_REQUEST"
        })
        return next()
      }
      
      const nextNo = rMetadata.no == room.numParticipants ? 1 : rMetadata.no + 1
      const participants = await getRoomParticipants(roomName)

      const nextParticipant = participants?.find(p => {
        const cMetadata = JSON.parse(p.metadata)
        return cMetadata.no == nextNo
      })

      setRoomTurn(roomName, nextNo, getCurrentTimestamp())
      // await changeParticipantStatus(roomName, participant.identity, false)
      // if(nextParticipant) {
      //   await changeParticipantStatus(roomName, nextParticipant.identity, true)
      // }
      await changeParticipantMetadata(roomName, participant, false)
      if(nextParticipant) {
        await changeParticipantMetadata(roomName, nextParticipant, true)
      }

      res.json({
        success: true,
        data: "TURN_SKIPPED"
      })

    } catch(err: any) {
      let message = err.message?err.message:err
      res.json({
        success: false,
        message: message
      })
    }

  })

export default router