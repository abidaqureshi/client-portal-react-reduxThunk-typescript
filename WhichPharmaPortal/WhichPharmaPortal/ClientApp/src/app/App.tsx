import * as React from 'react';
import { Route } from 'react-router';
import Layout from './Layout';
import './custom.css';
import ProductsList from '../pages/ProductsList';
import ProductListProdV1 from '../pages/ProductsListProdV1';
import ProductsListV3 from '../pages/ProductsListV3';
import ProductsListV1 from '../pages/ProductsListV1';
import ProductsListV2 from '../pages/ProductsListV2';
import SuppliersList from '../pages/SuppliersList';
import SuppliersListProdV1 from '../pages/SuppliersListProdV1';
import SuppliersListV3 from '../pages/SuppliersListV3';
import Login from '../pages/Login';
import Users from '../pages/Users';
import Logout from '../pages/Logout';
import RFQsList from '../pages/RFQsList';
import RFQsListV2 from '../pages/RFQsListV2';
import Profile from '../pages/Profile';
import CommunicationSetup from '../pages/CommunicationSetup';
import CommunicationSetupProdV1 from '../pages/CommunicationSetupProdV1';
import CommunicationSetupV2 from '../pages/CommunicationSetupV2';
import RFQCreated from '../pages/RFQCreated';
import { routes } from '../store/Router/routes';
import { createMuiTheme, ThemeProvider as MaterialUiThemeProvider, StylesProvider } from '@material-ui/core';
import theme from '../theme';
import ShortagesList from '../pages/ShortagesList';
import { useDispatch, useSelector } from 'react-redux';
import { alertDismiss } from '../store/Session/actions';
import { getAlerts } from '../store/Session/selectors';
import AlertBar from '../components/AlertBar';
import Platform from '../pages/Platform';
import RestrictedRoute from '../components/RestrictedRoute';
import { UserRole } from '../models/UserRole';
import RFQDetails from '../pages/RFQDetails';
import RFQDetailsV2 from '../pages/RFQDetailsV2';
import SupplierReplyForm from '../pages/SupplierReplyForm';
import SupplierReplyFormV2 from '../pages/SupplierReplyFormNew';
import { fetchTranslations } from '../store/Translations/actions';
import { AppContextType } from '../context/@types/types';

const remToPx = (value: string): number => parseFloat((value.match(/(.\d)+/) as any)[0]) * theme.metrics.fontSize;

export const AppContext = React.createContext<AppContextType | null>({
    headerName: '',
    setHeaderName: (name: string) => {},
    isOpen: false,
    handleDrawerToggle: () => {},
});

const App: React.FC = () => {
    const [headerName, setHeaderName] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const dispatch = useDispatch();
    const alerts = useSelector(getAlerts);
    const dismissAlert = (id: string) => dispatch(alertDismiss(id));

    const handleDrawerToggle = React.useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const providerValue = React.useMemo(
        () => ({
            headerName,
            setHeaderName,
            isOpen,
            handleDrawerToggle,
        }),
        [headerName, isOpen],
    );

    React.useEffect(() => {
        dispatch(fetchTranslations());
    }, [dispatch]);

    const materialUiTheme = createMuiTheme({
        typography: {
            fontFamily: theme.typography.fontFamily,
            h5: {
                fontWeight: 800,
            },
        },
        palette: {
            primary: {
                main: theme.colors.RBGreen,
                light: theme.colors.lightRBGreen,
                dark: theme.colors.darkenRBGreen,
                contrastText: theme.colors.white,
            },
            secondary: {
                main: theme.colors.grey,
                light: theme.colors.lightGrey,
                dark: theme.colors.darkGreen,
                contrastText: theme.colors.darkGreen,
            },
            text: {
                primary: theme.colors.black,
                secondary: theme.colors.darkGreen,
            },
        },
        breakpoints: {
            values: { ...theme.metrics.breakpoints },
        },
        shape: {
            borderRadius: remToPx(theme.metrics.border.radius),
        },
    });

    return (
        <StylesProvider injectFirst>
            <MaterialUiThemeProvider theme={materialUiTheme}>
                <AppContext.Provider value={providerValue}>
                    <AlertBar alerts={alerts} alertDismissed={dismissAlert} />
                    <Layout>
                        <Route path={routes.supplierReplyForm} component={SupplierReplyFormV2} />
                        <RestrictedRoute requiresLogin exact path={routes.home} component={/*Home*/ ProductsList} />
                        <RestrictedRoute requiresLogout path={routes.login} component={Login} />
                        <Route path={routes.logout} component={Logout} />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.users}
                            component={Users}
                            requiresRoles={[UserRole.Administrator]}
                        />
                        <RestrictedRoute requiresLogin path={routes.profile} component={Profile} />
                        <RestrictedRoute
                            exact
                            requiresLogin
                            path={routes.rfqsList}
                            component={RFQsList}
                            requiresRoles={[UserRole.Collaborator]}
                        />
                        <RestrictedRoute
                            exact
                            requiresLogin
                            path={routes.rfqsListV2}
                            component={RFQsListV2}
                            requiresRoles={[UserRole.Collaborator]}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.rfq(':rfqNrEncoded', false)}
                            component={RFQDetails}
                            requiresRoles={[UserRole.Collaborator]}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.rfqV2(':rfqNrEncoded', false)}
                            component={RFQDetailsV2}
                            requiresRoles={[UserRole.Collaborator]}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.productsSelection(':offset?')}
                            component={ProductsList}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.productsProdV1Selection(':offset?')}
                            component={ProductListProdV1}
                        />

                        {/* <RestrictedRoute
                            requiresLogin
                            path={routes.productsSelection(':offset?')}
                            component={ProductsListV3}
                        /> */}

                        <RestrictedRoute
                            requiresLogin
                            path={routes.productsV1Selection(':offset?')}
                            component={ProductsListV1}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.productsV2Selection(':offset?')}
                            component={ProductsListV2}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.productsV3Selection(':offset?')}
                            component={ProductsListV3}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.shortagesSelection(':offset?')}
                            component={ShortagesList}
                            requiresRoles={[UserRole.PlatformContributor]}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.suppliersSelecion(':offset?')}
                            component={SuppliersList}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.suppliersSelecionProdV1(':offset?')}
                            component={SuppliersListProdV1}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.suppliersV3Selecion(':offset?')}
                            component={SuppliersListV3}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.communicationSetup}
                            component={CommunicationSetup}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.communicationSetupProdV1}
                            component={CommunicationSetupProdV1}
                        />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.communicationSetupV2}
                            component={CommunicationSetupV2}
                        />
                        <RestrictedRoute requiresLogin path={routes.rfqCreated} component={RFQCreated} />
                        <RestrictedRoute
                            requiresLogin
                            path={routes.platform}
                            component={Platform}
                            requiresRoles={[UserRole.PlatformContributor]}
                        />
                    </Layout>
                </AppContext.Provider>
            </MaterialUiThemeProvider>
        </StylesProvider>
    );
};

export default App;
