import { Coord } from '@taros-minesweeper/lib'

export interface Game {
  readonly id: string
  readonly width: number
  readonly height: number
  readonly mineCount: number
  board: any
  lost: boolean
  lostPosition?: Coord
  won: boolean
}
