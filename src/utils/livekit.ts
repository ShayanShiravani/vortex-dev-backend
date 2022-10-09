import { ParticipantInfo, Room, RoomServiceClient } from "livekit-server-sdk";
import { host as livekitHost } from '../config/livekit'

const svc = new RoomServiceClient(livekitHost)

export const getRoom = async (name: string): Promise<Room | undefined> => {

  const rooms = await getAllRooms()
  if(rooms) {
    return rooms.find(room => room.name === name) 
  }
  return
}

export const getAllRooms = async (): Promise<Room[] | undefined> => {
  
  return svc.listRooms().then((rooms: Room[]) => {
    return rooms
  }).catch(error => {
    console.log(error.message?error.message:error)
    return undefined
  })

}

export const createRoom = async (name: string): Promise<Room> => {

  const opts = {
    name: name,
    emptyTimeout: 10 * 60, // timeout in seconds
    maxParticipants: 5,
  }

  return await svc.createRoom(opts)
}

export const getRoomParticipants = async (room: string): 
  Promise<ParticipantInfo[] | undefined> => {
    return svc.listParticipants(room)
      .then(
        (participants: ParticipantInfo[]) => {
          return participants
        }
      )
      .catch(error => {
        console.log(error.message?error.message:error)
        return undefined
      })
}

export const getParticipant = async (room: string, identity: string): 
  Promise<ParticipantInfo | undefined> => {
    return svc.getParticipant(room, identity)
      .then(
        (participant: ParticipantInfo) => {
          return participant
        }
      )
      .catch(error => {
        console.log(error.message?error.message:error)
        return undefined
      }) 
  }

export const setParticipantNo = 
  async (room: string, identity: string, no: number) => {
    const metadata = JSON.stringify({
      no: no
    })
    return svc.updateParticipant(room, identity, metadata)
      .then(
        (participant: ParticipantInfo) => {
          return participant
        }
      )
      .catch(error => {
        console.log(error.message?error.message:error)
        return undefined
      })
  }

export const extractLastParticipant = async (room: string): 
  Promise<ParticipantInfo | undefined> => {
    let participants = await getRoomParticipants(room)
    let result = undefined
    let lastNo = 0
    if(participants) {
      participants.map(p => {
        const metadata = JSON.parse(p.metadata)
        if(metadata.no > lastNo) {
          result = p
          lastNo = metadata.no
        }
      })
    }
    return result
  }

export const setRoomTurn = 
  async (room:string, currentNo: number, startTime: number): 
  Promise<Room | undefined> => {
    const metadata = JSON.stringify({
      no: currentNo,
      start_time: startTime.toString(),
      end_time: startTime + ( 1 * 60 )
    })
    return svc.updateRoomMetadata(room, metadata)
      .then(
        (room: Room) => {
          return room
        }
      )
      .catch(error => {
        console.log(error.message?error.message:error)
        return undefined
      })
  }

export const changeParticipantStatus = 
  async (room: string, participant: ParticipantInfo, canPublish: boolean):
  Promise<ParticipantInfo | undefined> => {
    return svc.updateParticipant(room, participant.identity, participant.metadata, {
      canSubscribe: true,
      canPublish: canPublish,
      canPublishData: true,
      hidden: false,
      recorder: true
    })
    .then(
      (participant: ParticipantInfo) => {
        return participant
      }
    )
    .catch(error => {
      console.log(error.message?error.message:error)
      return undefined
    })
  }

