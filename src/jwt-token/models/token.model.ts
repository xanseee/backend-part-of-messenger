import { Column, Table, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Col } from 'sequelize/lib/utils'
import { User } from 'src/users/models/users.model'

interface createToken {
	userId: string,
	refreshToken: string
}

@Table({ tableName: 'tokens'})
export class Token extends Model<Token, createToken> {
	@Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
	declare id: string;
	
	@ForeignKey(() => User)
	@Column({ type: DataType.UUID, allowNull: false })
	userId: string;

	@BelongsTo(() => User)
	user: User;

	@Column({ type: DataType.TEXT, allowNull: false })
	refreshToken: string;
} 