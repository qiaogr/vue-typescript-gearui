import config from './Config';
// import TokenUtil from './Token';
import { UUID, Http } from '.';
// TokenUtil.secret = config.config().prefix;
// TokenUtil.timeStep = 24 * 60 * 60;
export default class WindowUtil {

    static events= {};

    static onresize(fun?: Function) {
        let resizeEvents = this.events["resize"]||[];
        resizeEvents.push(fun);
        this.events["resize"] = resizeEvents;
    }

    //注册window事件
    static init() {
        if(window.addEventListener) {
            document.addEventListener('DOMMouseScroll',this.mouseScroll.bind(this),false);
        }else {
            window.onmousewheel = document.onmousewheel = this.mouseScroll.bind(this);
        }
        window.onresize = this.resize.bind(this);
        window.onscroll = document.onscroll = this.scroll.bind(this);
    }

    private static mouseScroll(e:Event):any {
        let scrollEvents = this.events["mouseScroll"]||[];
        if(scrollEvents.length > 0) {
            for(let i = 0; i < scrollEvents.length; i++) {
                let event = scrollEvents[i];
                if(event instanceof Function) {
                    let re = event(e);
                    if(re == false) {
                        return false;
                    }
                }
            }
        }
    }

    private static scroll(e:Event):any {
        let scrollEvents = this.events["scroll"]||[];
        if(scrollEvents.length > 0) {
            for(let i = 0; i < scrollEvents.length; i++) {
                let event = scrollEvents[i];
                if(event instanceof Function) {
                    let re = event(e);
                    if(re == false) {
                        return false;
                    }
                }
            }
        }
    }

    private static resize(e:Event):any {
        let resizeEvents = this.events["resize"]||[];
        if(resizeEvents.length > 0) {
            for(let i = 0; i < resizeEvents.length; i++) {
                let event = resizeEvents[i];
                if(event instanceof Function) {
                    let re = event(e);
                    if(re == false) {
                        return false;
                    }
                }
            }
        }
    }

    /*
        * 事件注册
        * @param Element     ele 
        * @param String      eventType
        * @param Function    fn
        * @param Boolean     isRepeat
        * @param Boolean     isCaptureCatch
        * @return undefined
    */
    static loginEvent(ele: any, eventType: any, fn: any, isRepeat: any, isCaptureCatch: any) {
        if (ele == undefined || eventType === undefined || fn === undefined) {
            throw new Error('传入的参数错误！');
        }

        if (typeof ele !== 'object') {
            throw new TypeError('不是对象！');
        }

        if (typeof eventType !== 'string') {
            throw new TypeError('事件类型错误！');
        }

        if (typeof fn !== 'function') {
            throw new TypeError('fn 不是函数！');
        }

        if (isCaptureCatch === undefined || typeof isCaptureCatch !== 'boolean') {
            isCaptureCatch = false;
        }

        if (isRepeat === undefined || typeof isRepeat !== 'boolean') {
            isRepeat = true;
        }

        if (ele.eventList === undefined) {
            ele.eventList = {};
        }

        let typeN = "";
        if (document["mozFullScreen"] !== undefined) {
            typeN = "DOMMouseScroll";
        }

        if (isRepeat === false) {
            for (var key in ele.eventList) {
                if (key === eventType || key == typeN) {
                    return '该事件已经绑定过！';
                }
            }
        }

        // 添加事件监听
        if (ele.addEventListener) {
            if (document["mozFullScreen"] !== undefined) {
                eventType = "DOMMouseScroll";
            }
            ele.addEventListener(eventType, fn, isCaptureCatch);
            
        } else if (ele.attachEvent) {
            ele.attachEvent('on' + eventType, fn);
        } else {
            return false;
        }

        ele.eventList[eventType] = true;
    }

    static getUserIdFromSession() {
        if(window.localStorage) {
            return window.localStorage.getItem(`${config.config().prefix}userId`);
        }else {
            return Http.getCookie(`${config.config().prefix}userId`);
        }
        
    }

    static setUserIdFromSession(userId: string) {
        if(window.localStorage) {
            window.localStorage.setItem(`${config.config().prefix}userId`, userId);
        }else {
            Http.setCookie(`${config.config().prefix}userId`, userId);
        }
    }

    static getSessionId() {
        if(window.localStorage) {
            return window.localStorage.getItem(`${config.config().prefix}sessionId`);
        }else {
            return Http.getCookie(`${config.config().prefix}sessionId`);
        }
        
    }

    static setSessionId() {
        let sessionId = UUID.uuid(24,88);
        if(window.localStorage) {
            window.localStorage.setItem(`${config.config().prefix}sessionId`, sessionId);
        }else {
            Http.setCookie(`${config.config().prefix}sessionId`, sessionId);
        }
    }

    static getIeVersion() {
        if(navigator) {
            var browser=navigator.appName;
            var b_version=navigator.appVersion;
            if(browser && b_version) {
                var version=b_version.split(";"); 
                if(version && version[1]) {
                    var trim_Version=version[1].replace(/[ ]/g,"");
                    if(browser=="Microsoft Internet Explorer") {
                        if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0") {
                            return 6;
                        }
                        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
                            return 7;
                        }
                        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                            return 8;
                        }
                        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
                            return 9;
                        } else {
                            return 10;
                        }
                    }
                }
            }
        }
        return -1;
    }
}