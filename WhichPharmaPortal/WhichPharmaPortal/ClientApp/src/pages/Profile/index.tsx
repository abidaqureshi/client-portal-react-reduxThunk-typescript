import * as React from 'react';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import Panel from '../../components/Panel';
import UserForm from '../../components/UserForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyUser, linkMyUserWithGoogle, updateMyUser } from '../../store/Users/actions';
import { getMyUser, isUpdatingUsers } from '../../store/Users/selectors';
import { CreateUser } from '../../models/CreateUser';
import UserAvatar from '../../components/UserAvatar';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { alertGenericError } from '../../store/Session/actions';
import appSettings from '../../appSettings';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const Profile: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const t = useTranslations();
    const dispatch = useDispatch();
    const user = useSelector(getMyUser);
    const isUpdating = useSelector(isUpdatingUsers);

    // eslint-disable-next-line
    React.useEffect(() => {
        dispatch(fetchMyUser());
        setHeaderName(t(TK.profile));
    }, []);

    // eslint-disable-next-line
    const handleUserChange = React.useCallback((user: CreateUser) => {
        dispatch(updateMyUser(user));
    }, []);

    const handleGoogleLoginFailure = React.useCallback(() => {
        dispatch(alertGenericError());
    }, [dispatch]);

    const handleGoogleLoginSuccess = React.useCallback(
        (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
            dispatch(linkMyUserWithGoogle(response as GoogleLoginResponse));
        },
        [dispatch],
    );

    return (
        <Page
            title={t(TK.profile)}
            actionPanel={
                !user?.isLinkedToThirdPartyLogin && (
                    <GoogleLogin
                        theme="dark"
                        buttonText={t(TK.linkWithGoogle)}
                        clientId={appSettings.googleClientId}
                        onSuccess={handleGoogleLoginSuccess}
                        onFailure={handleGoogleLoginFailure}
                        cookiePolicy={'single_host_origin'}
                        scope={appSettings.googleLoginScope}
                        prompt="consent"
                    />
                )
            }
        >
            <Panel title={user?.username ? <UserAvatar showName username={user.username} size="large" /> : ''}>
                <UserForm
                    value={{ ...user, password: '' } as CreateUser}
                    isLoading={isUpdating}
                    onChange={handleUserChange}
                    type="edit"
                />
            </Panel>
        </Page>
    );
};

export default Profile;
