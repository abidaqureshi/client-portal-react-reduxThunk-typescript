
import { UserRole } from './UserRole';

export interface CreateUser { 
    username: string;
    password: string;
    roles: UserRole[];
    email?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    streakApiKey?: string;
}