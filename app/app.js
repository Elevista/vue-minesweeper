import minesweeper from './minesweeper/minesweeper'

export default {
  name: 'app',
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
  created () {
    this.level = this.levels[0]
  },
  watch: {
    level (nv, ov) {
      ov && this.reset()
    }
  },
  methods: {
    reset () {
      const { size, mineTotal } = this.level
      this.$refs.minesweeper.reset(size, mineTotal)
    }
  },
  components: { minesweeper },
  templateSrc: './app.html',
  styleSrc: './app.css'
}
