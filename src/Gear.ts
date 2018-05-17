import Vue from 'vue';
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');
import * as $ from 'jquery';
import JqueryTag from './components/JqueryTag';
import Constants from './Constants';
export default class G {

    static SockJs:any = null;
    static G$:JQueryStatic = $;
    //是否渲染完成
    static parsed: boolean = false;
    //待执行的function
    static waitFuns: Array<Function> = [];

    //注册全局组件
    static registerComponents() {
        let requireComponent = require['context']('./components', true , /[A-Z]\w+\.(ts|tsx)$/);
        requireComponent.keys().forEach((fileName: string) => {
            if(fileName.endsWith('index.ts')) {
                return;
            }
            let fileNameArr = fileName.split('/');
            let fileNameReal = "./" + fileNameArr[fileNameArr.length - 1];
            const componentConfig = requireComponent(fileName);
            let componentName:string = upperFirst(
                camelCase(
                    // 剥去文件名开头的 `'./` 和结尾的扩展名
                    fileNameReal.replace(/^\.\/(.*)\.\w+$/, '$1')
                )
            );
            componentName = 'g-' + componentName.toLowerCase();
            let component = componentConfig.default || componentConfig;
            Vue.component(
                componentName,
                // 如果这个组件选项是通过 `export default` 导出的，
                // 那么就会优先使用 `.default`，
                // 否则回退到使用模块的根。
                component
            )
        });
    }

    //查找页面中的元素
    static $(selector:string|object|Function) {
        if(typeof selector == "string" || typeof selector == "object") {
            let doms:JQuery<HTMLElement> = this.G$(selector);
            let fnNames = [];
            let eles:any = [];
            if(doms.length > 0) {
                for(let i = 0; i < doms.length;i++) {
                    let dom = this.G$(doms[i]);
                    try{
                        let gObj = dom.data("vmdom");
                        if(gObj) {
                            //记录自定义方法名称
                            for(let key in gObj) {
                                if(this.G$.isFunction(gObj[key])) {
                                    fnNames.push(key);
                                }
                            }
                            for(let key in dom) {
                                if(gObj[key] === undefined && this.G$.isFunction(dom[key])) {
                                    ((gObj,key)=>{
                                        gObj[key] = (...args: any[]) => {
                                            let jdom = this.G$(gObj.realDom);
                                            return jdom[key].call(jdom,...args);
                                        };
                                    })(gObj,key);
                                }
                            }
                            if(eles.indexOf(gObj) == -1) {
                                eles.push(gObj);
                            }
                        }else if(dom.length == 1) {
                            let jele = new JqueryTag();
                            jele.realDom = dom[0];
                            var constructor = dom.constructor;
                            this.G$.extend(dom,jele);
                            dom.constructor = constructor;
                            eles.push(dom);
                        }
                    }catch (e){
                        if(dom.length == 1) {
                            let jele = new JqueryTag();
                            jele.realDom = dom[0];
                            var constructor = dom.constructor;
                            this.G$.extend(dom,jele);
                            dom.constructor = constructor;
                        }
                        eles.push(dom);
                    }
                }
            }
            if(eles.length > 1) {
                let domArrays = [];
                for(let i = 0; i < doms.length; i++) {
                    if(doms.eq(i).attr("ctype") == null) {
                        domArrays.push(doms[i]);
                    }
                }
                doms = this.G$(domArrays);
                //筛选器获取了多个元素的时候，将各自执行各自的方法
                this.G$.each(fnNames,(i,name)=>{
                    let fn:any = (...args:any[])=>{
                        let res = [];
                        for(let j = 0; j < eles.length;j ++) {
                            let ele = eles[j];
                            if(ele[name] != null && G.G$.isFunction(ele[name])) {
                                let re = ele[name].call(ele,...args);
                                res.push(re);
                            }
                        }
                        return res;
                    };
                    if(name.indexOf(Constants.METHOD_PLUGIN_NAME) != -1) {
                        name = name.replace(Constants.METHOD_PLUGIN_NAME, '');
                    }
                    doms[name] = fn;
                });
                doms.eq = (index:number)=>{
                    return eles[index];
                };
                return doms;
            }else {
                if(eles.length > 0) {
                    return eles[0];
                }else {
                    return G.G$([]);
                }
            }
        }else if(typeof selector == "function") {
            if(this.parsed === true) {
                selector();
            }else {
                this.waitFuns.push(selector);
            }
        }
    }

    /**
     * 执行排队的function
     */
    static doWaitFuns() {
        this.waitFuns.forEach(fun => {
            fun.call(this);
        });
    }
    
}