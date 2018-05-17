export default class Constants {
    //属性和方法名重名时，方法的扩展名
    static METHOD_PLUGIN_NAME:string = '_g_plugin_name_';
    //应用图标的基准大小
    static APP_SIZE_NUMBER:number = 64;
    //应用图标的间隙
    static APP_PADDING: number = 8;

    static APP_NORMAL: string = 'normal';

    static APP_BIG: string = 'big';

    static APP_SMALL: string = 'small';

    static REDIRECT: string = 'redirect';

    static ROOT: string = window["_p_root"] || "/_p";

    static FILTER_PATH: string = window["_p_filterPath"] || "*"+ Constants.ROOT +"/index.html";

    //登录页面
    static LOGINPATH = Constants.ROOT + '/login';

    static RELOGINPATH = Constants.ROOT + '/reLogin';

    static MAINPATH = Constants.ROOT + '/desk';

    static SESSION_COOKIENAME = '__gsessionId';
}