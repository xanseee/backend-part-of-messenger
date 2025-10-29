import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { ChatService } from '../chat.service'
import { Socket } from 'socket.io'
import { WsException } from '@nestjs/websockets'

@Injectable()
export class IsInChat implements CanActivate {
	constructor(private readonly chatService: ChatService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const client: Socket = context.switchToWs().getClient();
			const data = context.switchToWs().getData();
			const user = client.data.user;
			
			const isInChat = await this.chatService.isInChat(user.id, data.chatId);
			if(!isInChat) {
				throw new WsException('You are not a participant of this chat');
			}
			return true;
		} catch {
			throw new WsException('You are not a participant of this chat');
		}		
	}
}