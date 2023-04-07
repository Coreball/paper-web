import { Feature, Point } from '@turf/turf'

export type Plane = {
  origin: Feature<Point>
  heading: number
  timestamp: number
}
