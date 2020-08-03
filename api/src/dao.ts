import { Game } from '@taros-minesweeper/client'
import { Board, Coord } from '@taros-minesweeper/lib'
import { Collection } from 'mongodb'

interface DaoConfig {
  readonly collection: Collection<Game>
}

export interface Dao {
  readonly getGames: (userId: string) => Promise<readonly Game[]>
  readonly getGameById: (id: string) => Promise<Game | null>
  readonly insert: (game: Game) => Promise<void>
  readonly setBoard: (id: string, board: Board) => Promise<void>
  readonly setWon: (id: string) => Promise<void>
  readonly setLost: (id: string, losePosition: Coord) => Promise<void>
}

export const Dao = ({ collection }: DaoConfig): Dao => {

  const getGames = async (userId: string) => {
    return collection.find({ userId }).toArray()
  }

  const getGameById = async (id: string) => {
    return collection.findOne({ id })
  }

  const insert = async (game: Game) => {
    await collection.insertOne(game)
  }

  const setBoard = async (id: string, board: Board) => {
    await collection.updateOne({ id }, { $set: { board } })
  }

  const setWon = async (id: string) => {
    await collection.updateOne({ id }, { $set: { win: true, endDate: new Date().toISOString() } })
  }

  const setLost = async (id: string, lostPosition: Coord) => {
    await collection.updateOne({ id }, { $set: { lostPosition, lost: true, endDate: new Date().toISOString() } })
  }

  return {
    getGames,
    getGameById,
    insert,
    setBoard,
    setWon,
    setLost,
  }
}
