
import { UserRole } from './UserRole';

export interface User { 
    username: string;
    roles: UserRole[];
    isLinkedToThirdPartyLogin?: boolean;
    email?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    imageUrl?: string;
    streakApiKey?: string;
}