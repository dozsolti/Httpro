export class HttproModel {
    value: any;
    message = "";
    hasError = false;

    private defaultValue = null;

    constructor(defaultValue = null) {
        this.defaultValue = defaultValue;
        this.message = "";
        this.hasError = false;
        this.ResetValue();
    }
    public isGood(){
        return this.status()==='value';
    }
    public status(){
        if(this.hasError)
            return 'error';
        if(this.message.length>0)
            return 'message';
        
        return 'value';
    }
    public Reset() {
        this.message = "";
        this.hasError = false;
        this.ResetValue();
    }
    public ResetValue() {
        this.value = this.defaultValue;
    }
    public toDebugJSON() {
        return {
            message: this.message,
            hasError: this.hasError,
            defaultValue: this.defaultValue,
            value: this.value,
        };
    }
}