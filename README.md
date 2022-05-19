# Readme

> This is a websocket "chatroom" implementation. 
> Which can communicate via
> - Http Post Request
> - (Secure) Websocket

### Register 



### Testcases

#### Ws with localhost (WIP)
Create a websocket server on localhost. 
The port must be higher then 1024.
Eg. 8008
A node server could be found under `localhost`
To start the node server: 
```
  npm ci
  npm run serve
```

Insert the URL into the "Relay-Server"-Textfield on the page.
Eg: `ws://localhost:8008`


#### Wss with relay-server
Instead a local websocket server, you could use
our hosted websocket-server


#### Browser/Client "protocol"
After connect to the websocket server and the `CONNECT` event was received.
Following message must be send, as JSON-string:

```
websocket.send('{
    "command":"create-or-join-channel",
    "channelUuid":"<uuid-or-nanoid-as-string>"
}')
```

After that messages could be send on the channel. 
```
websocket.send('{
    "channelUuid":"<uuid-or-nanoid-as-string>",
    "payload":"<given-message>"
}')
```

#### Working Example
```
# client_1
# Create a new Channel
websocket.send(JSON.stringify({
    command: "create-or-join-channel",
    channelUuid: "foobar"
}))

# client_2
# Join Channel:
websocket.send(JSON.stringify({
    command: "create-or-join-channel",
    channelUuid: "foobar"
}))

# client_2
# Send message, will be shown on Client_1 and Client_2
websocket.send(JSON.stringify({
    channelUuid: "foobar",
    payload: "bazzz"
}))
```


#### HTTP-Post with relay server (WIP)
You can also send post requests the relay-server. 
The requests will be redirected to the other clients via wss.

##### Working Example
```
# client_1
# Create a new Channel
websocket.send(JSON.stringify({
    command: "create-or-join-channel",
    channelUuid: "foobar"
}))

# client_2
# Send message directly via post, will be shown on Client_1
fetch("given_url", {
    method: "Post"
    body: JSON.stringify({
        channelUuid: "foobar",
        payload: "bazzz"
    })
}))
``` 
