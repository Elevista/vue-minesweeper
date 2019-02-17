
<template>
  <div class="minesweeper" @contextmenu.prevent>
    <div class="indicator">
      <div class="left">
        <span v-for="(x,i) of leftNum" :key="i" class="count" :class="'n'+x">{{ x }}</span>
      </div>
      <button class="smiley" :class="[state,{ooh}]" @click="reset()" />
      <div class="right">
        <span v-for="(x,i) of rightNum" :key="i" class="count" :class="'n'+x">{{ x }}</span>
      </div>
    </div>
    <div class="board">
      <div v-for="(row,i) of grid" :key="i" class="row">
        <cell v-for="data of row" ref="cells" :key="data.idx"
              :data="data" :state="state" :qmark="qmark"
              @mousedown.native="mousedown($event,data)"
              @mouseup.native="mouseup(data)"
              @mouseout.native="mouseout(data)"
        />
      </div>
    </div>
  </div>
</template>
<script>

import Cell from './Cell.vue'

export default {
  name: 'Minesweeper',
  components: { Cell },
  props: { level: { type: Object, required: true }, qmark: Boolean },
  data () {
    return {
      grid: this.make(),
      state: { dead: false, win: false },
      gameStart: false,
      count: { open: 0, flag: 0 },
      timer: 0,
      mouseBtn: [false, false, false],
      grabbed: [],
      timerInterval: undefined
    }
  },
  computed: {
    ooh () { return this.mouseBtn[0] || this.mouseBtn[1] },
    leftNum () {
      const n = _.clamp(this.level.mineTotal - this.count.flag, -99, 999)
      return n < 0 ? `-${_.padStart(Math.abs(n), 2, 0)}` : _.padStart(n, 3, 0)
    },
    rightNum () {
      return _.padStart(_.clamp(this.timer, 0, 999), 3, 0)
    }
  },
  watch: {
    async 'level.size' () { // $refs order problem
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
    },
    level () { this.reset() }
  },
  destroyed () { clearInterval(this.timerInterval) },
  methods: {
    make () {
      const { mineTotal, size: [height, width] } = this.level
      const adjCoord = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
      const mines = _.times(mineTotal, () => true)
      const empty = _.times(width * height - mineTotal, () => false)
      return _(mines).concat(empty).shuffle()
        .map((mine, idx) => ({ mine, idx, adjMine: 0, adjIdx: [] }))
        .chunk(width)
        .forEach((row, rn, grid) => row.forEach((cell, cn) => {
          Object.assign(cell, { rn, cn })
          _(adjCoord).map(([r, c]) => _.get(grid, [rn + r, cn + c])).compact()
            .forEach(x => {
              if (cell.mine) x.adjMine++
              x.adjIdx.push(cell.idx)
            })
        }))
    },
    getAdjCellComp (cell) {
      return cell.data.adjIdx.map(x => this.$refs.cells[x])
    },
    checkWin () {
      const {
        state: { dead },
        level: { mineTotal },
        $refs: { cells: { length } },
        count: { flag, open }
      } = this
      if (dead || (flag !== mineTotal) || ((flag + open) !== length)) return
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
      if (!cell.open()) return // open fail
      const { mine, adjMine } = cell.data
      this.count.open++
      if (mine) return this.dead(cell)
      return !adjMine && this.getAdjCellComp(cell)
    },
    openPropagation (cell) {
      if (cell.fixed) return // cell is immutable
      this.gameStart = true
      const queue = [cell]
      while (queue.length) queue.push(...(this.open(queue.shift()) || [])) // Breadth First Search
      this.checkWin()
    },
    mark (cell) {
      if (!cell.mark()) return // flag not changed
      this.count.flag += cell.flag ? 1 : -1
      this.checkWin()
    },
    grab (cell) {
      this.grabbed = this.getAdjCellComp(cell)
      this.grabbed.forEach(cell => cell.press(true))
    },
    release (cell) {
      if (cell && cell.open && (cell.data.adjMine === _.sumBy(this.grabbed, 'flag'))) {
        this.grabbed.forEach(cell => this.openPropagation(cell))
      }
      this.grabbed.forEach(cell => cell.press(false))
      this.grabbed = []
    },
    mousedown ($event, { idx }) {
      this.$set(this.mouseBtn, $event.button, true)
      const [left, middle, right] = this.mouseBtn
      const cell = this.$refs.cells[idx]
      if (left || middle) {
        cell.press(true)
        if (middle || right) this.grab(cell)
      }
    },
    mouseout ({ idx }) {
      const [left, middle, right] = this.mouseBtn
      if (middle || left || right) this.mouseBtn = [false, false, false]
      const cell = this.$refs.cells[idx]
      if (left || middle) {
        cell.press(false)
        if (middle || right) this.release()
      }
    },
    mouseup ({ idx }) {
      const [left, middle, right] = this.mouseBtn
      this.mouseBtn = [false, false, false]
      const cell = this.$refs.cells[idx]
      if (left || middle) {
        cell.press(false)
        if (middle || right) this.release(cell)
        else this.openPropagation(cell)
      } else if (right) this.mark(cell)
    },
    reset () {
      clearInterval(this.timerInterval)
      Object.assign(this.$data, this.$options.data.call(this))
    }
  }
}
</script>
<style src="./Minesweeper.css" scoped></style>
