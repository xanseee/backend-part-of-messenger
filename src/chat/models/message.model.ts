import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Chat } from 'src/chat/models/chat.model'
import { User } from 'src/users/models/users.model'
import { CreateMessageDto } from '../dto/message.dto'

@Table({ tableName: 'messages' })
export class Message extends Model<Message, CreateMessageDto> {
	@Column({ type: DataType.BIGINT, autoIncrement: true, primaryKey: true })
  	declare id: number;

	@ForeignKey(() => Chat)
	@Column({ type: DataType.UUID })
	declare chatId: string;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID })
	declare senderId: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare content: string;

	@Column({ defaultValue: 'text' })
  	declare messageType: string;

	@Column({ 
		type: DataType.ENUM('sent', 'read'),
		defaultValue: 'sent'
	})
	declare status: 'sent' | 'read';

	@BelongsTo(() => Chat)
	chat: Chat;

	@BelongsTo(() => User)
	sender: User;
}