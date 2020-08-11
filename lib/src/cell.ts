export interface Tile {
  readonly isRevealed: boolean
  readonly hasMine: boolean
  readonly hasFlag: boolean
}

const isRevealedMask = 1
const hasMineMask = 1 << 1
const hasFlagMask = 1 << 2
const surroundingMineCountMask = 0xF << 3

export const isRevealed = (value: number) => !!(value & isRevealedMask)
export const hasMine = (value: number) => !!(value & hasMineMask)
export const hasFlag = (value: number) => !!(value & hasFlagMask)
export const surroundingMineCount = (value: number) => (value >> 3) & 0xF

export const setIsRevealed = (value: number, isRevealed: boolean): number =>
  isRevealed ? value | isRevealedMask : (value & (~isRevealedMask & 0xFF))
export const setHasMine = (value: number, hasMine: boolean) =>
  hasMine ? value | hasMineMask : (value & (~hasMineMask & 0xFF))
export const setHasFlag = (value: number, hasFlag: boolean) =>
  hasFlag ? value | hasFlagMask : (value & (~hasFlagMask & 0xFF))
export const setSurroundingMineCount = (value: number, surroundingMineCount: number) =>
  value & (~surroundingMineCountMask & 0xFF) | surroundingMineCount << 3

export const toggleFlag = (value: number): number => value ^ hasFlagMask

export const getAll = (tile: number): Tile => ({
  isRevealed: isRevealed(tile),
  hasMine: hasMine(tile),
  hasFlag: hasFlag(tile),
})

export const setAll = (tile: Tile) =>
  setHasFlag(setHasMine(setIsRevealed(0, tile.isRevealed), tile.hasMine), tile.hasFlag)
