# HTTPro
A better and faster way to make requests in Angular.  This is a module on top of the Angular's HttpClient module. 

I focused on the **friendly syntax**  and being able to **handle easier the input** ( headers, body, files etc) and **the output** (response from server and callback) of the request using a chainning syntax.


# Basic examples
### Create a **GET** request
```
let modelPosts = new HTTProModel([]);
this.httpro
	.get('/posts')
	.exec(modelPosts)
	
```

### Create a **GET** request with callbacks
```
let modelPosts = new HTTProModel([]);
this.httpro
	.get('/posts')
	.OnStart(() => {
		//Do stuff
	})
	.exec(modelPosts)
	
```
### Create a **POST** request
```
let model = new HTTProModel();
this.httpro
	.post('/posts')
	.headers({ 'Content-type': "application/json; charset=UTF-8" })
	.useToken()
	.body({
		title: 'foo',
		body: 'bar',
		userId: 1
	})
	.OnSuccess(()=>{
		console.log(model.toDebugJSON())
	})
	.exec(model)

```

## Write your first request with HTTPro

First of first you have to know **what type of request** do you wanna make (GET, POST, PUT or DELETE) **where** the url of the request and a **HTTPro model** for storing the response.

Let's say we wanna make a GET request to '[https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)' (this is an online service that offers endpoint for tests).

So we already have the **what** and the **where**, we only need the **HTTPro model**.

    let model = new HTTProModel([]);
**Note**: Those empty brackets ([]) will be the default value for our posts. 

Now we have all that we need for the request let's assemble it:

    this.httpro
	    .get("https://jsonplaceholder.typicode.com/posts")
	    .exec(model);
**Note:** You have to call exec() function to *execute* the request.

**That was it !!** Now the model will contain all the informations you will need.

## About functions
The first 2 is required!! This means ***get***(url), ***post***(url), ***put***(url) or ***delete***(url)  AND ***to***(model: HTTProModel)

 1. ***get***(url), ***post***(url), ***put***(url), ***delete***(url) : These will initialize the request with the methode and url, **it  should be the first** in the chain. It has a second parameter called *ignoreBaseURl* by default it is false, but when it is true ignores the baseURL from configuration, *the url becoming an absolute path*.
	 e.g. `this.httpro.put('/user/3')`
	 
 2. ***exec***(model = null) : This will start/execute the request. In this way you can write a request and run it later. It returns a Promise with true on .then() if it succeded and false on .catch() for errors ***IF*** you have a model in argument, otherwise the then callback will contain the result from the request and the catch callback will contain the errors.
 3. ***OnStart***(func), ***OnResponseGot***(func), ***OnEmptyResponse***(func), ***OnError***(func), ***OnSuccess***(func): With you can set the callbacks. *OnEmptyResponse()* will be called when the request has succed but the response's body is empty.
	 e.g. `.OnStart(() => { itStarted  =  true; })`
	 **Note**: Only the OnError callback has parameter, the error message.

 4. ***headers***(headers): It sets the request's headers.
 5. ***query***(query): It sets queryParams of the request. Those in the url after the question mark(?)
 6. ***body***(body): It sets the body that will be send.
  **Note** headers, query and body it recieves an Object as a parameter ({key: value}). If the key already exists the value will be override, but it it not exists it will add it to rest.
 7. ***file***(fileName, file): It put the file in the array of files that will be send.
 8. ***useToken***(token  =  null): This will set the request token with the **parameter or will from localStorage**, with the key 'token'. 
 Basicly set the header.Authorization = "Bearer "+ token
 9. ***map***(func): If the request succed the parameter will run over the response's value and setting to model's value. 

## HTTProModel

This contains informations about the request(current status) and the response(got from server).

### HTTProModel properties

 1. ***value***: conatins the data from response( in some cases mapped)
 2. ***message***: if it success or not this will have informations about, the request/response as a string. For e.g. case like: "loading", "empty result" 
 3. It has 2 properties ***initialValue***, ***initialMessage***, what you can set on initiliazing the model. These will be later reused on the Reset() function.
 4.  Properties about the current status: ***isWaiting***, ***isLoading***, ***isDone***, ***hasError***, ***hasSucced*** all these are boolean.

### HTTProModel functions

 - ***GetStatus***() :this will return one of these:
	 - waiting
	- loading
	- error
	- success
- ***Reset***(): it will reset the whole model to starting state.
- ***ResetValue***() it resets only the value. It sets back to the initial.
- ***toDebugJSON***() returns an object with the most important parts of the model
## HTTProConfig
It is only object with all the configuration.
**Note**: Here you can set the error messages and the **baseURL** request.

## HTTProRequest
Only for a wrapper purpose.
