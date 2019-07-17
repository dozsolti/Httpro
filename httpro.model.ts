export class HTTProModel {

  value: any = undefined;
  message: string = "";

  isWaiting: boolean;
  isLoading: boolean;
  isDone: boolean;
  hasError: boolean;
  hasSuccessed: boolean;


  constructor(public initialValue: any = null, public initialMessage: string = "") {
    this.Reset();
  }

  GetStatus() {
    if (this.isWaiting)
      return "waiting";
    if (this.isLoading)
      return "loading";
    if (this.hasError)
      return "error";
    if (this.hasSuccessed)
      return "success";

    return "";
  }
  Reset() {
    this.value = this.initialValue;
    this.message = this.initialMessage;

    this.isWaiting = true;
    this.isLoading = false;
    this.isDone = false;
    this.hasError = false;
    this.hasSuccessed = false;
  }
  ResetValue() {
    this.value = this.initialValue;
  }
  public toDebugJSON() {
    return {
      message: this.message,
      hasError: this.hasError,
      value: this.value,
      status: this.GetStatus()
    };
  }
}
