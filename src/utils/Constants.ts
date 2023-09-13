export interface UserProps {
  name: string
  color: string
  aboutMe: string
  bosom: string[]
  taskDates: string[]
  saved: TimeSlotProps[]
  avatar: string
  notifications: string[]
}

export interface TimeSlotProps {
  id: string
  start: string
  end: string
  username: string
  description: string
  isAvail: boolean
  isPublic: boolean
  iso: string
}


export interface SnakeProps {
  body: Array<Array<number>>
}

export interface RecordProps {
  id: string
  ranking: number
  user: UserProps
  score: number
  details: string
}