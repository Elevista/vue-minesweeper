import Frame from './Frame.vue'
import Vue from 'vue'
import '../app/util/filters.mjs'
import _ from 'lodash'
import { lodashMixin } from '../app/util/util.mjs'

_.mixin(lodashMixin)
new Vue({ el: 'app', render: h => h(Frame) }) // eslint-disable-line no-new
