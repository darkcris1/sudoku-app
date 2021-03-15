import sudoku from './sudoku.js'

const SUDOKU_KEY = 'SUDUKO_INITIAL_STATE_KEY'

const difficulties = {
  easy: 43, // Number of squares to be given
  medium: 35,
  hard: 29,
}

const defaultDifficulty = difficulties['easy']
const initialSudokuState = sudoku.generate(defaultDifficulty)

const defaultOption = {
  sudokuState: sudoku.board_string_to_grid(initialSudokuState), // I call this twice because of reference value of array
  initialState: sudoku.board_string_to_grid(initialSudokuState),
  selectedArea: [0, 0], // [row,column]
  difficulty: 'easy',
  undoHistory: [],
  detectErrors: false,
}
const initialOption =
  JSON.parse(localStorage.getItem(SUDOKU_KEY)) || defaultOption

export { difficulties, initialOption, SUDOKU_KEY }
