import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Inject, Logger, UseFilters, UseGuards } from '@nestjs/common'
import { WebSocketExceptionFilter } from './filters/exception-ws.filter'
import { WsAuthGuard } from './guards/auth-ws.guard'
import { TokenService } from 'src/jwt-token/token.service'
import { ChatService } from './chat.service'
import type { GetMessagesDto, SendMessageDto } from './dto/message.dto'
import { IsInChat } from './guards/is-in-chat.guard'
import type { CreateChat, CreateChatDto } from './dto/chat.dto'

@WebSocketGateway({ namespace: '/chat' })
@UseGuards(WsAuthGuard)
@UseFilters(new WebSocketExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private logger: Logger = new Logger('ChatGateway');
  
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, string>();

  constructor(
    @Inject(TokenService) private readonly tokenService: TokenService,
    @Inject(ChatService) private readonly chatService: ChatService
  ) {}

  afterInit(server: Server) {
    server.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication token required'));

      try {
        const user = this.tokenService.validateToken(token);
        socket.data.user = user;
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;
    if(!user?.id) {
      throw new WsException('Unauthorized connection attempt');
    }

    this.userSockets.set(user.id, client.id);
    this.logger.log(`CLient connected ${client.id}`);

    const userChats = await this.chatService.getUserChats(user.id);

    for(const chat of userChats) {
      client.join(chat.id);
      client.to(chat.id).emit('user_status', { userId: user.id, status: 'online' });
    }

    this.logger.log(`User ${client.id} joined ${userChats.length} rooms`);
    client.emit('get_chats', userChats);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if(user?.id) {
      const userChats = await this.chatService.getUserChats(user.id);

      for(const chat of userChats) {
        client.to(chat.id).emit('user_status', { userId: user.id, status: 'offline' });
      }

      this.userSockets.delete(user.id);
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('send_message')
  @UseGuards(IsInChat)
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: SendMessageDto) {
    const user = client.data.user;

    const createMsgParams = {...data, senderId: user.id};
    const message = await this.chatService.saveMessage(createMsgParams);

    this.server.to(data.chatId).emit('new_message', message.toJSON());
  }

  @SubscribeMessage('get_messages')
  @UseGuards(IsInChat)
  async handleGetMessages(@ConnectedSocket() client: Socket, @MessageBody() data: GetMessagesDto) {
    const user = client.data.user;
    const { chatId, limit, page } = data;

    await this.chatService.markMessagesAsRead(data.chatId, user.id);

    const messages = await this.chatService.getMessagesByChatId(chatId, limit, page);

    client.to(data.chatId).emit('messages_read', { chatId: data.chatId });

    client.emit('get_messages', messages);
  }

  @SubscribeMessage('create_chat')
  async handleCreateChat(@ConnectedSocket() client: Socket, @MessageBody() data: CreateChat) {
    const creator = client.data.user;

    const createChatParams = {...data, createdBy: creator.id};
    const chat = await this.chatService.createChat(createChatParams).then(res => res.toJSON());
    
    for(const userId of data.participantIds) {
      const socketId = this.userSockets.get(userId);

      if(socketId) {
        this.server.sockets.sockets.get(socketId)?.join(chat.id);
        this.server.to(socketId).emit('new_chat', chat);
      }
    }

    client.emit('new_chat', chat);
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    const chatId = data.chatId;
    const chatParticipants = await this.chatService.getChatParticipants(chatId); // верни массив [{ id: string }]
    const online = chatParticipants
      .map((u) => u.id)
      .filter((id) => this.userSockets.has(id));

    client.emit('online_users', { chatId, online });
  }
}
