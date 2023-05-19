import { Position } from '@turf/turf'

export type Plane = {
  launches: Launch[]
}

export type Launch = {
  origin: Position
  heading: number
  timestamp: number
}
