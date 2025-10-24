import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize'

import { TokenService } from './token.service';

import { Token } from './models/token.model'

@Module({
  providers: [TokenService],
  imports: [
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || "sEcReT",
    }),
    SequelizeModule.forFeature([Token])
  ],
  exports: [TokenService, JwtModule]
})
export class TokenModule {}
