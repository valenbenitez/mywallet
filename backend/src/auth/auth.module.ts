import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CircleModule } from '../circle/circle.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { loadAuthEnv } from './auth.config.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    CircleModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => {
        const { jwtSecret, jwtExpiresIn } = loadAuthEnv();
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: jwtExpiresIn },
        } as JwtModuleOptions;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
