import cell from './cell.vue'

export default {
  name: 'minesweeper',
  data () {
    return {
      grid: [[]],
      state: {dead: false, win: false},
      gameStart: false,
      size: [9, 9],
      openCount: 0,
      flagCount: 0,
      mineTotal: 10,
      timer: 0,
      timerInterval: null,
      mouseBtn: [false, false, false],
      selectedAdj: [],
      _adj: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    }
  },
  created () { this.reset() },
  computed: {
    leftNum () {
      let n = _.clamp(this.mineTotal - this.flagCount, -99, 999)
      return n < 0 ? '-' + _.padStart(Math.abs(n), 2, 0) : _.padStart(n, 3, 0)
    },
    rightNum () {
      return _.padStart(Math.min(this.timer, 999), 3, 0)
    }
  },
  methods: {
    reset (size, mineTotal = 0) {
      if (size) Object.assign(this, {size, mineTotal})
      this.timer = 0
      this.gameStart = false
      this.flagCount = 0
      this.state = {dead: false, win: false}
      let [height, width] = this.size
      let mines = _.times(this.mineTotal, () => true)
      let empty = _.times(width * height - this.mineTotal, () => false)
      this.mineTotal = mines.length
      let grid = _(mines).concat(empty).map(x => ({mine: x, adjMine: 0})).shuffle().chunk(width).value()

      // calculate adjacent mines
      grid.forEach((row, rn) => row.forEach((cell, cn) => {
        Object.assign(cell, {rn, cn})
        if (!cell.mine) return
        _(this.$data._adj).map(([r, c]) => _.get(grid, [rn + r, cn + c])).forEach(x => x && x.adjMine++)
      }))
      this.grid = [[]]
      this.$nextTick(() => { this.grid = grid }) // to force re-create component state
    },
    getCellComp (rn, cn) {
      let [height, width] = this.size
      if (rn < 0 || rn >= height || cn < 0 || cn >= width) return
      return this.$refs.cells[width * rn + cn]
    },
    getAdjCellComp (rn, cn) {
      return this.$data._adj.map(([r, c]) => this.getCellComp(rn + r, cn + c)).filter(x => x)
    },
    checkWin () {
      let {state: {dead}, flagCount, openCount, $refs: {cells: {length}}} = this
      if (dead || ((flagCount + openCount) !== length)) return
      this.win()
    },
    win () {
      this.state.win = true
      this.gameStart = false
    },
    dead (cell) {
      this.gameStart = false
      this.state.dead = true
      cell.triggerDead = true // this cell caused dead
      this.$refs.cells.forEach(x => { x.open = true })
    },
    open (cell) {
      if (!cell || !cell.doOpen()) return // open fail
      let {rn, cn, mine, adjMine} = cell.data
      if (mine) return this.dead(cell)
      return !adjMine && this.getAdjCellComp(rn, cn)
    },
    openPropagation (cell) {
      if (!cell.open) this.gameStart = true
      let queue = [cell]
      while (queue.length) queue.push(...(this.open(queue.shift()) || [])) // Breadth First Search
      this.openCount = _.sumBy(this.$refs.cells, 'open')
      this.checkWin()
    },
    mark () {
      this.flagCount = _.sumBy(this.$refs.cells, 'flag')
      this.checkWin()
    },
    grabAdj (rn, cn) {
      this.selectedAdj = this.getAdjCellComp(rn, cn)
      this.selectedAdj.forEach(cell => cell && (cell.active = true))
    },
    releaseAdj (cell) {
      if (cell && cell.open && (cell.data.adjMine === _.sumBy(this.selectedAdj, 'flag'))) {
        this.selectedAdj.forEach(cell => this.openPropagation(cell))
      }
      this.selectedAdj.forEach(cell => cell && (cell.active = false))
      this.selectedAdj = []
    },
    mousedown ($event, rn, cn) {
      this.$set(this.mouseBtn, $event.button, true)
      if (this.mouseBtn[0] && this.mouseBtn[2]) this.grabAdj(rn, cn)
    },
    mouseout () {
      if (this.mouseBtn[0] && this.mouseBtn[2]) this.releaseAdj(false)
      this.mouseBtn = [false, false, false]
    },
    mouseup ($event, rn, cn) {
      let cell = this.getCellComp(rn, cn)
      if (this.mouseBtn[0] && this.mouseBtn[2]) this.releaseAdj(cell)
      else if (this.mouseBtn[0]) this.openPropagation(cell)
      else if (this.mouseBtn[2]) cell.mark()
      this.mouseBtn = [false, false, false]
    }
  },
  watch: {
    gameStart (truthy) {
      if (truthy) {
        this.timer = 1
        this.timerInterval = setInterval(() => this.timer++, 1000)
      } else {
        this.timerInterval = clearInterval(this.timerInterval)
      }
    }
  },
  components: {cell},
  templateSrc: './minesweeper.html',
  styleSrc: './minesweeper.css'
}
