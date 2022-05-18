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

export class Relay6 {
  constructor(state, env) {
    this.state = state;
    this.clients = [];
    this.recorders = [];
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    console.log('hello');

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    server.accept();

    server.addEventListener('message', async event => {
      if(event.data === 'register-as-client'){
        console.log('register as client');
        server.send('registered as client');
        this.clients.push(server);
        return;
      }
      if(event.data === 'register-as-recorder'){
        console.log('register as recorder');
        server.send('registered as recorder');
        let value = (await this.state.storage.get("recorders")) || [];
        this.recorders.push(server);
        return;
      }
      console.log('received data');

      const data = JSON.parse(event.data);
      console.log(data);
      if(data.to === 'client'){
        for (const e of this.clients) {
          try {
            return e.send(data.payload);
          } catch(e){
            console.log(e)
          }
        }
        server.send('message send');

        return;
      }

      if(data.to === 'recorder'){
        for (const e of this.recorders) {
          try {
            return e.send(data.payload);
          } catch(e){
            console.log(e)
          }
        }
        server.send('message send');
        return;
      }

      server.send('unknown message');

    });

    server.send('connected');
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}