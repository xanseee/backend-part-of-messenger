import { Column, Model, Table, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript'
import { User } from 'src/users/models/users.model'
import { ChatParticipant } from './chat-participant.model'
import { CreateChatModel } from '../dto/chat.dto'
import { Message } from './message.model'

@Table({ tableName: 'chats' })
export class Chat extends Model<Chat, CreateChatModel> {
	@Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
	declare id: string;

	@Column({ type: DataType.STRING(50), allowNull: false })
	declare name: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
	declare isGroup: boolean;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID })
	declare createdBy: string;

	@BelongsTo(() => User)
	creator: User;

	@BelongsToMany(() => User, () => ChatParticipant)
	participants: User[];

	@HasMany(() => Message)
	messages: Message[];
}