import { AuthenticatedUser } from '../../models/AuthenticatedUser';
import { AlertItem } from '../../components/AlertBar/AlertBar';
import { GoogleLoginResponseOffline } from 'react-google-login';

export interface SessionState {
    user?: AuthenticatedUser;
    loggingIn: boolean;
    alerts: AlertItem[];
    customSettings: { [key: string]: any };
    googleLogin?: GoogleLoginResponseOffline;
    manuallyLoggedOut?: boolean;
}
