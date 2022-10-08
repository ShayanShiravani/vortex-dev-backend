import { Schema, model, Types } from 'mongoose'

export interface IRoom {
  sid: string,
  name: string,
  maxParticipants: number,
  creationTime: Date,
  participants: any[]
}

const RoomSchema = new Schema<IRoom>({
  sid: { type: String, required: true, index: { unique: true } },
  name: { type: String, required: true, index: { unique: true } },
  maxParticipants: { type: Number, required: true },
  creationTime: { type: Date, required: true },
  participants: [{ type: Types.ObjectId, ref: "Participant" }]
})

export const Room = model<IRoom>('Room', RoomSchema)

export const create = async (data: {
  sid: String,
  name: String,
  maxParticipants: Number,
  creationTime: Date
}): Promise<IRoom> => {
  let room = new Room(data)
  try {
    await room.save()
  } catch (error: any) {
    if(error.code == 11000)
    {
      throw { message: "DUPLICATE_ROOM" }
    }
    throw error
  }
  return room
}

