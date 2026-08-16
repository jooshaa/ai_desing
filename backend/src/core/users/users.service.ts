import { Injectable, NotImplementedException } from '@nestjs/common';
import type { UserDto } from '@imora/shared-types';

@Injectable()
export class UsersService {
  getProfile(): UserDto {
    throw new NotImplementedException('Auth guard + profile read not implemented');
  }
}
