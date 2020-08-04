import { expect } from 'chai'
import 'mocha'

import {
  hasFlag,
  hasMine,
  isRevealed,
  surroundingMineCount,
  setAll,
  setHasFlag,
  setHasMine,
  setIsRevealed,
  setSurroundingMineCount,
} from '../src/cell'

describe('tile bitwise operators — basic tests', () => {

  it('should correctly set isRevealed to true', () => {
    expect(isRevealed(setIsRevealed(0, true))).to.equal(true)
  })

  it('should correctly set isRevealed to false', () => {
    expect(isRevealed(setIsRevealed(0, false))).to.equal(false)
  })

  it('should correctly set hasMine to true', () => {
    expect(hasMine(setHasMine(0, true))).to.equal(true)
  })

  it('should correctly set hasMine to false', () => {
    expect(hasMine(setHasMine(0, false))).to.equal(false)
  })

  it('should correctly set hasFlag to true', () => {
    expect(hasFlag(setHasFlag(0, true))).to.equal(true)
  })

  it('should correctly set hasFlag to false', () => {
    expect(hasFlag(setHasFlag(0, false))).to.equal(false)
  })

})

describe('tile bitwise operators — setAll — isRevealed', () => {

  it('isRevealed true', () => {
    expect(isRevealed(setAll({ isRevealed: true, hasMine: true, hasFlag: true }))).to.equal(true)
  })

  it('isRevealed true 2', () => {
    expect(isRevealed(setAll({ isRevealed: true, hasMine: true, hasFlag: false }))).to.equal(true)
  })

  it('isRevealed true 3', () => {
    expect(isRevealed(setAll({ isRevealed: true, hasMine: false, hasFlag: true }))).to.equal(true)
  })

  it('isRevealed true 4', () => {
    expect(isRevealed(setAll({ isRevealed: true, hasMine: false, hasFlag: false }))).to.equal(true)
  })

  it('isRevealed false 1', () => {
    expect(isRevealed(setAll({ isRevealed: false, hasMine: false, hasFlag: false }))).to.equal(false)
  })

  it('isRevealed false 2', () => {
    expect(isRevealed(setAll({ isRevealed: false, hasMine: false, hasFlag: true }))).to.equal(false)
  })

  it('isRevealed false 3', () => {
    expect(isRevealed(setAll({ isRevealed: false, hasMine: true, hasFlag: false }))).to.equal(false)
  })

  it('isRevealed false 4', () => {
    expect(isRevealed(setAll({ isRevealed: false, hasMine: true, hasFlag: true }))).to.equal(false)
  })

})

describe('tile bitwise operators — setSurroundingCount', () => {

  it('all true, surrounding 3', () => {
    expect(surroundingMineCount(setSurroundingMineCount(setAll({ isRevealed: true, hasMine: true, hasFlag: true }), 3))).to.equal(3)
  })

  it('all false, surrounding 4', () => {
    expect(surroundingMineCount(setSurroundingMineCount(setAll({ isRevealed: false, hasMine: false, hasFlag: false }), 4))).to.equal(4)
  })

  it('mixed, surrounding 8', () => {
    expect(surroundingMineCount(setSurroundingMineCount(setAll({ isRevealed: false, hasMine: false, hasFlag: true }), 8))).to.equal(8)
  })

  it('mixed, surrounding 1', () => {
    expect(surroundingMineCount(setSurroundingMineCount(setAll({ isRevealed: true, hasMine: false, hasFlag: true }), 1))).to.equal(1)
  })

})
