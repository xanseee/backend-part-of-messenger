export interface AuthenticatedRequest extends Request {
	user: {
		id: string;
		username: string;
	}
}