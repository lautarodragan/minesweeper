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
