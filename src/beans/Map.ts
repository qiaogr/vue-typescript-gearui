export default class Map<K, V> {

    private valueMap:any = {};

    public put(key: K, value: V) {
        this.valueMap[key] = value;
    }

    public get(key: K):V {
        return this.valueMap[key];
    }

    public forEach(fun: Function) {
        for(let key in this.valueMap) {
            fun(key,this.valueMap[key]);
        }
    }

}