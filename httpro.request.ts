import { BodyTypes } from './httpro.service';

export class HTTProRequest {

    searchParams = {};
    headers = {};
    body = {};
    bodyType: BodyTypes = BodyTypes.JSON;
    files = [];
    constructor(public method: string, public url: string) {
    }
}