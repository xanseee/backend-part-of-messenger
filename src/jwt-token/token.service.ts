import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/sequelize'
import { Token } from './models/token.model'

@Injectable()
export class TokenService {
	constructor(
		private jwtService: JwtService,
		@InjectModel(Token) private tokenModel: typeof Token
	) {}

	async generateToken(payload: any): Promise<{ accessToken: string, refreshToken: string }> {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, { expiresIn: '15m' }),
			this.jwtService.signAsync(payload, { expiresIn: '1d' })
		]);
		// const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
		// const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '1d' });
		return { accessToken, refreshToken };
	}

	async saveToken(userId: string, refreshToken: string): Promise<Token> {
		const tokenData = await this.tokenModel.findOne({ where: { userId } });
		if(tokenData) {
			return await tokenData.update({ refreshToken });
		}
		const token = await this.tokenModel.create({userId, refreshToken});
		return token;
	}

	async removeToken(refreshToken: string): Promise<boolean> {
		const isDestroyed = await this.tokenModel.destroy({ where: { refreshToken } });
		return isDestroyed > 0;
	}

	async findToken(refreshToken: string): Promise<Token | null> { 
		const tokenData = await this.tokenModel.findOne({ where: { refreshToken } });
		return tokenData;
	}
	
	validateToken(token: string) { // реализовано так, потому что оба токена подписываются одним ключом, надо поменять
		const userData = this.jwtService.verify(token);
		return userData;
	}
}
