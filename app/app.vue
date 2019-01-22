<template>
<div class="container">
  <div class="app">
    <ul class="toolbar">
      <li :class="{open:menu.game}" @click="menu.game=!menu.game">
        <span>Game</span>
        <div class="cancel"></div>
        <ul class="menu">
          <li v-for="item of levels" :key="item.name" :class="{checked:level===item}" @click="level=item">
            <span class="check">✔</span> {{item.name}}
          </li>
        </ul>
      </li>
      <li>Help</li>
    </ul>
    <minesweeper ref="minesweeper"/>
  </div>
</div>

</template>
<script>
import minesweeper from './minesweeper/minesweeper.vue'

export default {
  name: 'app',
  components: { minesweeper },
  data () {
    return {
      levels: [
        { name: 'Beginner', size: [9, 9], mineTotal: 10 },
        { name: 'Intermediate', size: [16, 16], mineTotal: 40 },
        { name: 'Expert', size: [16, 30], mineTotal: 99 }
      ],
      level: null,
      menu: { game: false }
    }
  },
  watch: {
    level (nv, ov) {
      ov && this.reset()
    }
  },
  created () {
    this.level = this.levels[0]
  },
  methods: {
    reset () {
      const { size, mineTotal } = this.level
      this.$refs.minesweeper.reset(size, mineTotal)
    }
  },
  templateSrc: './app.html',
  styleSrc: './app.css'
}
</script>
<style scoped>
.container {
  width: 100%; height: 100%; background-color: silver;
  font-size: 13px;
  font-family: Tahoma;
  display: flex;
  justify-content: center;
}
.app{max-width: 100%;}
.option {
  margin-top: 40px;
}
.option input {
  width: 50px;
}
ul{list-style: none;}
.toolbar {
  padding: 0;
  margin: 0;
  position: relative;
  user-select: none;
}
.toolbar>li {
  display: inline-block;
  cursor: default;
}
.toolbar>li>span{
  display: block;
  border: solid 2px transparent;
  padding: 0 5px;
}
.toolbar>li>span:hover{
  border: outset 2px #eee;
}
.toolbar>li.open>span{
  border: inset 2px #eee;
}
.toolbar>li:not(.open)>.menu {
  display: none;
}
.menu{
  position: absolute;
  background-color: silver;
  top: 100%;
  left: 0;
  border: outset 2px #eee;
  width: 120px;
  padding: 0;
}
.menu>li{
  padding: 4px 6px;
}
.menu>li>.check{visibility: hidden;}
.menu>li.checked>.check{visibility: visible;}
.menu>li:hover{
  color:white;
  background-color: #050081;
}
.check {font-weight:bolder;}
button{
  margin:2px 2px 2px 0;
  background-color: silver;
  border: outset 2px #eee;
  font-size:9px;
  font-weight:bold;
  font-family:Tahoma;
  text-align:center;
}
.open .cancel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
