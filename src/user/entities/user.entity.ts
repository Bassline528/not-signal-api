import { Message } from 'src/room/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text',
  {
    nullable: true,
  }
  )
  avatar?: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column('text')
  firstName: string;
  
  @Column('text')
  lastName: string;

  @Column('text', {
    nullable: true,
    })
  refreshToken: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('bool', {
    default: false,
  })
  online: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Room, (room: Room) => room.owner, { eager: true })
  ownerOfRooms: Room[];

  @JoinTable()
  @ManyToMany(() => Room, (room: Room) => room.users, { eager: true })
  roomsParticipant: Room[];

  @JoinTable()
  @ManyToMany(() => Room, (room: Room) => room.bannedUsers, { eager: true })
  bannedRooms: Room[];

  @OneToMany(() => Message, (message: Message) => message.user)
  messages: Message[];
  

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];



  


 
}
