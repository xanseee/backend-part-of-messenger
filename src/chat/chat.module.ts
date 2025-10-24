import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SequelizeModule } from '@nestjs/sequelize'
import { Message } from './models/message.model'
import { ChatParticipant } from './models/chat-participant.model'
import { Chat } from './models/chat.model'
import { TokenModule } from 'src/jwt-token/token.module'
import { User } from 'src/users/models/users.model'

@Module({
  providers: [
    ChatGateway,
    ChatService
  ],
  imports: [
    SequelizeModule.forFeature([Chat, ChatParticipant, Message, User]),
    TokenModule
  ],
  exports: [ChatService]
})
export class ChatModule{ }