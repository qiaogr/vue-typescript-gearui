export default class StringUtil {

    public static maxLength(val: string, length: number, adonAfter?: string): string {
        if(val.length > length) {
            val = val.substring(0, length) + (adonAfter || '...');
        }
        return val;
    }
}