import { defineEventHandler } from 'h3'
import { roomsList } from '../../utils/roomStore'

export default defineEventHandler(() => {
  return roomsList()
})
