<template>
  <button class="cell" :class="[display,{pressed,flag,fixed,triggerDead,question}]" />
</template>
<script>
export default {
  name: 'Cell',
  props: ['data', 'state', 'qmark'],
  data () {
    return { opened: false, markState: 0, triggerDead: false, pressed: false }
  },
  computed: {
    display () {
      const { opened, data: { mine, adjMine }, state: { dead } } = this
      if (opened) return mine ? 'mine' : `n${adjMine}`
      if (dead) return ['dead', mine && 'mine']
      return undefined
    },
    flag () { return this.markState === 1 },
    question () { return this.markState === 2 },
    fixed () { return this.state.dead || this.state.win || this.opened }
  },
  watch: {
    data () { Object.assign(this.$data, this.$options.data()) } // reset component state when data changed
  },
  methods: {
    press (v) {
      if (this.state.dead || this.opened) return
      this.pressed = v
    },
    open () {
      if (this.fixed || this.flag) return false
      this.opened = true
      this.markState = 0
      return true
    },
    mark () {
      if (this.fixed) return false
      const ret = !this.question
      this.markState = this.question ? 0 : (this.markState + 1) % (this.qmark ? 3 : 2)
      return ret // flag changed
    }
  }
}
</script>
<style scoped>
.cell {
  display: inline-block;
  border: none;
  outline: none;
  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;
  background: url(sprite.png) no-repeat 0 -39px;
}
.cell.pressed {background-position: 0 -23px;}
.cell.pressed.question {background-position: -96px -39px;}
.cell.fixed {background-position: 0 -39px;}
.cell.question {background-position: -80px -39px;}
.cell.mine {background-position: -64px -39px;}
.cell.flag {background-position: -16px -39px;}
.cell.triggerDead {background-position: -32px -39px;}
.cell.dead.flag:not(.mine) {background-position: -48px -39px;}
.cell.n0 {background-position: 0px -23px;}
.cell.n1 {background-position: -16px -23px;}
.cell.n2 {background-position: -32px -23px;}
.cell.n3 {background-position: -48px -23px;}
.cell.n4 {background-position: -64px -23px;}
.cell.n5 {background-position: -80px -23px;}
.cell.n6 {background-position: -96px -23px;}
.cell.n7 {background-position: -112px -23px;}
.cell.n8 {background-position: -128px -23px;}
</style>
