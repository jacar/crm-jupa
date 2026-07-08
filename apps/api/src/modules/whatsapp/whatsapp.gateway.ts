import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/whatsapp',
})
export class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsappGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado al websocket de WhatsApp: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  emitQr(qr: string) {
    if (this.server) this.server.emit('qr', qr);
  }

  emitStatus(status: 'disconnected' | 'connecting' | 'connected') {
    if (this.server) this.server.emit('status', status);
  }

  emitMessage(message: any) {
    if (this.server) this.server.emit('message', message);
  }
}
