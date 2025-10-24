import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { TokenModule } from 'src/jwt-token/token.module'
import { RefreshTokenMiddleware } from 'src/jwt-token/middlewares/refresh-token.middleware'

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UsersModule,
    TokenModule
  ],
  exports: [
    AuthService,
  ]
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(RefreshTokenMiddleware)
        .forRoutes(
          { path: 'auth/logout', method: RequestMethod.POST },
          { path: 'auth/refresh', method: RequestMethod.GET },
        );
  }
}
