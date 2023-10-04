import * as React from 'react';
import { useTranslations } from '../../store/Translations/hooks';
import Page from '../../components/Page';
import { TK } from '../../store/Translations/translationKeys';
import { Typography } from '@material-ui/core';

const Home: React.FC = () => {
    const t = useTranslations();

    return (
        <Page title={t(TK.welcome)}>
            <Typography>Trust me, this is a pretty cool application, it just doesn't have an home page yet!</Typography>
        </Page>
    );
};

export default Home;
