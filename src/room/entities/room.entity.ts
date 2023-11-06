import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  OneToOne,
  ManyToOne,
} from 'typeorm';

import { Message } from './message.entity';
import { User } from 'src/user/entities/user.entity';

@Entity({
  name: 'rooms',
})
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 60, nullable: true })
  description: string;

  @Column({ nullable: true})
  avatar: string;

  @ManyToOne(() => User, (user: User) => user.ownerOfRooms)
  owner: User;

  @ManyToMany(() => User, (user: User) => user.roomsParticipant, )
  users: User[];

  @ManyToMany(() => User, (user: User) => user.bannedRooms)
  bannedUsers: User[];

  @OneToMany(() => Message, (message: Message) => message.room)
  messages: Message[];
}
