import { ForbiddenException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';

import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { RoomService } from 'src/room/room.service';

import { AddMessageDto } from './dto/add-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { KickUserDto } from './dto/kick-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { WebsocketExceptionsFilter } from 'src/room/exceptions/ws.exception';

@UsePipes(new ValidationPipe())
@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
      
      const token = client.handshake.headers['x-token']
      const payload = await this.authService.verifyAccessToken(token.toString());
  
      const user = payload && (await this.userService.findOne(payload.id));
      const rooms = user?.roomsParticipant;
  
      if (!user) {
        client.disconnect(true);
  
        return;
      }
  
      this.connectedUsers.set(client.id, user.id);
  
      if (rooms) {
        return rooms.forEach(room => {
          client.join(room.id);
        });
      }
    
  }

  async handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto) {
    const userId = this.connectedUsers.get(client.id);
    const user = await this.userService.findOne(userId);

    if (!user.roomsParticipant) {
      return;
    }

    const message = await this.roomService.createMessage(user,addMessageDto);


    client.to(addMessageDto.roomId).emit('message', {
      id: message.id,
      message: message.text,
      sendBy: message.user.id,
      createdAt: message.created_at,
    });
  }

  // @SubscribeMessage('join')
  // async onRoomJoin(client: Socket, joinRoomDto: JoinRoomDto) {
  //   const { roomId } = joinRoomDto;
  //   const limit = 10;

  //   const room = await this.roomService.getRoom(roomId);

  //   if (!room) return;

  //   const userId = this.connectedUsers.get(client.id);
  //   const messages = room.messages.slice(limit * -1);
  //   console.log("USERID=>", userId);


  //   await this.userService.updateUserRoom(userId, room);

  //   client.join(roomId);
  // }

  @SubscribeMessage('leave')
  async onRoomLeave(client: Socket, leaveRoomDto: LeaveRoomDto) {
    const { roomId } = leaveRoomDto;
    const userId = this.connectedUsers.get(client.id);

    await this.userService.updateUserRoom(userId, null);

    client.leave(roomId);
  }

  @SubscribeMessage('user-kick')
  async onUserKick(client: Socket, kickUserDto: KickUserDto) {
    const { roomId, reason } = kickUserDto;

    const userId = this.connectedUsers.get(client.id);
    const room = await this.roomService.getRoom(roomId);
    const user = await this.userService.findOneByTerm(userId);

    if (user !== room.owner) {
      throw new ForbiddenException(`You are not the owner of the room!`);
    }

    await this.userService.updateUserRoom(kickUserDto.userId, null);

    const kickedClient = this.getClientByUserId(kickUserDto.userId);

    if (!kickedClient) return;

    client.to(kickedClient.id).emit('kicked', reason);
    kickedClient.leave(roomId);
  }

  @SubscribeMessage('user-ban')
  async onUserBan(client: Socket, banUserDto: BanUserDto) {
    const { roomId, reason } = banUserDto;

    const userId = this.connectedUsers.get(client.id);
    const room = await this.roomService.getRoom(roomId);
    const user = await this.userService.findOneByTerm(userId);

    if (user !== room.owner) {
      throw new ForbiddenException(`You are not the owner of the room!`);
    }

    if (userId === banUserDto.userId) {
      throw new ForbiddenException(`You can't ban yourself`);
    }

    await this.roomService.banUserFromRoom(banUserDto);

    const bannedClient = this.getClientByUserId(banUserDto.userId);

    if (!bannedClient) return;

    client.to(bannedClient.id).emit('banned', reason);
    bannedClient.leave(roomId);
  }

  private getClientByUserId(userId: string): Socket | null {
    for (const [key, value] of this.connectedUsers.entries()) {
      if (value === userId) {
        const kickedClient = this.server.sockets.sockets.get(key);

        return kickedClient;
      }
    }

    return null;
  }
}
