import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { Chat } from 'src/chat/models/chat.model';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User) private userModel: typeof User) { }

	async createUser(dto: CreateUserDto): Promise<User> {
		const user = await this.userModel.create(dto);
		return user;
	}

	async getUserWithChats(username: string): Promise<User> {
		const user = await this.userModel.findOne({
			where: { username }, 
			include: {
				model: Chat,
				as: 'chats'
			},
			attributes: {
				exclude: ['password', 'publicKey']
			}
		});
		if(!user) {
			throw new NotFoundException('такой пользователь не найден');
		}
		return user;
	}

	async getUserById(userId: string): Promise<User> {
		const user = await this.userModel.findOne({
			where: { id: userId },
			attributes: {
				exclude: ['password', 'publicKey']
			}
		});
		if(!user) {
			throw new NotFoundException('такой пользователь не найден');
		}
		return user;
	}

	async getUserByName(username: string): Promise<User | null> {
		const user = this.userModel.findOne({ 
			where: { username },
		});
		return user;
	}
}
