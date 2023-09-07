import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @ManyToOne(() => Message, (message) => message.attachments)
  message: Message;
}
