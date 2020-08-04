export enum CellValue {
  UnknownClear,
  UnknownMine,
  KnownClear,
  KnownMine,
  UnknownClearFlag,
  UnknownMineFlag,
}

export const toggleFlag = (value: CellValue): CellValue => {
  if (value === CellValue.UnknownClear)
    return CellValue.UnknownClearFlag
  else if (value === CellValue.UnknownMine)
    return CellValue.UnknownMineFlag
  else if (value === CellValue.UnknownClearFlag)
    return CellValue.UnknownClear
  else if (value === CellValue.UnknownMineFlag)
    return CellValue.UnknownMine
  throw new Error("This cell can't be flagged.")
}

export const isUnknown = (value: CellValue): boolean =>
  [CellValue.UnknownClear, CellValue.UnknownMine, CellValue.UnknownClearFlag, CellValue.UnknownMineFlag].includes(value)

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

export const setAll = (tile: Tile) =>
  setHasFlag(setHasMine(setIsRevealed(0, tile.isRevealed), tile.hasMine), tile.hasFlag)
