import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { UsersState } from './state';
import { UsersUpdatedAction, UserAction } from './types';
import { Actions as SessionActions } from '../Session/actions';
import { LoggedInAction } from '../Session/types';

const unloadedState: UsersState = {
    users: [],
    updating: false,
};

export const persistor = (state: UsersState): UsersState => ({
    ...state,
    updating: false,
});

export const reconciler = persistor;

export const reducer: Reducer<UsersState> = (state: UsersState = unloadedState, action: Action): UsersState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return unloadedState;
        case SessionActions.loggedIn:
            return handleUserLogin(state, action as LoggedInAction)
        case Actions.usersUpdated:
            return handleUsersUpdated(state, action as UsersUpdatedAction);
        case Actions.userUpdated:
            return handleUserUpdated(state, action as UserAction);
        case Actions.userCreated:
            return handleUserCreated(state, action as UserAction);
        case Actions.usersUpdating:
            return handleUsersUpdating(state);
        case Actions.usersError:
            return handleUsersError(state);
        default:
            return state;
    }
};

const handleUserLogin = (state: UsersState, action: LoggedInAction): UsersState => ({
    ...state,
    users: [action.user],
});

const handleUsersUpdated = (state: UsersState, action: UsersUpdatedAction): UsersState => ({
    ...state,
    users: action.users,
    updating: false,
});

const handleUserUpdated = (state: UsersState, action: UserAction): UsersState => ({
    ...state,
    users: state.users.map((u) => (u.username === action.user.username ? action.user : u)),
    updating: false,
});

const handleUserCreated = (state: UsersState, action: UserAction): UsersState => ({
    ...state,
    users: [...state.users, action.user],
    updating: false,
});

const handleUsersUpdating = (state: UsersState): UsersState => ({
    ...state,
    updating: true,
});

const handleUsersError = (state: UsersState): UsersState => ({
    ...state,
    updating: false,
});
