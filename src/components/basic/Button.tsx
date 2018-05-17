import Tag, { TagProps } from '../Tag';
import Vue from 'vue';
import Component, { mixins } from 'vue-class-component';
import { Button } from 'element-ui';
import { Http } from '../../utils';
export var GbuttonProps = {
    url: String||Function,
    target: String,
    type: String,
    buttonstyle: String,
    buttonStyle: String,
    shape: String,
    circle: Boolean,
    size: String,
    icon: String,
    value: String,
    disabled: Boolean,
    loading: Boolean,
    delay: Boolean,
    ghost: Boolean,
    iconalign: String,
    iconAlign: String,
    width: Number,
    height: Number,
    selected: Boolean,
    selectedtype: String,
    selectedType: String,
    plain: Boolean,
    group: String,
    ...TagProps
};
Vue.use(Button);
@Component({
    template: '<el-button v-cloak :type="type" :disabled="disabled" @click="onClick">{{textNode}}</el-button>',
    props: GbuttonProps
})
export default class GButton<P extends typeof GbuttonProps> extends mixins<Tag<typeof GbuttonProps>>(Tag) {

    textNode: String = '';

    constructor() {
        super();
    }

    // 点击事件
    onClick(event: Event): void {
        let triggerLink = true;
        // 如果click函数有返回值，且返回值为false，则不触发url转向
        let ret = this.doEvent("click", event);
        if(ret!=null && ret instanceof Array){
            for(let i=0;i<ret.length;i++){
                if(ret[0]!=null && ret[0]==false){
                    triggerLink = false;
                    break;
                }
            }
        }
        if(triggerLink==true){
            let url = this.getPropStringValue(this.props.url);
            if(url && url.length>0){
                this.props.disabled();
                let target = this.props.target.toString();
                Http.triggerHyperlink(url,target);
            }
        }
    }
    
    afterMounted() {
        this.textNode = this.text;
    }
}