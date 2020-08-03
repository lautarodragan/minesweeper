import { Collection } from 'mongodb'

import { Game } from './game'

interface DaoConfig {
  readonly collection: Collection<Game>
}

export interface Dao {
  readonly getGames: (userId: string) => Promise<readonly Game[]>
  readonly getGameById: (id: string) => Promise<Game | null>
  readonly insert: (game: Game) => Promise<void>
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

  return {
    getGames,
    getGameById,
    insert,
  }
}
