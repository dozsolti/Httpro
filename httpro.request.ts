import { BodyTypes } from "./httpro.config";


export class HTTProRequest {

    searchParams = {};
    headers = {};
    body = {};
    bodyType: BodyTypes = BodyTypes.JSON;
    files = [];
    constructor(public method: string, public url: string) {
    }
}