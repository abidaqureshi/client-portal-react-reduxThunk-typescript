import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { SessionState } from './state';
import { LoggedInAction, AlertAction, AlertDismissAction, UpdateCustomSettingAction, LoggedInWithGoogleAction } from './types';

const unloadedState: SessionState = {
    user: undefined,
    loggingIn: false,
    alerts: [],
    customSettings: {},
    googleLogin: undefined,
};

export const persistor = (state: SessionState): SessionState => ({
    ...state,
    loggingIn: false,
    alerts: [],
});

export const reconciler = (stored: SessionState): SessionState => ({
    ...stored,
    loggingIn: false,
    alerts: [],
});

const handleLogginIn = (state: SessionState): SessionState => ({
    ...state,
    user: undefined,
    loggingIn: true,
});

const handleLoginCancelled = (state: SessionState): SessionState => ({
    ...state,
    user: undefined,
    loggingIn: false,
});

const handleLoggedIn = (state: SessionState, action: LoggedInAction): SessionState => ({
    ...state,
    user: action.user,
    loggingIn: false,
    customSettings: action.user.settings
        ? Object.fromEntries(Object.entries(action.user.settings).map(([key, value]) => [key, JSON.parse(value)]))
        : {},
});

const handleLoggedInWithGoogle = (state: SessionState, action: LoggedInWithGoogleAction): SessionState => ({
    ...handleLoggedIn(state, action),
    googleLogin: action.googleResponse,
});

const handleLoggedOut = (state: SessionState): SessionState => ({
    ...unloadedState,
    manuallyLoggedOut: true,
});

const handleLoginFailed = (state: SessionState): SessionState => ({
    ...state,
    user: undefined,
    loggingIn: false,
});

const handleAlert = (state: SessionState, action: AlertAction): SessionState => ({
    ...state,
    alerts: [...state.alerts, action.alert],
});

const handleAlertDismiss = (state: SessionState, action: AlertDismissAction): SessionState => ({
    ...state,
    alerts: state.alerts.filter((a) => a.id !== action.id),
});

const handleUpdateCustomSetting = (state: SessionState, action: UpdateCustomSettingAction): SessionState => ({
    ...state,
    customSettings: {...state.customSettings, [action.key]: action.settings},
});

export const reducer: Reducer<SessionState> = (state: SessionState = unloadedState, action: Action): SessionState => {
    switch (action.type) {
        case Actions.loggingIn:
            return handleLogginIn(state);
        case Actions.loginCancelled:
            return handleLoginCancelled(state)
        case Actions.loggedIn:
            return handleLoggedIn(state, action as LoggedInAction);
        case Actions.loggedInWithGoogle:
            return handleLoggedInWithGoogle(state, action as LoggedInWithGoogleAction);
        case Actions.loggedOut:
            return handleLoggedOut(state);
        case Actions.loginFailed:
            return handleLoginFailed(state);
        case Actions.alert:
            return handleAlert(state, action as AlertAction);
        case Actions.alertDismiss:
            return handleAlertDismiss(state, action as AlertDismissAction);
        case Actions.updateCustomSetting:
            return handleUpdateCustomSetting(state, action as UpdateCustomSettingAction);
        default:
            return state;
    }
};
