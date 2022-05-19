# Readme

> This is a websocket "chatroom" implementation. 
>
> Which can communicate via
> - (Secure) Websocket
> - Http Post Request


[Demoseite](https://ttskp.github.io/ws-test-2/)

[Miro](https://miro.com/app/board/uXjVO_FVfoY=/)

## Testcases

### Websocket with localhost

Create a websocket server on localhost. 

The port must be >1024. E.g. 8008

A node server could be found under `localhost`

To start the node server

```bash
  cd localhost
  npm ci
  npm run serve
```

Insert the URL into the "Relay-Server"-Textfield on the page: 

`ws://localhost:8008`


### Secure Websocket with relay-server
Instead, a local websocket server, you could use our hosted websocket-server:

`wss://ws-relay.stefanbreitenstein.workers.dev`

### Browser/Client Websocket "protocol"
After connect to the websocket server and the `CONNECT` event was received.
Following message must be sent, as JSON-String:

```js
websocket.send(`{
    "command":"create-or-join-channel",
    "channelUuid":"<uuid-or-nanoid-as-string>"
}`)
```

After that messages could be sent on the channel. 
```js
websocket.send(`{
    "channelUuid": "<uuid-or-nanoid-as-string>",
    "payload":"<given-message>"
}`)
```

#### Working Example
```js
// client_1
// Create a new Channel
websocket.send(JSON.stringify({
  command: "create-or-join-channel",
  channelUuid: "foobar"
}));

// client_2
// Join Channel:
websocket.send(JSON.stringify({
  command: "create-or-join-channel",
  channelUuid: "foobar"
}));

// client_2
// Send message, will be shown on Client_1 and Client_2
websocket.send(JSON.stringify({
    channelUuid: "foobar",
    payload: "bazzz"
}));
```


### HTTP-Post with relay server (WIP)
You can also send post requests to the relay-server. 
The requests will be redirected to the other clients via wss.

##### Working Example
```js
// client_1
// Create a new Channel
websocket.send(JSON.stringify({
    command: "create-or-join-channel",
    channelUuid: "foobar"
}));

// client_2
// Send message directly via post, will be shown on Client_1
fetch("wss://ws-relay.stefanbreitenstein.workers.dev", {
    method: "Post",
    body: JSON.stringify({
        channelUuid: "foobar",
        payload: "bazzz"
    })
});
``` 
