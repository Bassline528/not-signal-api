import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    
  }
}
