export enum BodyTypes { JSON, FORMDATA };

export let HTTProConfig = {
    baseURL:'',
    logTheError: true,
    messages:{
        loading: "Loading...",
        empty: "No results",
        generalError: "Something went wrong, please try again later",
        errors:{
            "404": "Not found"
        }
    }
}