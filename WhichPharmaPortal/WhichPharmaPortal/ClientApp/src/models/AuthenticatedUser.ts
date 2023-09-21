
import { UserRole } from './UserRole';

export interface AuthenticatedUser { 
    username: string;
    accessToken: string;
    roles: UserRole[];
    settings?: { [key: string]: string; };
    email?: string;
    imageUrl?: string;
}