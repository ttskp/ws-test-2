import websocket, {connection, IUtf8Message} from 'websocket';
import http from 'node:http';

const httpServer = http.createServer((request, response) => {
  console.log(`${new Date()} Received request for ${request.url}`);
  response.writeHead(404);
  response.end();
});

httpServer.listen(8008, 'localhost', () => {
  console.log(`${new Date()} Server is listening on port 8008`);
});

const wsServer = new websocket.server({
  httpServer,
  autoAcceptConnections: false
});

const send = async (connection: websocket.connection, message: any) => new Promise<void>((resolve, reject) => {
  const utfMessage = JSON.stringify(message);
  log(`Sending ${utfMessage}`);
  connection.sendUTF(utfMessage, (error => {
    if (error) {
      reject(error);
    } else {
      resolve()
    }
  }));
});


const log = (message: string) => {
  console.log(`${new Date()} ${message}`);
}


const channels: Record<string, connection[]> = {};

wsServer.on('request', async request => {
  try {

    const connection = request.accept();
//    connections.push(connection);
    connection.on('message', (event) => {
      const e = event as IUtf8Message
      const data = JSON.parse(e.utf8Data);
      log('incoming...');
      log(e.utf8Data);

      if(data.command === 'create-or-join-channel'){
        log('create or join....');
        if(channels[data.channelUuid] === undefined){
          channels[data.channelUuid] = [connection];
          connection.send('channel created '+data.channelUuid)
        } else {
          channels[data.channelUuid].push(connection);
          connection.send('channel joined '+data.channelUuid)
        }
        return;
      }

      for (const e of (channels[data.channelUuid] ?? [])) {
        try {
          e.send(data.payload);
        } catch(e){
          console.log(e)
          connection.send('error');
        }
      }

    });
  } catch (e) {
    console.error(e);
  }
});