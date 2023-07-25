import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Notify } from "./notify.entity";
import { NotifyService } from "./notify.services";

@Controller('notify')
export class NotifyConroller {
  constructor(
    private readonly notifyService: NotifyService
  ) { }

  //get
  @UseGuards(AuthGuard('jwt'))
  @Get('/recInvites')
  async findRecInvitesForUser(@Request() req: any): Promise<any[]> {
    let result = this.notifyService.findAllByWhoId(req.user ? req.user.id : req.player.id);    
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/sendInvites')
  async findsendInvitesForUser(@Request() req: any): Promise<any[]> {
    let result = this.notifyService.findAllByInitiatorId(req.user ? req.user.id : req.player.id);    
    return result;
  }
}
