<template>
<div class="container">
  <div class="app">
    <ul class="toolbar">
      <li class="game" tabindex="1" :class="{open:menu.game}" @click="menu.game=!menu.game" @blur="menu.game=false">
        <span>Game</span>
        <div class="cancel"></div>
        <div class="menu">
          <ul>
            <li v-for="item of levels" :key="item.name" :class="{checked:level===item}" @click="changeLevel(item)">
              <span class="check">✔</span> {{item.name}}
            </li>
          </ul>
        </div>
      </li>
      <li class="help"><span class="help">Help</span></li>
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
  computed: {
    isMenuOpen () { return !Object.values(this.menu).every(x => !x) }
  },
  watch: {
    level (nv, ov) { ov && this.reset() },
    isMenuOpen (v) { this.$emit('menu', v) }
  },
  created () {
    this.level = this.levels[0]
  },
  methods: {
    changeLevel (item) {
      this.level = item
      this.$emit('changeLevel', item)
    },
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
:focus {outline:none;}
.container {
  width: 100%; height: 100%; background-color: silver;
  font-size: 12px;
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
  padding: 1px 0;
  margin: 0;
  position: relative;
  user-select: none;
  flex-direction: row;
  display: flex;
}
.toolbar>li {
  display: flex;
  cursor: default;
  position: relative;
}
.toolbar>li>span{
  display: flex;
  align-items: center;
  border: solid 1px transparent;
  padding: 0 5px;
  height: 16px;
}
.toolbar>li>span:hover:not(.help){
  border: outset 1px #eee;
}
.toolbar>li.open>span{
  border: inset 1px #eee;
}
.toolbar>li:not(.open)>.menu {display: none;}

.menu{
  position: absolute;
  border:solid 1px silver; border-right-color: #000;border-bottom-color: #000;
  background-color: silver;
  top: 100%;
  left: 0;
}
.menu>ul{
  border: outset 1px #eee;
  width: 120px;
  padding: 0;
}
.menu>ul>li{
  padding: 4px 6px;
}
.menu>ul>li>.check{visibility: hidden;}
.menu>ul>li.checked>.check{visibility: visible;}
.menu>ul>li:hover{
  color:white;
  background-color: #0000a8;
}
.check {font-weight:bolder;}

.open .cancel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
