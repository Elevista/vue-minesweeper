import App from './App.vue'
import Vue from 'vue'
import './util/filters.mjs'
import _ from 'lodash'
import { lodashMixin } from './util/util.mjs'

_.mixin(lodashMixin)

new Vue({ el: 'app', render: h => h(App) }) // eslint-disable-line no-new
