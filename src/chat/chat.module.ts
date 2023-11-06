import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';

import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports: [UserModule, AuthModule, RoomModule],
  providers: [ChatGateway],
})
export class ChatModule {}
