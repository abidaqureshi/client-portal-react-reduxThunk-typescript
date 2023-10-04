import { Action } from 'redux';
import { User } from '../../models/User';

export interface UsersUpdatedAction extends Action {
    users: User[];
}

export interface UserAction extends Action {
    user: User;
}
