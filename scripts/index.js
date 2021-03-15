import store from './store.js'
import sudoku from './sudoku.js'
import './calert.min.js'
import { removeChilds, tag } from './utils.js'
import { initialOption, difficulties, SUDOKU_KEY } from './const.js'

const sudokuTable = document.querySelector('#sudokuTable')
const sudokuRows = sudokuTable.querySelectorAll('.sudoku-row')

const sudokuState = store(initialOption.sudokuState)

let {
  selectedArea,
  initialState,
  undoHistory,
  detectErrors,
  difficulty,
} = initialOption

let sudokuErrors = []

function isError(row, col) {
  for (let i = 0; i < sudokuErrors.length; i++) {
    const [rowErr, colErr] = sudokuErrors[i]
    if (rowErr === row && colErr === col) return true
  }
  return false
}

function renderSudokuTable(state) {
  state.forEach((rows, rowIndex) => {
    const sudokuTableRow = sudokuRows[rowIndex]
    const sudokuTableCols = sudokuTableRow.querySelectorAll('div')

    rows.forEach((colValue, colIndex) => {
      const isInitialState = initialState[rowIndex][colIndex] !== '.'
      const [row, col] = selectedArea

      removeChilds(sudokuTableCols[colIndex])

      tag(sudokuTableCols[colIndex], {
        className: row === rowIndex && col === colIndex ? 'selected' : '', // Add class to selected area
        onclick:
          isInitialState || // Add Function only if it is not the given generated sudoku squares
          function () {
            document
              .querySelector('.sudoku-row .selected ')
              .classList.remove('selected')

            this.classList.add('selected')
            selectedArea = [rowIndex, colIndex]
            saveOptions()
          },
        appendTo: sudokuTableRow,
        appendChild: tag('span', {
          className:
            detectErrors && isError(rowIndex, colIndex)
              ? 'error-value'
              : isInitialState
              ? 'initial-value'
              : '',
          innerText: colValue === '.' ? '' : colValue,
        }),
      })
    })
  })
}

// If the number is fully use then add the style
function disableNumbersButton(state) {
  const stringState = sudoku.board_grid_to_string(state)
  numbersButton.forEach((btn) => {
    const variant = btn.dataset.variant
    if (variant === '.') return

    const exceptionRegex = new RegExp(`[^${variant}]`, 'g')
    const parsedText = stringState.replace(exceptionRegex, '')

    if (parsedText.length >= 9) {
      btn.classList.add('fully-used')
    } else {
      btn.classList.remove('fully-used')
    }
  })
}

// Save states to Local Storage
function saveOptions() {
  localStorage.setItem(
    SUDOKU_KEY,
    JSON.stringify({
      selectedArea,
      initialState,
      sudokuState: sudokuState.state,
      undoHistory,
      detectErrors,
      difficulty,
    }),
  )
}

// Detect all the errors with format of [row,col]
function detectError(state) {
  sudokuErrors = []
  const solvedState = sudoku.board_string_to_grid(
    sudoku.solve(sudoku.board_grid_to_string(initialState)),
  )
  state.forEach((rows, rowIndex) => {
    rows.forEach((colValue, colIndex) => {
      if (colValue !== solvedState[rowIndex][colIndex]) {
        sudokuErrors.push([rowIndex, colIndex])
      }
    })
  })
}

// Subscriber if the sudoku state is change this will call the callback
sudokuState.subscribe((state) => {
  detectErrors && detectError(state)
  disableNumbersButton(state) // disable specific button if the numbers use 9 times

  renderSudokuTable(state)

  saveOptions()
})

