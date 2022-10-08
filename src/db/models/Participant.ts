import { Schema, model, Types } from 'mongoose'

export interface IParticipant {
  sid?: string,
  username: string,
  room?: Types.ObjectId
}

const ParticipantSchema = new Schema<IParticipant>({
  sid: { type: String, required: true, index: { unique: true } },
  username: { type: String, required: true, index: true },
  room: { type: Types.ObjectId, ref: "Room" }
})

export const Participant = model<IParticipant>('Participant', ParticipantSchema)

export const create = async (data: {
  username: String,
  room: Types.ObjectId,
}): Promise<IParticipant> => {
  let participant = new Participant(data)
  try {
    await participant.save()
  } catch (error: any) {
    if(error.code == 11000)
    {
      throw { message: "DUPLICATE_PARTICIPANT" }
    }
    throw error
  }
  return participant
}

