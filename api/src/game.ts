import { Coord } from '@taros-minesweeper/lib'

export interface Game {
  readonly userId: string
  readonly id: string
  readonly creationDate: string
  readonly endDate?: string
  readonly width: number
  readonly height: number
  readonly mineCount: number
  readonly board: any
  readonly lost: boolean
  readonly lostPosition?: Coord
  readonly won: boolean
}
