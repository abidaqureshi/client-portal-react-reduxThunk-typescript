import { Action } from 'redux';
import { AuthenticatedUser } from '../../models/AuthenticatedUser';
import { AlertItem } from '../../components/AlertBar/AlertBar';
import { GoogleLoginResponseOffline } from 'react-google-login';

export interface LoggedInAction extends Action {
    user: AuthenticatedUser;
}

export interface LoggedInWithGoogleAction extends LoggedInAction {
    googleResponse: GoogleLoginResponseOffline;
}

export interface AlertAction extends Action {
    alert: AlertItem;
}

export interface AlertDismissAction extends Action {
    id: string;
}

export interface UpdateCustomSettingAction extends Action {
    key: string;
    settings: any;
}