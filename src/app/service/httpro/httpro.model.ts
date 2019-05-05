export class HttproModel {
    value: any;
    message = "";
    hasError = false;
    isLoading = false;

    private defaultValue = null;

    constructor(defaultValue = null) {
        this.defaultValue = defaultValue;
        this.Reset();
    }
    public isGood() {
        return this.status() === 'value';
    }
    public status() {
        if (this.hasError)
            return 'error';
        if (this.message.length > 0 || this.isLoading)
            return 'message';

        return 'value';
    }
    public Reset() {
        this.message = "";
        this.hasError = false;
        this.isLoading = false;
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