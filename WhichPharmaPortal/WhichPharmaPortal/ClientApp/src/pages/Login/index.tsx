import * as React from 'react';
import { useTranslations } from '../../store/Translations/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { isLoggingIn, isManuallyLoggedOut } from '../../store/Session/selectors';
import { TK } from '../../store/Translations/translationKeys';
import { alertGenericError, doLogin, doLoginWithGoogle, doRequestAccessLink } from '../../store/Session/actions';
import { ifEnter } from '../../utils/utils';
import { GoogleContainer, InnerContent, LanguageInput, LoginContainer, OrTitle, StrechDiv, WellcomeTitle } from './styled';
import { CustomButton } from '../../components/Styled';
import { Spinner } from 'reactstrap';
import Input from '../../components/inputs/Input';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import appSettings from '../../appSettings';
import Button from '@material-ui/core/Button';
import FormDialog from '../../components/FormDialog';
import { MapOf } from '../../utils/Types';
import { getLocale } from '../../store/Translations/selectors';
import { fetchTranslations } from '../../store/Translations/actions';

const Login: React.FC = () => {
    const t = useTranslations();
    const dispatch = useDispatch();

    const loggingIn = useSelector(isLoggingIn);
    const manuallyLoggedOut = useSelector(isManuallyLoggedOut);
    const locale = useSelector(getLocale);

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [requestAccessLink, setRequestAccessLink] = React.useState(false);

    const canSubmit = !loggingIn && username.length >= 3 && password.length >= 3;

    const submitPress = React.useCallback(():void => {
        dispatch(doLogin(username, password));
    }, [dispatch, username, password]);

    const handleGoogleLoginFailure = React.useCallback(() => {
        dispatch(alertGenericError());
    }, [dispatch]);

    const handleGoogleLoginSuccess = React.useCallback((response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        if(response) dispatch(doLoginWithGoogle(response as GoogleLoginResponseOffline));
    }, [dispatch]);

    const handleRequestAccessLink = React.useCallback(async (values: MapOf<string>) => {
        setRequestAccessLink(false);
        await dispatch(doRequestAccessLink(values.email));
    }, [setRequestAccessLink, dispatch]);

    const handleLocaleChange = React.useCallback((locale: string) => {
        dispatch(fetchTranslations(locale));

    }, [dispatch]);

    return (
        <InnerContent>
            <LanguageInput
                // label={t(TK.language)}
                hideClearButton
                value={locale}
                options={['en-US', 'pt']}
                onChange={handleLocaleChange}
            />

            <LoginContainer>
                <WellcomeTitle className="title" variant="h3" color="textPrimary">{t(TK.welcome)}</WellcomeTitle>
                <Input
                    type="text"
                    label={t(TK.username)}
                    placeholder={t(TK.username)}
                    value={username}
                    onChange={setUsername}
                    onKeyUp={(keyCode): void => ifEnter(keyCode, submitPress)}
                />
                <Input
                    label={t(TK.password)}
                    type="password"
                    placeholder={t(TK.password)}
                    value={password}
                    onChange={setPassword}
                    onKeyUp={(e): void => ifEnter(e, submitPress)}
                />

                <StrechDiv>
                    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
                    <CustomButton variant="text" onClick={(): void => {}}>
                        {t(TK.haveYouForgottenYourPassword)}
                    </CustomButton>
                    <CustomButton variant="rounded" onClick={submitPress} disabled={!canSubmit}>
                        {loggingIn && <Spinner size="sm"/>}
                        {t(TK.enter)}
                    </CustomButton>
                </StrechDiv>
            </LoginContainer>
            
            <OrTitle>
                <span>{t(TK.or)}</span>
            </OrTitle>

            <GoogleContainer>
                <GoogleLogin
                    theme="dark"
                    clientId={appSettings.googleClientId}
                    onSuccess={handleGoogleLoginSuccess}
                    onFailure={handleGoogleLoginFailure}
                    scope={appSettings.googleLoginScope}
                    isSignedIn={!manuallyLoggedOut}
                    responseType="code"
                    accessType="offline"
                    disabled={loggingIn}
                />
                <GoogleLogin
                    clientId={appSettings.googleClientId}
                    onSuccess={handleGoogleLoginSuccess}
                    onFailure={handleGoogleLoginFailure}
                    scope={appSettings.googleLoginScope}
                    buttonText="Use other Google account"
                    render={props => <CustomButton {...props} variant="text" style={{marginTop: '4px'}}>Use other Google account</CustomButton>}
                    prompt="consent"
                    isSignedIn={!manuallyLoggedOut}
                    responseType="code"
                    accessType="offline"
                    disabled={loggingIn}
                />
            </GoogleContainer>
            
            <OrTitle>
                <span>{t(TK.or)}</span>
            </OrTitle>

            <Button disabled={loggingIn} variant="outlined" size="large" onClick={() => setRequestAccessLink(true)}>
                {loggingIn && <Spinner size="sm"/>}
                {t(TK.requestAnAccessLink)}
            </Button>

            <FormDialog 
                title={t(TK.requestAnAccessLink)}
                fields={[{key: "email", label: t(TK.email)}]}
                onClose={() => setRequestAccessLink(false)} 
                open={requestAccessLink}
                onSubmit={handleRequestAccessLink}
            />
            
        </InnerContent>
    );
};

export default Login;
