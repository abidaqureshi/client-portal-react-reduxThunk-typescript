import * as React from 'react';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { useSelector } from 'react-redux';
import { isLoadingPlatformData } from '../../store/Platform/selectors';
import Loading from '../../components/Loading';
import ProcessingSettingsPanel from './ProcessingSettingsPanel';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const Platform: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const t = useTranslations();
    const loading = useSelector(isLoadingPlatformData);

    React.useEffect(() => {
        setHeaderName(t(TK.platform));
    }, []);

    return (
        <Page title={t(TK.platform)} style={{ marginTop: '10rem' }}>
            <Loading isLoading={loading} />
            <ProcessingSettingsPanel />
        </Page>
    );
};

export default Platform;
