'use strict'

const boardPieces = Object.freeze({
  NOUGHT: 'O',
  CROSS: 'X',
  EMPTY: ' '
})

const boardState = Object.freeze({
  PLAYING: 'playing',
  CROSS_WIN: 'cross_win',
  NOUGHT_WIN: 'nought_win',
  TIE: 'tie'
})

class Board {
  constructor () {
    this.clearBoard()
    this._state = boardState.PLAYING
    this._winningCellIndices = null
  }

  getCells () {
    return this._cells
  }

  getState () {
    this._winningCellIndices = null
    this._checkForWin()
    return this._state
  }

  getWinningCellIndicies () {
    return [...this._winningCellIndices]
  }

  placeCross (cellIndex) {
    if (cellIndex >= 9) {
      throw new Error('cellIndex should be [0-8]')
    }
    if (this._cells[cellIndex] !== boardPieces.EMPTY) {
      throw new Error('Trying to X on non-empty cell')
    }
    this._cells[cellIndex] = boardPieces.CROSS
  }

  placeNought (cellIndex) {
    if (cellIndex >= 9) {
      throw new Error('cellIndex should be [0-8]')
    }
    if (this._cells[cellIndex] !== boardPieces.EMPTY) {
      throw new Error('Trying to O on non-empty cell')
    }
    this._cells[cellIndex] = boardPieces.NOUGHT
  }

  clearBoard () {
    this._cells = [...boardPieces.EMPTY.repeat(9)]
  }

  _checkForWin () {
    if (this._crossHasWon()) {
      this._state = boardState.CROSS_WIN
    } else if (this._noughtHasWon()) {
      this._state = boardState.NOUGHT_WIN
    } else if (this._boardIsFull()) {
      this._state = boardState.TIE
    } else {
      this._state = boardState.PLAYING
    }
  }

  _boardIsFull () {
    return !this._cells.includes(boardPieces.EMPTY)
  }

  _crossHasWon () {
    return (
      this._rowHasMatch(boardPieces.CROSS) ||
      this._columnHasMatch(boardPieces.CROSS) ||
      this._diagonalHasMatch(boardPieces.CROSS)
    )
  }

  _noughtHasWon () {
    return (
      this._rowHasMatch(boardPieces.NOUGHT) ||
      this._columnHasMatch(boardPieces.NOUGHT) ||
      this._diagonalHasMatch(boardPieces.NOUGHT)
    )
  }

  _rowHasMatch (piece) {
    for (let i = 0; i < 9; i += 3) {
      const row = this._cells.slice(i, i + 3)
      if (row.every(cell => cell === piece)) {
        this._winningCellIndices = [i, i + 1, i + 2]
        return true
      }
    }
    return false
  }

  _columnHasMatch (piece) {
    for (let i = 0; i < 3; i++) {
      const column = [this._cells[i], this._cells[i + 3], this._cells[i + 6]]
      if (column.every(cell => cell === piece)) {
        this._winningCellIndices = [i, i + 3, i + 6]
        return true
      }
    }
    return false
  }

  _diagonalHasMatch (piece) {
    const leftDiagonal = [this._cells[0], this._cells[4], this._cells[8]]
    const rightDiagonal = [this._cells[2], this._cells[4], this._cells[6]]
    if (leftDiagonal.every(cell => cell === piece)) {
      this._winningCellIndices = [0, 4, 8]
      return true
    } else if (rightDiagonal.every(cell => cell === piece)) {
      this._winningCellIndices = [2, 4, 6]
      return true
    }
    return false
  }
}

const pieceSVG = {
  [boardPieces.CROSS]:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  [boardPieces.NOUGHT]:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
  [boardPieces.EMPTY]: ''
}

class BoardView {
  constructor () {
    this._boardDiv = document.querySelector('#board')
    this._gameMessage = document.querySelector('#player_turn')
  }

  renderBoard (board) {
    const boardPieces = board.getCells()
    const boardHTML = boardPieces
      .map((piece, index) => {
        return `<div class="cell" data-cell="${index}">${pieceSVG[piece]}</div>`
      })
      .join('')
    this._boardDiv.innerHTML = boardHTML
  }

  renderPlayerTurn (piece) {
    this._gameMessage.textContent = `Player Turn : ${piece}`
  }

  renderEndGameMessage (endGameState) {
    if (endGameState === boardState.CROSS_WIN) {
      this._gameMessage.textContent = 'X wins!'
    } else if (endGameState === boardState.NOUGHT_WIN) {
      this._gameMessage.textContent = 'O wins!'
    } else if (endGameState === boardState.TIE) {
      this._gameMessage.textContent = "It's a tie!"
    }
  }

  highlightCells (cellIndices) {
    for (const cellIndex of cellIndices) {
      console.log(cellIndex)
      const cellElem = document.querySelector(`.cell[data-cell="${cellIndex}"`)
      cellElem.querySelector('svg')?.classList.add('won')
    }
  }
}

;(function Game () {
  const board = new Board()
  const boardView = new BoardView()

  let currentPlayer = boardPieces.CROSS

  const boardDiv = document.querySelector('#board')
  boardDiv.addEventListener('click', handlePlayerClick)

  const resetButton = document.querySelector('#reset')
  resetButton.addEventListener('click', restartGame)

  restartGame()

  function handlePlayerClick (e) {
    if (e.target.matches('div.cell')) {
      if (currentPlayer === boardPieces.CROSS) {
        tryPlayCross(e.target.dataset.cell)
      } else if (currentPlayer === boardPieces.NOUGHT) {
        tryPlayNought(e.target.dataset.cell)
      }
      boardView.renderBoard(board)
      boardView.renderPlayerTurn(currentPlayer)
      checkForWin()
    }
  }

  function tryPlayCross (cellIndex) {
    try {
      board.placeCross(cellIndex)
      currentPlayer = boardPieces.NOUGHT
    } catch {}
  }

  function tryPlayNought (cellIndex) {
    try {
      board.placeNought(cellIndex)
      currentPlayer = boardPieces.CROSS
    } catch {}
  }

  function restartGame () {
    board.clearBoard()
    currentPlayer = boardPieces.CROSS
    boardView.renderBoard(board)
    boardView.renderPlayerTurn(currentPlayer)
  }

  function checkForWin () {
    const state = board.getState()
    if (state !== boardState.PLAYING) {
      boardView.renderEndGameMessage(state)
      boardView.highlightCells(board.getWinningCellIndicies())
    }
  }
})()
