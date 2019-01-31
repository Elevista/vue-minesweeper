<template>
  <div class="frame" :class="{focus,menu}" tabindex="0">
    <div class="title" @mousedown="menu&&$el.focus()">
      <i></i>
      <span class="name">Minsweeper</span>
      <button class="min" @click="win.minimize()"></button>
      <button class="max" disabled></button>
      <button class="close" @click="win.close()"></button>
    </div>
    <App class="app" @changeLevel="resize" @menu="menu=$event"/>
  </div>
</template>
<script>
import App from '../app/app.vue'
import { remote } from 'electron'

export default {
  name: 'Frame',
  components: { App },
  data () { return { focus: true, menu: false } },
  computed: { win: () => remote.getCurrentWindow() },
  beforeMount () {
    this.win.removeAllListeners('blur')
    this.win.removeAllListeners('focus')
    this.win.addListener('blur', () => { this.focus = false })
    this.win.addListener('focus', () => { this.focus = true })
  },
  async mounted () {
    this.win.setTitle('Minsweeper')
    await this.resize()
    this.win.show()
  },
  methods: {
    test (evt) {
      console.log(evt)
    },
    async resize () {
      await this.$nextTick()
      const { offsetWidth, offsetHeight } = this.$el
      this.win.setResizable(true)
      this.win.setSize(offsetWidth + 2, offsetHeight + 2) // margin: 1px
      this.win.setResizable(false)
    }
  }
}
</script>
<style scoped>
.app{width: auto;display: inline-block;}
.frame-border{display: inline-block;border:solid 1px silver;border-right-color: #000;border-bottom-color: #000;}
.frame{
  display:inline-block;
  padding:1px;
  border: outset 1px #eee;
  user-select: none;
  box-shadow: -1px -1px 0 1px silver, 1px 1px 0 2px #000;
  margin:1px;
}
.frame:not(.menu) .title {-webkit-app-region: drag;}
.title{
  height: 16px;
  background: #0000a8;
  color:white;
  padding: 1px 2px;
  display: flex;
  flex-direction: row;
  align-items: start;
}
.frame:not(.focus) .title{
  background: #87888f;
  color:#c0c7c8;
}

.rbborder{ padding-right: 1px;padding-bottom: 1px; padding:1px;box-shadow: -1px -1px 0 #000 inset}
.title i{width:16px;height:16px;background: url('icons/16x16.png') no-repeat 0 0;display: inline-block; }
.title span {display: flex;}
.title button{
  outline: none;
  -webkit-app-region: none;
  height: 11px;
  width: 13px;
  padding:0;
  background: url('icons/title_btns.png') no-repeat 0 0;
  background-color: silver;
  border: outset 1px #eee;
  box-shadow: 0px 1px 0 0px #000, 1px 0px 0 0px #000, 1px 1px 0 0px #000;
  box-sizing: content-box;
  margin: 1px 1px 1px 0;
  z-index: 1000;
}
.title button:active{border: inset 1px #eee;}
.title .name{
  flex:1;
  font-family: Tahoma;
  padding: 1px 2px;
  font-size: 11px;
  letter-spacing: 1px;
}
.title button.max{background-position: -13px 0;}
.title button.close{background-position: -26px 0;margin-left:2px}
</style>
<style>
html{overflow: hidden;}
:focus {outline:none;}
</style>
