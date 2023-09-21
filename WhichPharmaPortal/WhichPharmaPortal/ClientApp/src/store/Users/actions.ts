import { AppThunkAction } from '..';
import { getUsersAsync, putUserAsync, RequestError, postUserAsync, getMyUserAsync, putMyUserAsync, getUsersCollaboratorsAsync, putMyUserGoogleLinkAsync } from '../../fetch/requests';
import { requestServer, alertGenericError, alertError, alertSuccess } from '../Session/actions';
import { UsersUpdatedAction, UserAction } from './types';
import { User } from '../../models/User';
import { UpdateUser } from '../../models/UpdateUser';
import { Action } from 'redux';
import { getTranslation } from '../Translations/selectors';
import { TK } from '../Translations/translationKeys';
import { HTTP_BAD_REQUEST } from '../../fetch/statusCodes';
import { UserChangeResult } from '../../models/UserChangeResult';
import { CreateUser } from '../../models/CreateUser';
import { getUser, getMyUser, isUpdatingUsers, getUsers } from './selectors';
import { assignDefined } from '../../utils/utils';
import { GoogleLoginResponse } from 'react-google-login';

export const Actions = {
    usersUpdating: '@@whichpharma.users.usersUpdating',
    usersUpdated: '@@whichpharma.users.usersUpdated',
    userUpdated: '@@whichpharma.users.userUpdated',
    userCreated: '@@whichpharma.users.userCreated',
    usersError: '@@whichpharma.users.usersError',
};

const usersUpdating = (): Action => ({
    type: Actions.usersUpdating,
});

const usersError = (): Action => ({
    type: Actions.usersError,
});

export const usersUpdated = (users: User[]): UsersUpdatedAction => ({
    type: Actions.usersUpdated,
    users,
});

const userUpdated = (user: User): UserAction => ({
    type: Actions.userUpdated,
    user,
});

const userCreated = (user: User): UserAction => ({
    type: Actions.userCreated,
    user,
});

export const fetchUsers = (): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            if(isUpdatingUsers(getState())) {
                return;
            }
            dispatch(usersUpdating());
            const result = await dispatch(requestServer(getUsersAsync));
            dispatch(usersUpdated(result));
        } catch (e) {
            dispatch(usersError());
            dispatch(alertGenericError());
        }
    };
};

export const fetchCollaborators = (): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            if(isUpdatingUsers(getState())) {
                return;
            }
            dispatch(usersUpdating());
            const result = await dispatch(requestServer(getUsersCollaboratorsAsync));
            const users = getUsers(getState());
            const newUsers = result.filter(user => !users.find(u => u.username === user.username));
            dispatch(usersUpdated(users.concat(newUsers)));
        } catch (e) {
            dispatch(usersError());
            dispatch(alertGenericError());
        }
    };
};

export const fetchMyUser = (): AppThunkAction<Promise<void>> => {
    return async (dispatch) => {
        try {
            dispatch(usersUpdating());
            const result = await dispatch(requestServer(getMyUserAsync));
            dispatch(usersUpdated([result]));
        } catch (e) {
            dispatch(usersError());
            dispatch(alertGenericError());
        }
    };
};

const getErrorMessage = (error: any): TK => {
    console.log('ERRROR', error);
    const result: UserChangeResult | undefined =
        (error instanceof RequestError &&
            (error as RequestError).statusCode === HTTP_BAD_REQUEST &&
            ((error as RequestError).body?.result as UserChangeResult)) ||
        undefined;

    switch (result) {
        case UserChangeResult.EmailInUse:
            return TK.emailInUse;
        case UserChangeResult.WeakPassword:
            return TK.weakPassword;
        case UserChangeResult.UsernameInUse:
            return TK.usernameInUse;
        case UserChangeResult.InvalidUsername:
            return TK.invalidUsername;
        case UserChangeResult.InvalidEmail:
            return TK.invalidEmail;
        default:
            return TK.somethingWentWrong;
    }
};

export const createUser = (create: CreateUser): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            dispatch(usersUpdating());
            await dispatch(requestServer((token) => postUserAsync(create, token)));
            dispatch(userCreated({...create, }));

            dispatch(alertSuccess(getTranslation(getState(), TK.userCreatedSuccessfully)));
        } catch (e) {
            dispatch(alertError(getTranslation(getState(), getErrorMessage(e))));
            dispatch(usersError());
        }
    };
};

export const updateUser = (username: string, update: UpdateUser): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            var user = getUser(getState(), username);

            if(!user) return;

            dispatch(usersUpdating());
            await dispatch(requestServer((token) => putUserAsync(username, update, token)));
            dispatch(userUpdated(assignDefined(user, update)));

            dispatch(alertSuccess(getTranslation(getState(), TK.userUpdatedSuccessfully)));
        } catch (e) {
            dispatch(alertError(getTranslation(getState(), getErrorMessage(e))));
            dispatch(usersError());
        }
    };
};

export const linkMyUserWithGoogle = (googleResponse: GoogleLoginResponse): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            var user = getMyUser(getState());

            if(!user) return;

            dispatch(usersUpdating());
            await dispatch(requestServer((token) => putMyUserGoogleLinkAsync((googleResponse.tokenObj as any).idpId, googleResponse.googleId, token)));
            dispatch(userUpdated(assignDefined(user, { isLinkedToThirdPartyLogin: true })));

            dispatch(alertSuccess(getTranslation(getState(), TK.userUpdatedSuccessfully)));
        } catch (e) {
            dispatch(alertError(getTranslation(getState(), getErrorMessage(e))));
            dispatch(usersError());
        }
    };
};

export const updateMyUser = (update: UpdateUser): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            var user = getMyUser(getState());

            if(!user) return;

            dispatch(usersUpdating());
            await dispatch(requestServer((token) => putMyUserAsync(update, token)));
            dispatch(userUpdated(assignDefined(user, update)));

            dispatch(alertSuccess(getTranslation(getState(), TK.userUpdatedSuccessfully)));
        } catch (e) {
            dispatch(alertError(getTranslation(getState(), getErrorMessage(e))));
            dispatch(usersError());
        }
    };
};