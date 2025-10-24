import { CanActivate, ExecutionContext, Injectable, NestMiddleware } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { TokenService } from 'src/jwt-token/token.service'

@Injectable()
export class WsAuthGuard implements CanActivate {
	constructor(private readonly tokenService: TokenService) {}

	canActivate(context: ExecutionContext): boolean {
		const client: Socket = context.switchToWs().getClient();
		if(!client.data.user) {
			throw new WsException('Unauthorized connection attempt');
		}
		return true;
		// const client: Socket = context.switchToWs().getClient();
		// const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
		// if(!token) {
		// 	throw new WsException('Authentication token required');
		// }

		// try {
		// 	const payload = this.tokenService.validateToken(token);
		// 	client.data = payload;
		// 	return true;
		// } catch (e) {
		// 	throw new WsException('Unauthorized');
		// }
	}
}