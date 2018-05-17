import { Message } from "../beans";
import Config from './Config';
import Constants from "../Constants";
const {YQL, CORS} = Config.config();
const qs = require('qs');
const jsonp = require('jsonp');
// const lodash = require('lodash');
const pathToRegexp = require('path-to-regexp');
import HttpResponse from "../beans/HttpResponse";
import { WindowUtil, config } from ".";
const axios = require('axios').default;
// axios.defaults.withCredentials = true;
axios.interceptors.request.use((config: any) => {
    config.withCredentials = true;
    const token = Http.getCookie("sessionId") || WindowUtil.getSessionId();
    const data = config.data;
    config.data = qs.stringify(data);
    config.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    config.headers[Constants.SESSION_COOKIENAME] = token;
    let ieVersion = WindowUtil.getIeVersion();
    if(ieVersion > -1 && ieVersion < 10) {
        if(token) {
            config.params = data;
            config.params[Constants.SESSION_COOKIENAME] = token;
        }
    }
    return config;
},(err: any) => {
    return Promise.reject(err.response.data);
});
axios.interceptors.response.use((response: any)=>{
    return response;
},(err: any) => {
    return Promise.reject(err);
});
export default class Http {

    static fetch(options: any) {
        let {
            method = options.method,
            data,
            fetchType,
            url,
        } = options

        const cloneData = G.G$.extend(true,{},data);

        try {
            let domin = ''
            if (url.match(/[a-zA-z]+:\/\/[^/]*/)) {
                domin = url.match(/[a-zA-z]+:\/\/[^/]*/)[0]
                url = url.slice(domin.length)
            }
            const match = pathToRegexp.parse(url)
            url = pathToRegexp.compile(url)(data)
            for (let item of match) {
                if (item instanceof Object && item['name'] in cloneData) {
                    delete cloneData[item['name']]
                }
            }
            url = domin + url
        } catch (e) {
            console.error(e);
        }

        if (fetchType === 'JSONP') {
            return new Promise((resolve, reject) => {
                jsonp(url, {
                    param: `${qs.stringify(data)}&callback`,
                    name: `jsonp_${new Date().getTime()}`,
                    timeout: 64000,
                }, (error: any, result: any) => {
                    if (error) {
                        reject(error)
                    }
                    resolve( { statusText: 'OK', status: 200, data: result })
                })
            })
        } else if (fetchType === 'YQL') {
            url = `http://query.yahooapis.com/v1/public/yql?q=select * from json where url='${options.url}?${encodeURIComponent(qs.stringify(options.data))}'&format=json`
            data = null
        }


        switch (method.toLowerCase()) {
            case 'get':
                return axios.get(url, {
                    params: cloneData,
                })
            case 'delete':
                return axios.delete(url, {
                    data: cloneData,
                })
            case 'post':
                return axios.post(url, cloneData)
            case 'put':
                return axios.put(url, cloneData)
            case 'patch':
                return axios.patch(url, cloneData)
            default:
                return axios(options)
        }
    }

