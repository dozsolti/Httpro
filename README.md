# Httpro
##Examples:


###Create a **GET** request
```
    let modelPosts = new HTTProModel(null);

    await service
      .get('https://jsonplaceholder.typicode.com/posts', true)
      .to(modelPosts)
      .exec()
```
###Create a **GET** request with callbacks
```
    let model = new HTTProModel(null);
    await service
      .get('/posts')
      .to(model)
      .OnStart(() => {
        //Do stuff
      })
      .exec()
```
###Create a **POST** request
```
    let model = new HTTProModel();
    service
        .post('/posts')
        .headers({ 'Content-type': "application/json; charset=UTF-8" })
        .body({
        title: 'foo',
        body: 'bar',
        userId: 1
        })
        .to(model)
        .map((response) => {
        console.log({response});
        return [42, response];
        })
        .OnSuccess(()=>{
        console.log(model.toDebugJSON())
        })
        .exec()
```