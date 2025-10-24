import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize'
import { Chat } from './models/chat.model'
import { Message } from './models/message.model'
import { ChatParticipant } from './models/chat-participant.model'
import { CreateMessageDto } from './dto/message.dto'
import { User } from 'src/users/models/users.model'
import { CreateChatDto } from './dto/chat.dto'
import { Op } from 'sequelize'

@Injectable()
export class ChatService {

	constructor(
		@InjectModel(Chat) private chatModel: typeof Chat,
		@InjectModel(Message) private messageModel: typeof Message,
		@InjectModel(ChatParticipant) private chatParticipantModel: typeof ChatParticipant,
	) {}

	async getUserChats(userId: string) {
		const participations: ChatParticipant[] = await this.chatParticipantModel.findAll({
			where: { userId },
			include: [{model: Chat}]
		});
		return participations.map(p => p.toJSON().chat);
	}

	async isInChat(userId: string, chatId: string): Promise<boolean> {
		const participant = await this.chatParticipantModel.findOne({
			where: {userId, chatId}
		});
		return !!participant;
	}

	async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
		const { chatId, senderId, content, messageType } = createMessageDto;
		const message = await this.messageModel.create({ chatId, senderId, content, messageType });
		return message;
	}

	async getMessagesByChatId(chatId: string, limit: number = 50, page: number = 1): Promise<Message[]> {
		const offset = (page - 1) * limit;

		const messages = await this.messageModel.findAll({
			where: { chatId },
			limit, 
			offset,
			order: [['createdAt', 'ASC']],
			include: [
				{
					model: User, 
					as: 'sender',
					attributes: ['id']
				}
			],
			attributes: ['id', 'content', 'messageType', 'createdAt']
		});

		return messages;
	}

	async createChat(createChatDto: CreateChatDto): Promise<Chat> {
		const { name, isGroup, createdBy, participantIds } = createChatDto;

		const chat = await this.chatModel.create({ name, isGroup, createdBy });

		let otherRoles = isGroup ? 'member' : 'admin';
		const participants = [
			{ chatId: chat.id, userId: createdBy, role: 'admin' },
			...participantIds.map(id => ({ chatId: chat.id, userId: id, role: otherRoles }))
		];
		await this.chatParticipantModel.bulkCreate(participants);

		const createdChat = await this.chatModel.findByPk(chat.id, {
			include: [
				{
					model: User,
					as: 'creator',
					attributes: ['id', 'username']
				},
				{
					model: User,
					as: 'participants',
					through: { attributes: ['role'] },
					attributes: ['id', 'username']
				}
			]
		});
		if(!createdChat) { throw new Error('Chat not found after creation'); }

		return createdChat;
	}

	async markMessagesAsRead(chatId: string, userId: string) {
		await this.messageModel.update({ status: 'read' }, {
			where: {
				chatId,
				status: 'sent',
				senderId: { [Op.ne]: userId }
			}
		});
	}

}
