import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ProfileController } from './users/profile.controller';
import { UsersService } from './users/users.service';
import { User } from './users/user.entity';
import { RefreshToken } from './tokens/refresh-token.entity';
import { Address } from './addresses/address.entity';
import { OtpCode } from './otp/otp-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Address, OtpCode]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'change-me-access'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class CoreModule {}
