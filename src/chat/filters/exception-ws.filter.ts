import { ArgumentsHost, Catch, Logger } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch()
export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
	private logger: Logger = new Logger('WsException');

	catch(exception: any, host: ArgumentsHost): void {
		 const client: Socket = host.switchToWs().getClient();

		 if(exception instanceof WsException) {
			client.emit('error', {
				message: exception.message,
        		timestamp: new Date().toISOString()
      	});
		 } else {
			this.logger.error(`Unhandled WebSocket error: ${exception}`);
     		client.emit('error', {
     		  	message: 'Internal server error',
     		  	timestamp: new Date().toISOString()
     		});
		 }
	}
}