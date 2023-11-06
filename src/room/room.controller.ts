import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RequestWithUser } from './interfaces/request-with-user.interface';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

import { RoomService } from './room.service';

import { OwnershipGuard } from './guards/ownership.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParticipantGuard } from './guards/participant.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/role.interface';

@ApiBearerAuth()
@Auth()
@ApiTags('Room')
@Controller({
  path: 'room',
  version: '1',
})
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':id')
  @UseGuards(ParticipantGuard)
  async findOne(@Param('id') id: string) {
    return this.roomService.getRoom(id);
  }

  @Get()
  async findAll() {
    return this.roomService.getAllRooms();
  }
  

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    createRoomDto.ownerId = req.user.id;

    return this.roomService.createRoom(createRoomDto);
  }

  @UseGuards(OwnershipGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.updateRoom(id, updateRoomDto);
  }

  @UseGuards(OwnershipGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}
