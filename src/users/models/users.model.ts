import { Column, DataType, Table, Model, HasMany, BelongsToMany, HasOne } from 'sequelize-typescript'
import { Chat } from 'src/chat/models/chat.model'
import { ChatParticipant } from 'src/chat/models/chat-participant.model'
import { CreateUserDto } from '../dto/create-user.dto';
import { Token } from 'src/jwt-token/models/token.model'
import { Message } from 'src/chat/models/message.model'

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy'
}

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User, CreateUserDto> {
	@Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
	declare id: string;

	@Column({ type: DataType.STRING(50), unique: true, allowNull: false })
	username: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	password: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	publicKey: string;

	@Column({ type: DataType.ENUM(...Object.values(UserStatus)), allowNull: false, defaultValue: UserStatus.OFFLINE })
	status: UserStatus;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
	lastSeen: Date;

	@BelongsToMany(() => Chat, () => ChatParticipant)
	chats: Chat[];

	@HasMany(() => Message)
	messages: Message[];

	@HasOne(() => Token)
	token: Token;
}