export interface CreateMessageDto { 
	chatId: string;
  	senderId: string;
  	content: string;
  	messageType?: string;
	status?: string;
}

export interface GetMessagesDto {
	chatId: string,
	page: number,
	limit: number
}

export interface SendMessageDto {
	chatId: string;
	content: string;
	messageType?: string
}