import React from 'react';
import { useTranslations } from '../../../store/Translations/hooks';
import { IRoutes } from '../../../store/Router/routes';
import { ListItemWithIcon } from '../NavMenu';
import StoreIcon from '@material-ui/icons/Store';
import { TK } from '../../../store/Translations/translationKeys';
import appSettings from '../../../appSettings';

interface ICustomNav {
    locationUrl: string;
    routes: IRoutes;
    goTo: (url: string) => () => void;
}

export const CustomNav: React.FC<ICustomNav> = ({ locationUrl, routes, goTo }) => {
    const t = useTranslations();
    return locationUrl &&
        (locationUrl.includes(appSettings.developmentUrl) || locationUrl.includes(appSettings.localDevelopmentUrl)) ? (
        <>
            <ListItemWithIcon
                onClick={goTo(routes.productsSelection())}
                icon={<StoreIcon />}
                title={t(TK.productsProdV)}
            />
            <ListItemWithIcon
                onClick={goTo(routes.productsProdV1Selection())}
                icon={<StoreIcon />}
                title={t(TK.productsProdV1)}
            />
            <ListItemWithIcon
                onClick={goTo(routes.productsV3Selection())}
                icon={<StoreIcon />}
                title={`${t(TK.productsV3)}`}
            />
            <ListItemWithIcon
                onClick={goTo(routes.productsV2Selection())}
                icon={<StoreIcon />}
                title={`${t(TK.products)} (${t(TK.v2)})`}
            />
            <ListItemWithIcon
                onClick={goTo(routes.productsV1Selection())}
                icon={<StoreIcon />}
                title={`${t(TK.products)} (${t(TK.v1)})`}
            />
        </>
    ) : (
        // <ListItemWithIcon
        //     onClick={goTo(routes.productsV3Selection())}
        //     icon={<StoreIcon />}
        //     title={`${t(TK.productsV3)}`}
        // />
        <ListItemWithIcon onClick={goTo(routes.productsSelection())} icon={<StoreIcon />} title={t(TK.products)} />
    );
};
