import { Position } from '@turf/turf'

export type Plane = {
  id: string
  launches: Launch[]
}

export type Launch = {
  origin: Position
  heading: number
  timestamp: number
  stamp: Stamp
}

export type Stamp = {
  x: number
  y: number
  angle: number
  text: string
  variant: number
}
