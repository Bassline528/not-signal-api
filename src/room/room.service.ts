import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Message } from './entities/message.entity';
import { UserService } from 'src/user/user.service';
import { BanUserDto } from 'src/chat/dto/ban-user.dto';
import { AddMessageDto } from 'src/chat/dto/add-message.dto';
import { UpdateMessageDto } from '../chat/dto/update-message.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto) {
    const { ownerId, participantsIds, name, description, avatar } = createRoomDto;

    // Ensure owner and participants exist and are valid users
    const [ownerUser, participantUsers] = await Promise.all([
      this.userService.findOne(ownerId),
      Promise.all(participantsIds.map((participantId) => this.userService.findOne(participantId))),
    ]);

    if (!ownerUser || participantUsers.some((user) => !user)) {
      throw new NotFoundException('Invalid owner or participant(s).');
    }
    

    const roomParticipants: User[] = [ownerUser, ...participantUsers];

    // Create a new room entity
    const room = this.roomRepository.create({
      name,
      description,
      avatar,
      owner: ownerUser,
      users: roomParticipants,
    });


    // Save the room to the database
    const createdRoom = await this.roomRepository.save(room);

    const { owner, users, ...createdRoomData } = createdRoom;

    const { password, refreshToken, isActive, roles, createdAt, updatedAt, ...ownerData } = owner;

    const participants = users.map(({ password, refreshToken, isActive, roles, createdAt, updatedAt, ...participantData }) => participantData);

    return {
      ...createdRoomData,
      owner: ownerData,
      participants,
    }
  }

  async getRoom(roomId: string): Promise<Room> {
    const room = await this.roomRepository.findOne( {
      where: { id: roomId },
      relations: ['users', 'messages'],
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }


    return room;
  }

  async getAllRooms(): Promise<Room[]> {
    const rooms = await this.roomRepository.find({
      relations: ['users', 'messages'],
    });

    

    return rooms;
  }
 
  async getRoomWithMessages(roomId: string) {
      // Find the room by its ID, populate details about messages and their senders
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: ['messages', 'messages.sender'],
      });
  
      if (!room) {
        throw new NotFoundException('Room not found.');
      }

      // Return the messages
      return room;
  }


  async banUserFromRoom(banUserDto: BanUserDto) {
    const { userId, roomId } = banUserDto;

    const user = await this.userService.findOne(userId);
    const room = await this.getRoom(roomId);

    await this.userService.updateUserRoom(userId, null);

    const bannedUsers = { ...room.bannedUsers, ...user };
    const updatedRoom = await this.roomRepository.preload({
      id: roomId,
      bannedUsers,
    });

    return this.roomRepository.save(updatedRoom);
  }

  async createMessage(sender: User, addMessageDto: AddMessageDto) {
    const {text, roomId} = addMessageDto;


    // Find the room by its ID
    const room = await this.getRoom(
     roomId
    );

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    try {
      const message = this.messageRepository.create({
        text,
        room,
        user: sender,
      })

      // Save the message to the database
      const createdMessage = await this.messageRepository.save(message);
  
      // Return the message
      return createdMessage;
      
    } catch (error) {
      throw new InternalServerErrorException();
    }

  }

  async updateMessage(messageId: string ,updateMessageDto: UpdateMessageDto) {
    const { text } = updateMessageDto;

    // find message by id
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    try {
      
      // check createdAt date, if more than 10 minutes ago, throw error
      const createdAt = message.created_at;
  
      const currentDate = new Date();
      const tenMinutes = 10 * 60 * 1000;
      const tenMinutesAgo = new Date(currentDate.getTime() - tenMinutes);
  
      if (createdAt < tenMinutesAgo) {
        throw new ForbiddenException('Message can no longer be edited.');
      }
  
      // update message
      message.text = text;
  
      // save message
      const updatedMessage = await this.messageRepository.save(message);
  
      // return message
      return updatedMessage;
    } catch (error) {
      throw new InternalServerErrorException();
    }

  }

  async updateRoom(roomId: string, updateRoomDto: UpdateRoomDto) {
    
    // find the room
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    try {
      
      // update room
      room.name = updateRoomDto.name;
      room.description = updateRoomDto.description;
      room.avatar = updateRoomDto.avatar;
  
      // save room
      const updatedRoom = await this.roomRepository.save(room);
  
      // return room
      return updatedRoom;

    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getUserRooms(userId: string) {
    // Find all rooms where the user is a participant
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoinAndSelect('room.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    return rooms;
  }

  async isUserParticipant(userId: string, roomId: string) : Promise<boolean> {
    const room = await this.getRoom(roomId);


    const roomParticipants = room.users;

    const isParticipant = roomParticipants.some((participant) => participant.id === userId);

    return isParticipant;
  }

  async remove(id: string) {
    const room = await this.getRoom(id);
    return this.roomRepository.remove(room);
  }
}
