import * as React from 'react';
import { useTranslations } from '../../store/Translations/hooks';
import { useDispatch } from 'react-redux';
import { TK } from '../../store/Translations/translationKeys';
import { doLogout } from '../../store/Session/actions';
import Page from '../../components/Page';

const Logout: React.FC = () => {
    const t = useTranslations();
    const dispatch = useDispatch();

    // eslint-disable-next-line
    React.useEffect(() => { dispatch(doLogout()); }, []);

    return <Page title={t(TK.loggedOut)} />;
};

export default Logout;
