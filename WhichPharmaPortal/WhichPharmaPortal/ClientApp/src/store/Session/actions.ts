import { AppThunkAction } from '..';
import { postLoginAsync, RequestError, putUserSettingsAsync, postRequestAccessLinkAsync } from '../../fetch/requests';
import { AuthenticatedUser } from '../../models/AuthenticatedUser';
import { LoggedInAction, AlertAction, AlertDismissAction, UpdateCustomSettingAction, LoggedInWithGoogleAction } from './types';
import { Action } from 'redux';
import { AlertType } from '../../components/AlertBar/AlertBar';
import { getTranslation } from '../Translations/selectors';
import { TK } from '../Translations/translationKeys';
import { HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED, HTTP_INTERNAL_SERVER_ERROR } from '../../fetch/statusCodes';
import { getLocation, getLocationRedirectParam } from '../Router/selectors';
import { getAccessToken, isLoggedOutOrSessionExpired, isLoggingIn } from './selectors';
import { routes } from '../Router/routes';
import { goTo, goToLogin } from '../Router/actions';
import { fetchSet } from '../Sets/actions';
import { SetName } from '../Sets/state';
import { ProductsTableSettingKey, ShortagesTableSettingKey, SuppliersTableSettingKey, EmailTemplateSettingKey, RFQTablesAutoFillFieldsSettingKey, RFQDetailsTableSettingKey, ProductsV2TableSettingKey } from './customSettingsKeys';
import { fetchCollaborators } from '../Users/actions';
import { GoogleLoginResponseOffline } from 'react-google-login';

export const Actions = {
    loggingIn: '@@whichpharma.session.loggingIn',
    loginCancelled: '@@whichpharma.session.loginCancelled',
    loggedIn: '@@whichpharma.session.loggedIn',
    loggedInWithGoogle: '@@whichpharma.session.loggedInWithGoogle',
    loggedOut: '@@whichpharma.session.loggedOut',
    loginFailed: '@@whichpharma.session.loginFailed',
    alert: '@@whichpharma.session.alert',
    alertDismiss: '@@whichpharma.session.alertDismiss',
    updateCustomSetting: '@@whichpharma.session.updateCustomSetting',
};

const loggingIn = (): Action => ({
    type: Actions.loggingIn,
});

const loginCancelled = (): Action => ({
    type: Actions.loginCancelled,
});

const loggedIn = (user: AuthenticatedUser): LoggedInAction => ({
    type: Actions.loggedIn,
    user,
});

const loggedInWithGoogle = (user: AuthenticatedUser, googleResponse: GoogleLoginResponseOffline): LoggedInWithGoogleAction => ({
    type: Actions.loggedInWithGoogle,
    user,
    googleResponse,
});

const loggedOut = (): Action => ({
    type: Actions.loggedOut,
});

const loginFailed = (): Action => ({
    type: Actions.loginFailed,
});

const updateCustomSetting = (key: string, settings: any): UpdateCustomSettingAction => ({
    type: Actions.updateCustomSetting,
    key,
    settings,
});

export const doUpdateUserSettings = (key: string, settings: any): AppThunkAction<void> => {
    return dispatch => {
        dispatch(updateCustomSetting(key, settings));
        dispatch(requestServer(token => putUserSettingsAsync({[key]: settings}, token)));
    };
}; 

export const updateProductsTableSettings = (settings: any): AppThunkAction<void> => doUpdateUserSettings(ProductsTableSettingKey, settings);
export const updateProductsV2TableSettings = (settings: any): AppThunkAction<void> => doUpdateUserSettings(ProductsV2TableSettingKey, settings);
export const updateShortagesTableSettings = (settings: any): AppThunkAction<void> => doUpdateUserSettings(ShortagesTableSettingKey, settings);
export const updateSuppliersTableSettings = (settings: any): AppThunkAction<void> => doUpdateUserSettings(SuppliersTableSettingKey, settings);
export const updateEmailTemplateSettings = (settings: any): AppThunkAction<void> => doUpdateUserSettings(EmailTemplateSettingKey, settings);
export const updateRFQTablesAutoFillFieldsSettings = (settings: string[]): AppThunkAction<void> => doUpdateUserSettings(RFQTablesAutoFillFieldsSettingKey, settings);
export const updateRFQDetailsTableSettings = (settings: any): AppThunkAction<void> => doUpdateUserSettings(RFQDetailsTableSettingKey, settings);

