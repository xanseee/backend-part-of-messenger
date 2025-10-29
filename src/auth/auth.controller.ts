import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { AuthInterceptor } from './interceptors/auth.interceptor'
import { type Request, type Response } from 'express'

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('/registration') 
   @UseInterceptors(AuthInterceptor)
   async registration(@Body() userDto: CreateUserDto) {
      const userData = await this.authService.registration(userDto);
      return userData;
   }

   @Post('/login')
   @UseInterceptors(AuthInterceptor)
   async login(@Body() userDto: CreateUserDto) {
      const userData = await this.authService.login(userDto);
      return userData;
   }

   @Post('/logout')
   async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
      const { refreshToken } = request.cookies;
      const isLogout = await this.authService.logout(refreshToken);
      response.clearCookie('refreshToken');
      return { isLogout };
   }

   @Get('/refresh')
   @UseInterceptors(AuthInterceptor)
   async refresh(@Req() request: Request) {
      const { refreshToken } = request.cookies;
      const userData = await this.authService.refresh(refreshToken);
      return userData;
   }
}
