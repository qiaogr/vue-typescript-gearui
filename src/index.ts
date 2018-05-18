import Vue from 'vue';
import G from './Gear';
import { WindowUtil } from './utils';
WindowUtil.extendPrototype();
const SockJs = require('sockjs-client');
let GearWeb:any = function(selector: string|object|Function) {
  return G.$.call(GearWeb, selector);
};
let GN = G.G$.extend(true, G, G.G$);
GearWeb = G.G$.extend(true, GearWeb, GN);
window.G = GearWeb;
window.G.SockJs = SockJs;
window.G.registerComponents();
window['GearBoolean'] = {};
new Vue({
  el: '#root',
  mounted: ()=>{
    window.G.parsed = true;
    //渲染结束后执行排队中的function
    window.G.doWaitFuns();
  }
});
