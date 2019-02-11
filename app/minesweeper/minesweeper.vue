
<template>
<div @contextmenu.prevent class="minesweeper">
  <div class="indicator">
    <div class="left">
      <span class="count" v-for="(x,i) of leftNum" :key="i" :class="'n'+x">{{x}}</span>
    </div>
    <button class="smiley" :class="[state,{ooh}]" @click="reset()"></button>
    <div class="right">
      <span class="count" v-for="(x,i) of rightNum" :key="i" :class="'n'+x">{{x}}</span>
    </div>
  </div>

  <div class="board">
    <div v-for="(row,i) of grid" class="row" :key="i">
      <cell v-for="data of row" ref="cells" :data="data" :key="data.idx" :state="state"
            @mousedown.native="mousedown($event,data)"
            @mouseup.native="mouseup(data)"
            @mouseout.native="mouseout(data)"/>
    </div>
  </div>
</div>
</template>
<script>

import cell from './cell.vue'

export default {
  name: 'minesweeper',
  components: { cell },
  data () {
    return {
      grid: [[]],
      state: { dead: false, win: false },
      gameStart: false,
      size: [9, 9],
      openCount: 0,
      flagCount: 0,
      mineTotal: 10,
      timer: 0,
      timerInterval: null,
      mouseBtn: [false, false, false],
      selectedAdj: []
    }
  },
  computed: {
    ooh () { return this.mouseBtn[0] || this.mouseBtn[1] },
    leftNum () {
      const n = _.clamp(this.mineTotal - this.flagCount, -99, 999)
      return n < 0 ? '-' + _.padStart(Math.abs(n), 2, 0) : _.padStart(n, 3, 0)
    },
    rightNum () {
      return _.padStart(_.clamp(this.timer, 0, 999), 3, 0)
    }
  },
  watch: {
    async size () { // $refs order problem
      await this.$nextTick()
      this.$refs.cells.sort((a, b) => a.data.idx - b.data.idx)
    },
    gameStart (truthy) {
      if (truthy) {
        this.timer = 1
        this.timerInterval = setInterval(() => this.timer++, 1000)
      } else {
        this.timerInterval = clearInterval(this.timerInterval)
      }
    }
  },
  created () { this.reset() },
  destroyed () { clearInterval(this.timerInterval) },
  methods: {
    reset (size, mineTotal = 0) {
      if (size) Object.assign(this, { size, mineTotal })
      const adjCoord = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
      const [height, width] = this.size
      const mines = _.times(this.mineTotal, () => true)
      const empty = _.times(width * height - this.mineTotal, () => false)
      this.timer = 0
      this.gameStart = false
      this.flagCount = 0
      this.state = { dead: false, win: false }

      // calculate adjacent mines
      const grid = _(mines).concat(empty).map(x => ({ mine: x, adjMine: 0, adjIdx: [] })).shuffle().chunk(width).value()
      grid.forEach((row, rn) => row.forEach((cell, cn) => {
        Object.assign(cell, { rn, cn, idx: width * rn + cn })
        _(adjCoord).map(([r, c]) => _.get(grid, [rn + r, cn + c])).compact().forEach(x => {
          if (cell.mine) x.adjMine++
          x.adjIdx.push(cell.idx)
        })
      }))
      this.grid = grid
    },
    getAdjCellComp (cell) {
      return cell.data.adjIdx.map(x => this.$refs.cells[x])
    },
    checkWin () {
      const { state: { dead }, flagCount, openCount, $refs: { cells: { length } } } = this
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
      const { mine, adjMine } = cell.data
      if (mine) return this.dead(cell)
      return !adjMine && this.getAdjCellComp(cell)
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
    grabAdj (cell) {
      this.selectedAdj = this.getAdjCellComp(cell)
      this.selectedAdj.forEach(cell => { cell.active = true })
    },
    releaseAdj (cell) {
      if (cell && cell.open && (cell.data.adjMine === _.sumBy(this.selectedAdj, 'flag'))) {
        this.selectedAdj.forEach(cell => this.openPropagation(cell))
      }
      this.selectedAdj.forEach(cell => { cell.active = false })
      this.selectedAdj = []
    },
    mousedown ($event, { idx }) {
      this.$set(this.mouseBtn, $event.button, true)
      const [left, middle, right] = this.mouseBtn
      const cell = this.$refs.cells[idx]
      cell.active = true
      if (middle || (left && right)) this.grabAdj(cell)
    },
    mouseout ({ idx }) {
      const cell = this.$refs.cells[idx]
      cell.active = false
      const [left, middle, right] = this.mouseBtn
      if (middle || (left && right)) this.releaseAdj(false)
      if (middle || left || right) this.mouseBtn = [false, false, false]
    },
    mouseup ({ idx }) {
      const cell = this.$refs.cells[idx]
      cell.active = false
      const [left, middle, right] = this.mouseBtn
      if (middle || (left && right)) this.releaseAdj(cell)
      else if (left) this.openPropagation(cell)
      else if (right) this.mark(cell)
      this.mouseBtn = [false, false, false]
    }
  },
  templateSrc: './minesweeper.html',
  styleSrc: './minesweeper.css'
}

</script>
<style src="./minesweeper.css" scoped></style>
