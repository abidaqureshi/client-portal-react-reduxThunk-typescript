
import { UserRole } from './UserRole';

export interface UpdateUser { 
    password?: string;
    email?: string;
    roles?: UserRole[];
    firstName?: string;
    lastName?: string;
    title?: string;
    streakApiKey?: string;
}