import JqueryTag from './JqueryTag';
import G from '../Gear';
import Component,{ mixins } from 'vue-class-component';
import { VNode } from 'vue';
//增强类型的props
export var TagProps = {

}
@Component
export default class Tag<P extends typeof TagProps> extends mixins(JqueryTag) {

    props: P;

    constructor() {
        super();
    }

    afterMounted() {

    }

    /**
     * 渲染之前调用
     */
    beforeMount() {
        this.children = this.$slots.default;
        this.initText();
    }

    /**
     * 获取文本数据
     */
    protected initText() {
        let ele = this.$slots.default;
        let text = '';
        if(ele) {
            for(let i = 0; i < ele.length; i++) {
                text += this.getVNodeText(ele[i]);
            }
        }
        this.text = text;
    }

    protected getVNodeText(node: VNode) {
        let text = node.text || '';
        if(node.children) {
            for(let i=0; i < node.children.length; i++) {
                text += this.getVNodeText(node.children[i]);
            }
        }
        return text;
    }
    
    /**
     * 渲染完成之后调用
     */
    mounted() {
        this.initRealDom();
        this.bindVmDomOnRealDom();
        this.copyProps();
        this.afterMounted();
    }

    /**
     * 获取realDom
     */
    protected initRealDom() {
        let ele = this.$vnode.elm;
        if(ele) {
            this.realDom = ele;
        }
    }

    /**
     * 将当前虚拟dom绑定到真实dom上
     */
    protected bindVmDomOnRealDom() {
        G.G$(this.realDom).data('vmdom', this);
    }

    /**
     * 将vue 的props 复制到 当前对象的强类型props
     */
    protected copyProps() {
        let $props: any = this.$props;
        this.props = $props;
    }
}