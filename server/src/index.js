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

export class Relay10 {
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
        this.clients.push(server);
        server.send('registered as client');
        return;
      }
      if(event.data === 'register-as-recorder'){
        console.log('register as recorder');
        this.recorders.push(server);
        server.send('registered as recorder');
        return;
      }
      console.log('received data');

      const data = JSON.parse(event.data);
      if(data.to !== 'client' && data.to !== 'recorder'){
        server.send('unknown message');
        return;
      }
      for (const e of data.to === 'client' ? this.clients : this.recorders) {
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