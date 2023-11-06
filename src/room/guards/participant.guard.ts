import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { RequestWithUser } from '../interfaces/request-with-user.interface';

import { RoomService } from '../room.service';

@Injectable()
export class ParticipantGuard implements CanActivate {
  constructor(private readonly roomSerivce: RoomService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        
        const roomId = req.params.id;

       const isParticipant = await this.roomSerivce.isUserParticipant(req.user.id, roomId);

        if (isParticipant) {
          resolve(true);
        }

        resolve(false);
      } catch (e) {}
    });
  }
}
