import { Injectable, NotImplementedException } from '@nestjs/common';
import type { TokenPairDto } from '@imora/shared-types';
import type { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  async requestOtp(_phone: string): Promise<void> {
    throw new NotImplementedException('OTP provider is an open question (IMORA_TZ §11)');
  }

  async verifyOtp(_dto: VerifyOtpDto): Promise<TokenPairDto> {
    throw new NotImplementedException('JWT issue flow lands in core week-0');
  }

  async refresh(_token: string): Promise<TokenPairDto> {
    throw new NotImplementedException('Refresh rotation not implemented');
  }

  async logout(): Promise<void> {
    throw new NotImplementedException('Logout not implemented');
  }
}
