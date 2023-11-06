import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { hashData } from 'src/utils/hash.util';
import { Room } from 'src/room/entities/room.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const {  password, ...userData } = createUserDto;

      const hashedPassword =  await hashData(password);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      } );
      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.username',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.avatar',
        'user.online',
        'user.createdAt',
        'user.updatedAt',
      ])
      .where('user.isActive = :isActive', { isActive: true }) // Exclude inactive users
      .skip(offset)
      .take(limit);

    const users = await query.getMany();
    return users;
  }

  async findOne(id: string) {
    // return user with rooms on where he is participant

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roomsParticipant', 'roomsParticipant')
      .select()
      .where('user.id = :id', { id });
      
      const user = await query.getOne();

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    
  }

  async findOneByTerm(term: string) {
    let user: User;

    if (isUUID(term)) {
      user = await this.userRepository.findOneBy({
        id: term,
      });
    } else {
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      user = await queryBuilder
        .where('user.email = :email', { email: term })
        .orWhere('user.username = :username', { username: term })
        .getOne();
      

      return user;
    }
  }

  async updateUserRoom(id: string, room: Room) {
    const user = await this.userRepository.findOneBy({
      id
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${id}`);
    }

    const isBanned = user.bannedRooms?.find(
      (bannedRoom) => bannedRoom.id === room?.id,
    );

    if (isBanned) {
      throw new ForbiddenException(`You have been banned from this room`);
    }

    user.roomsParticipant = [...user.roomsParticipant, room ]
    
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async updateOnline(id: string, online: boolean) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    user.online = online;
    const updatedUser = await this.userRepository.save(user);
    delete updatedUser.password;
    return updatedUser;
  }
  

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException('Username or email already taken');

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
