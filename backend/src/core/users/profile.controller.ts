import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('me')
export class ProfileController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me() {
    return this.users.getProfile();
  }
}
