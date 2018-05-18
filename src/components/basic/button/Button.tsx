import Tag, { TagProps } from 'src/components/Tag';
import Vue, { CreateElement } from 'vue';
import Component, { mixins } from 'vue-class-component';
import { Button } from 'element-ui';
import { Http } from 'src/utils';
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
    // width: Number,
    // height: Number,
    selected: Boolean,
    selectedtype: String,
    selectedType: String,
    plain: Boolean,
    group: String,
    round: Boolean,
    autofocus: Boolean,
    nativeType: String,
    ...TagProps
};
@Component({
    components: {
        Button
    },
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
        this.textNode = "aaa";
    }
    
    afterMounted() {
        this.textNode = this.text;
    }

    render(h: CreateElement) {
        return <Button 
                size={this.props.size} 
                onClick={this.onClick} 
                type={this.props.type}
                plain={this.props.plain}
                round={this.props.round}
                circle={this.props.circle}
                loading={this.props.loading}
                disabled={this.props.disabled}
                icon={this.props.icon}
                autofocus={this.props.autofocus}
                native-type={this.props.nativeType}
            >{this.children}</Button>;
    }

    click(fun?: Function) {
        if(fun) {
            this.bind("click", fun);
        }else {
            if(this.realDom != null) {
                G.G$(this.realDom).click();
            }else {
                this.onClick.call(this);
            }
        }
    }
}