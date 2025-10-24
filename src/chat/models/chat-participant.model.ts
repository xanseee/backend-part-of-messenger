import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Chat } from './chat.model'
import { User } from 'src/users/models/users.model';
import { CreateChatParticipantsModel } from '../dto/chat.dto'

@Table({ tableName: 'chat-participant', timestamps: false })
export class ChatParticipant extends Model<ChatParticipant, CreateChatParticipantsModel> {
	@ForeignKey(() => Chat)
	@Column({ type: DataType.UUID })
	declare chatId: string;

	@BelongsTo(() => Chat)
	chat: Chat;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID })
	declare userId: string;

	@BelongsTo(() => User)
	user: User;

	@Column({ type: DataType.STRING(20), defaultValue: 'member' })
	declare role: string;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	declare joinedAt: Date;
}