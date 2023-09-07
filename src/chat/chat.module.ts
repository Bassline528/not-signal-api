import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { UserChat } from './entities/user-chat.entity';
import { Attachment } from './entities/attachment.entity';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [
    TypeOrmModule.forFeature([ Chat, Message, UserChat, Attachment ]),
  ],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