export const doLogin = (username: string, password: string): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            dispatch(loggingIn());
            const user = await postLoginAsync({ username, password });
            dispatch(loggedIn(user));

            const redirect = getLocationRedirectParam(getState());
            dispatch(goTo(redirect || routes.home));

            Object.keys(SetName)
                .map((k) => (SetName as any)[k] as SetName)
                .forEach((v) => dispatch(fetchSet(v as SetName)));

            dispatch(fetchCollaborators());
        } catch (e) {
            dispatch(loginFailed());

            if (e instanceof RequestError && (e as RequestError).statusCode === HTTP_BAD_REQUEST) {
                const unableToLoginText = getTranslation(getState(), TK.invalidCredentials);
                dispatch(alertError(unableToLoginText));
            } else {
                dispatch(alertGenericError());
            }
        }
    };
};

export const doLoginWithGoogle = (googleResponse: GoogleLoginResponseOffline): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        try {
            if(isLoggingIn(getState())) return;
            
            dispatch(loggingIn());
            const user = await postLoginAsync({
                thirdPartyProvider: 'google',
                thirdPartyCode: googleResponse.code,
            });
            dispatch(loggedInWithGoogle(user, googleResponse));

            const redirect = getLocationRedirectParam(getState());
            dispatch(goTo(redirect || routes.home));

            Object.keys(SetName)
                .map((k) => (SetName as any)[k] as SetName)
                .forEach((v) => dispatch(fetchSet(v as SetName)));

            dispatch(fetchCollaborators());
        } catch (e) {
            dispatch(loginFailed());

            if (e instanceof RequestError && (e as RequestError).statusCode === HTTP_BAD_REQUEST) {
                const unableToLoginText = getTranslation(getState(), TK.invalidCredentials);
                dispatch(alertError(unableToLoginText));
            } else {
                dispatch(alertGenericError());
            }
        }
    };
};

export const doLogout = (): AppThunkAction<void> => {
    return (dispatch, getState) => {
        const state = getState();
        
        if (!isLoggedOutOrSessionExpired(state)) {
            dispatch(loggedOut());
        }
        const location = getLocation(state);

        if (location.pathname !== '/login' && location.pathname !== '/logout') {
            dispatch(goToLogin(location.pathname));
        }

        if (location.pathname === '/logout') {
            dispatch(goToLogin());
        }
    };
};

export const doRequestAccessLink = (email: string): AppThunkAction<Promise<boolean>> => {
    return async (dispatch, getState) => {
        dispatch(loggingIn());

        try {
            await postRequestAccessLinkAsync({email});
            dispatch(alertSuccess(getTranslation(getState(), TK.accessLinkWasSentToYourInbox)));
        }
        catch {
            // TODO - this should be registered somewhere
            dispatch(alertSuccess(getTranslation(getState(), TK.yourRequestHasBeenRegistered)));
        }
        dispatch(loginCancelled());
        return true;
    }
}

const httpStatusCodeWhichRedirectToLogin = [HTTP_UNAUTHORIZED, HTTP_INTERNAL_SERVER_ERROR];

export const requestServer = <T>(request: (token: string | undefined) => Promise<T>): AppThunkAction<Promise<T>> => {
    return async (dispatch, getState) => {
        try {
            return await request(getAccessToken(getState()));
        } catch (e) {
            const isRequestError = e instanceof RequestError;
            if (
                !isRequestError ||
                (isRequestError && httpStatusCodeWhichRedirectToLogin.includes((e as RequestError).statusCode))
            ) {
                dispatch(doLogout());
            }
            throw e;
        }
    };
};

const alertsDuration = (nrChars: number) => 1000 + nrChars * 40;

let alertNextId = 0;

export const alertDispatch = (type: AlertType, content: React.ReactNode, durationMs?: number): AlertAction => ({
    type: Actions.alert,
    alert: {
        id: (alertNextId++).toString(),
        type,
        content,
        durationMs,
    },
});

export const alertDismiss = (id: string): AlertDismissAction => ({
    type: Actions.alertDismiss,
    id,
});

export const alertGenericError = (): AppThunkAction<void> => {
    return (dispatch, getState) => {
        const msg = getTranslation(getState(), TK.somethingWentWrong);
        dispatch(alertDispatch(AlertType.Error, msg, alertsDuration(msg.length)));
    };
};

export const alertError = (message: string): AppThunkAction<void> => {
    return (dispatch) => {
        dispatch(alertDispatch(AlertType.Error, message, alertsDuration(message.length)));
    };
};

export const alertSuccess = (message: string): AppThunkAction<void> => {
    return (dispatch) => {
        dispatch(alertDispatch(AlertType.Success, message, alertsDuration(message.length)));
    };
};