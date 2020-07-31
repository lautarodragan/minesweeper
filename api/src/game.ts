export interface Game {
  readonly id: string
  readonly width: number
  readonly height: number
  readonly mineCount: number
  board: any
  lost: boolean
  won: boolean
}
