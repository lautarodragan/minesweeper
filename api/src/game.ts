import { Coord } from '@taros-minesweeper/lib'

export interface Game {
  readonly userId: string
  readonly id: string
  readonly creationDate: string
  readonly width: number
  readonly height: number
  readonly mineCount: number
  board: any
  lost: boolean
  lostPosition?: Coord
  won: boolean
}
