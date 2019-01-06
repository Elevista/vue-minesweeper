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
      const n = _.clamp(this.mineTotal - this.flagCount, -99, 999)
      return n < 0 ? '-' + _.padStart(Math.abs(n), 2, 0) : _.padStart(n, 3, 0)
    },
    rightNum () {
      return _.padStart(_.clamp(this.timer, 0, 999), 3, 0)
    }
  },
  methods: {
    reset (size, mineTotal = 0) {
      if (size) Object.assign(this, {size, mineTotal})
      this.timer = 0
      this.gameStart = false
      this.flagCount = 0
      this.state = {dead: false, win: false}
      const [height, width] = this.size
      const mines = _.times(this.mineTotal, () => true)
      const empty = _.times(width * height - this.mineTotal, () => false)

      // calculate adjacent mines
      const grid = _(mines).concat(empty).map(x => ({mine: x, adjMine: 0})).shuffle().chunk(width).value()
      grid.forEach((row, rn) => row.forEach((cell, cn) => {
        Object.assign(cell, {rn, cn})
        if (!cell.mine) return
        _(this.$data._adj).map(([r, c]) => _.get(grid, [rn + r, cn + c])).forEach(x => x && x.adjMine++)
      }))
      this.grid = [[]]
      this.$nextTick(() => { this.grid = grid }) // to force re-create component state
    },
    getCellComp (rn, cn) {
      const [height, width] = this.size
      if (rn < 0 || rn >= height || cn < 0 || cn >= width) return
      return this.$refs.cells[width * rn + cn]
    },
    getAdjCellComp (rn, cn) {
      return this.$data._adj.map(([r, c]) => this.getCellComp(rn + r, cn + c)).filter(x => x)
    },
    checkWin () {
      const {state: {dead}, flagCount, openCount, $refs: {cells: {length}}} = this
      if (dead || ((flagCount + openCount) !== length)) return
      this.win()
    },
    win () {
      this.state.win = true
      this.gameStart = false
    },
    dead (cell) {
      this.state.dead = true
      this.gameStart = false
      cell.triggerDead = true // this cell caused dead
    },
    open (cell) {
      if (!cell.doOpen()) return // open fail
      const {rn, cn, mine, adjMine} = cell.data
      if (mine) return this.dead(cell)
      return !adjMine && this.getAdjCellComp(rn, cn)
    },
    openPropagation (cell) {
      if (cell.fixed) return // cell is immutable
      this.gameStart = true
      const queue = [cell]
      while (queue.length) queue.push(...(this.open(queue.shift()) || [])) // Breadth First Search
      this.openCount = _.sumBy(this.$refs.cells, 'open')
      this.checkWin()
    },
    mark (cell) {
      if (!cell.mark()) return // mark fail
      this.flagCount = _.sumBy(this.$refs.cells, 'flag')
      this.checkWin()
    },
    grabAdj (rn, cn) {
      this.selectedAdj = this.getAdjCellComp(rn, cn)
      this.selectedAdj.forEach(cell => { cell.active = true })
    },
    releaseAdj (cell) {
      if (cell && cell.open && (cell.data.adjMine === _.sumBy(this.selectedAdj, 'flag'))) {
        this.selectedAdj.forEach(cell => this.openPropagation(cell))
      }
      this.selectedAdj.forEach(cell => { cell.active = false })
      this.selectedAdj = []
    },
    mousedown ($event, {rn, cn}) {
      this.$set(this.mouseBtn, $event.button, true)
      const [left, , right] = this.mouseBtn
      if (left && right) this.grabAdj(rn, cn)
    },
    mouseout () {
      const [left, , right] = this.mouseBtn
      if (left && right) this.releaseAdj(false)
      this.mouseBtn = [false, false, false]
    },
    mouseup ($event, {rn, cn}) {
      const cell = this.getCellComp(rn, cn)
      const [left, , right] = this.mouseBtn
      if (left && right) this.releaseAdj(cell)
      else if (left) this.openPropagation(cell)
      else if (right) this.mark(cell)
      this.mouseBtn = [false, false, false]
    }
  },
  destroyed () { clearInterval(this.timerInterval) },
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
