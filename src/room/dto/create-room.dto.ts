import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsString()
  @IsOptional()
  readonly avatar: string;

  @IsString()
  ownerId: string;

  @IsArray()
  participantsIds: string[];
}