    /**
     * 发起请求
     * @param options 
     */
    static request(options: any) {
        if (options.url && options.url.indexOf('//') > -1) {
            const origin = `${options.url.split('//')[0]}//${options.url.split('//')[1].split('/')[0]}`;
            if (window.location.origin !== origin) {
                if (CORS && CORS.indexOf(origin) > -1) {
                    options.fetchType = 'CORS'
                } else if (YQL && YQL.indexOf(origin) > -1) {
                    options.fetchType = 'YQL'
                } else {
                    options.fetchType = 'JSONP'
                }
            }
        }
        return Http.fetch(options).then((response: any) => {
            const { statusText, status, data } = response;
            if(status == 200) {
                let dataStatus = data.status;
                if(dataStatus == Message.SUCCESS) {
                    let data = options.fetchType === 'YQL' ? response.data.query.results.json : response.data;
                    return Promise.resolve(new HttpResponse(true, statusText, status, data));
                }else if(dataStatus == Message.NOLOGIN) {
                    WindowUtil.setUserIdFromSession('');
                    return Promise.resolve(new HttpResponse(true, statusText, dataStatus, data));
                }else {
                    WindowUtil.setUserIdFromSession('');
                    let msg = data.message || statusText;
                    return Promise.reject(new HttpResponse(false, msg, dataStatus));
                }
            }else {
                WindowUtil.setUserIdFromSession('');
                const { data, statusText } = response;
                let statusCode = response.status;
                let msg = data.message || statusText;
                return Promise.reject(new HttpResponse(false, msg, statusCode));
            }
        }).catch((error: any) => {
            console.log(options);
            console.log(error);
            const { response } = error;
            let msg;
            let statusCode;
            if (response && response instanceof Object) {
                const { data, statusText } = response
                statusCode = response.status
                msg = data.message || statusText
            } else {
                statusCode = 600;
                msg = error.message || 'Network Error';
            }
            WindowUtil.setUserIdFromSession('');
            return Promise.reject(new HttpResponse(false, msg, statusCode));
        })
    }

    static putSessionIdInCookie(exdays?: number) {
        let cname = Constants.SESSION_COOKIENAME;
        let cvalue:any = WindowUtil.getSessionId();
        Http.setCookie(cname,cvalue);
    }

    static setCookie(cname: any,cvalue: any,exdays?: number) {
        exdays = exdays || 30;
        var d: any = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + escape(cvalue) + "; " + expires;
    }

    static getCookie(name: any) {
        const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
        const arr = document.cookie.match(reg);
        if (arr) {
            // unescape
            return decodeURIComponent(arr[2]);
        } else {
            return null;
        }
    }

    //用于获取web-root-url
    static rootPath(){
        return Http.getRootPath();
    }

    //转换相对路径的url为完整路径，url须以/开头
	static absoluteUrl(url: string){
        var root = Http.getRootContext();
        if(url){
            if(/^\//.test(url))
                return root + url;
            else
                return url;
        }else{
            return root;
        }
    }

    static getRootContext() {
        var meta = document.getElementsByTagName("meta")["web-context"];
        var projectName= '';
        if(meta && meta[0]) {
            projectName = meta.attr("content");
        }else {
            projectName= config.api.rootContext||this.getPathName().substring(0,this.getPathName().substr(1).indexOf('/')+1);
        }
        return projectName;
    }

    //获取项目根目录 如： http://localhost:8083/uimcardprj
    static getRootPath (){
        //获取带"/"的项目名，如：/uimcardprj
        let projectName = this.getRootContext();
        var rootPath = (this.getLocalhostPath());
        if(rootPath.indexOf("localhost") != -1 || rootPath.indexOf("127.0.0.1") != -1) {
            rootPath = rootPath + projectName;
        }
        return rootPath;
    }

    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp      
    static getPathName() {
        return window.document.location.pathname;
    }

    //获取主机地址，如： http://localhost:8083
    static getLocalhostPath() {
        var pos=this.getPath().indexOf(this.getPathName());    
        return this.getPath().substring(0,pos); 
    }

    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp   
    static getPath() {
        return window.document.location.href;
    }

    // 通过超链接的方式打开地址
    static triggerHyperlink(url:string,target?:string){
        var tempid = "_hiden_Hyperlink_";  
        var obj = document.getElementById(tempid);  
        if(!obj) {  
            var el = document.createElement("A");  
            el.style.display = "none";  
            el.setAttribute("id", tempid);  
            el.setAttribute("href", "javascript:void(0);");  
            document.body.appendChild(el);  
            obj = document.getElementById(tempid);
        } 
        if(obj != null) {
            obj.setAttribute("href", url||"");  
            obj.setAttribute("target", target||"");  
            obj.click(); 
        }
    }

}