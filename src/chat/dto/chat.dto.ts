export interface CreateChatDto {
	name: string;
	isGroup: boolean;
	createdBy: string;
	participantIds: string[];
}

export interface CreateChat {
	name: string;
	isGroup: boolean;
	participantIds: string[];
}

export interface CreateChatModel {
	name: string;
	isGroup: boolean;
	createdBy: string;
}

export interface CreateChatParticipantsModel {
	chatId: string;
	userId: string;
	role: string;
}