async function toolsAction(action) {
  switch (action) {
    case 'reset':
      const res = await calert(
        'Reset',
        'Are you sure want to reset the board ?',
        'warning',
        {
          confirmButton: 'Yes',
          cancelButton: 'No',
        },
      )
      if (res.isConfirmed) {
        sudokuState.set(JSON.parse(JSON.stringify(initialState)))
        undoHistory = []
      }
      break
    case 'undo':
      if (undoHistory.length === 0) return
      const undoState = undoHistory.pop()
      sudokuState.set(undoState)
      break
    case 'solve':
      const result = await calert({
        title: 'Solve',
        text: 'Are you sure want to completely solved the board ?',
        icon: 'warning',
        confirmButton: 'Yes',
        cancelButton: 'No',
      })
      if (result.isConfirmed) {
        undoHistory = []

        const solveState = sudoku.board_string_to_grid(
          sudoku.solve(sudoku.board_grid_to_string(initialState)),
        )

        sudokuState.set(solveState)
      }
      break
    case 'toggleAutomaticErrorDetection':
      detectErrors = !detectErrors
      this.className = detectErrors ? 'active' : ''
      sudokuState.update((v) => v)
      break
    default:
      break
  }
  saveOptions()
}

function playAgain(difficultyLevel) {
  difficulty = difficultyLevel || difficulty
  const newInitialState = sudoku.board_string_to_grid(
    sudoku.generate(difficulties[difficulty]),
  )
  initialState = newInitialState

  sudokuState.set(JSON.parse(JSON.stringify(newInitialState)))
  undoHistory = []
  saveOptions()
}

async function handleDifficultyClick() {
  const currentActive = document.querySelector('.difficulty .active')
  if (currentActive === this) return
  const difficultyLevel = this.dataset.variant

  const res = await calert({
    text: `Are you sure you want to change the difficulty to ${difficultyLevel}? (It will change the board numbers)`,
    icon: 'question',
    cancelButton: 'No',
    confirmButton: 'Yes',
  })
  if (res.isConfirmed) {
    playAgain(difficultyLevel)
    currentActive.className = ''
    this.className = 'active'
  }
}

function handleWinner(state) {
  const stringState = sudoku.board_grid_to_string(state)
  if (stringState.indexOf('.') === -1) {
    if (
      sudoku.solve(sudoku.board_grid_to_string(initialState)) === stringState
    ) {
      calert('You solve the board', '', 'success', {
        confirmButton: 'Play Again',
        buttons: {
          review: 'Review Board',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          playAgain()
        }
      })
    } else {
      calert('', 'The board has some mistakes', 'error')
    }
  }
}

const numbersButton = document.querySelectorAll('.numbers button')
const toolsBtn = document.querySelectorAll('.tools button')
const difficultyBtn = document.querySelectorAll('.difficulty button')

function initializeNumbersBtn() {
  numbersButton.forEach((btn) => {
    btn.addEventListener('click', function () {
      const [row, col] = selectedArea

      sudokuState.update((state) => {
        undoHistory.push(JSON.parse(JSON.stringify(state))) // Deep clone the array
        if (initialState[row][col] !== '.') return state

        state[row][col] = btn.dataset.variant
        handleWinner(state)
        return state
      })
    })
  })
}

function initializeToolsBtn() {
  toolsBtn.forEach((btn) => {
    btn.addEventListener('click', function () {
      toolsAction.call(btn, btn.dataset.variant)
    })
  })
}
function initializeDifficultyBtn() {
  difficultyBtn.forEach((btn) => {
    btn.addEventListener('click', handleDifficultyClick)
  })
}

// Initialize
;(() => {
  // Add active classname on specific difficulty variant in dom
  document.querySelector(`[data-variant=${difficulty}]`).className = 'active'

  // Add active classname if the detectERrors in local storage is true
  document.querySelector(
    '[data-variant=toggleAutomaticErrorDetection]',
  ).className = detectErrors ? 'active' : ''

  detectErrors && detectError(sudokuState.state)

  renderSudokuTable(sudokuState.state)
  disableNumbersButton(sudokuState.state)
  initializeNumbersBtn()
  initializeToolsBtn()
  initializeDifficultyBtn()
})()

window.addEventListener('keydown', (e) => {
  const arrowKeys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
  if (/1|2|3|4|5|6|7|8|9|\s|0/.test(e.key)) {
    e.preventDefault()

    // If the key is not 0 and spacebar
    if (e.key !== '0' && e.key !== ' ') {
      document.querySelector(`[data-variant='${e.key}']`).click()
    } else {
      document.querySelector(`[data-variant='.']`).click() // Spacebar Button
    }
    return
  }
})
