import { ApplicationState } from '..';
import { User } from '../../models/User';
import { UserRole } from '../../models/UserRole';

export const getMyUser = (state: ApplicationState): User | undefined =>  
    (state.session.user?.username && state.users.users?.find((u) => u.username === state.session.user?.username)) || undefined;
export const getUsers = (state: ApplicationState): User[] => state.users.users;
export const getUsersCollaborators = (state: ApplicationState): User[] => state.users.users.filter(u => !!u.roles?.includes(UserRole.Collaborator));
export const getUser = (state: ApplicationState, username: string): User | undefined =>
    state.users.users?.find((u) => u.username === username) || undefined;
export const isUpdatingUsers = (state: ApplicationState): boolean => state.users.updating;
export const getMyRoles = (state: ApplicationState): UserRole[] => state.session.user?.roles || [];