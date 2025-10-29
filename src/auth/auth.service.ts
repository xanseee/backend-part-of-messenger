import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcryptjs';
import { TokenService } from 'src/jwt-token/token.service'
import { User } from 'src/users/models/users.model'

@Injectable()
export class AuthService {
	constructor(
		private userService: UsersService, 
		private tokenService: TokenService
	) {}

	async registration(userDto: CreateUserDto): Promise<{ accessToken: string, refreshToken: string, user: User }> {
		const candidate = await this.userService.getUserByName(userDto.username);
		if(candidate) { 
			throw new BadRequestException('Такой пользователь уже существует '); 
		}

		const hashPassword = await bcrypt.hash(userDto.password, 5);
		const user = await this.userService.createUser({ ...userDto, password: hashPassword }).then(data => data.toJSON());

		const payload = { id: user.id, username: user.username };
		const tokens = await this.tokenService.generateToken(payload);
		await this.tokenService.saveToken(user.id, tokens.refreshToken);
		
		const returnedUser = await this.userService.getUserById(user.id);
		return { ...tokens, user: returnedUser };
	}

	async login(userDto: CreateUserDto): Promise<{ accessToken: string, refreshToken: string, user: User }> {
		const user = await this.validateUser(userDto);

		const payload = { id: user.id, username: user.username };
		const tokens = await this.tokenService.generateToken(payload);
		await this.tokenService.saveToken(user.id, tokens.refreshToken);

		const returnedUser = await this.userService.getUserById(user.id);
		return { ...tokens, user: returnedUser };
	}

	async logout(refreshToken: string): Promise<boolean> {
		const isRemoved = await this.tokenService.removeToken(refreshToken);
		return isRemoved;
	}

	async refresh(refreshToken: string): Promise<{ accessToken: string, refreshToken: string, user: User }> {
		const userData = await this.tokenService.validateToken(refreshToken);
		const tokenFromDb = await this.tokenService.findToken(refreshToken).then(data => data?.toJSON());
		if(!userData || !tokenFromDb) { 
			throw new BadRequestException('Токен невалиден или отсутствует в базе данных');
		}

		const user = await this.userService.getUserByName(userData.username).then(data => data?.toJSON());
		if(!user) {
			throw new BadRequestException('Такой пользователь не существует');	
		}

		const payload = {id: user.id, username: user.username };
		const tokens = await this.tokenService.generateToken(payload);
		await this.tokenService.saveToken(user.id, tokens.refreshToken);

		const returnedUser = await this.userService.getUserById(user.id);
		return { ...tokens, user: returnedUser};
	}

	private async validateUser(userDto: CreateUserDto) {
		const user = await this.userService.getUserByName(userDto.username).then(data => data?.toJSON());
		if(!user) {
			throw new BadRequestException('Такой пользователь не существует');
		}

		const passwordEquals = await bcrypt.compare(userDto.password, user.password);
		if(user && passwordEquals) {
			return user;
		}
		throw new UnauthorizedException({message: "Некорректный пароль или имя пользователя"});
	}
}
