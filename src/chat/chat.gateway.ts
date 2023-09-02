import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const senderId = client.handshake.query.senderId;
    const recipientId = client.handshake.query.recipientId;

    const senderPublicKey = client.handshake.query.senderPublicKey;

    const recipientPublicKey = 'asd';
    client.emit('publicKeyExchange', { userId: recipientId, publicKey: recipientPublicKey });
  }
}
