// Worker

export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  }
}

async function handleRequest(request, env) {
  const id = env.RELAY.idFromName("relay2");
  let relayObject = env.RELAY.get(id);
  return relayObject.fetch(request);
}

// Durable Object

export class Relay11 {
  constructor(state, env) {
    this.channels = {};
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      if(request.method === 'POST'){
          const data = JSON.parse(request.body);
          for (const e of (this.channels[data.channelUuid] ?? [])) {
            try {
              e.send(data.payload);
            } catch(e){
              console.log(e)
            }
          }
          return new Response('', { status: 200 });
      }
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    server.accept();

    server.addEventListener('message', async event => {
      const data = JSON.parse(event.data);
      console.log('incoming...');
      console.log(event.data);

      if(data.command === 'create-or-join-channel'){
        console.log('create or join....');
        console.log(this.channels)
        if(this.channels[data.channelUuid] === undefined){
          this.channels[data.channelUuid] = [server];
          server.send('channel created '+data.channelUuid)
        } else {
          this.channels[data.channelUuid].push(server);
          server.send('channel joined '+data.channelUuid)
        }
        return;
      }

      for (const e of (this.channels[data.channelUuid] ?? [])) {
        try {
          e.send(data.payload);
        } catch(e){
          console.log(e)
          server.send('error');
        }
      }

    });

    server.send('connected');
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}