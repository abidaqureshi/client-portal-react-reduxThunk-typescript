/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useStyles } from '../NavMenu/styled';
import { Body, Wrapper, Container, AppInfoContainer } from './styled';
import { useLocation } from 'react-router-dom';
import { standaloneRoutes } from '../../store/Router/routes';
import { isLoggedOutOrSessionExpired } from '../../store/Session/selectors';
import { AppLayout } from './Hoc/AppLayout';
import { AppContextType } from '../../context/@types/types';
import { AppContext } from '../App';

const Layout = (props: { children?: React.ReactNode }) => {
    const classes = useStyles();

    const location = useLocation();
    const [prevLocation, setPrevLocation] = React.useState(location);
    const scrollRef = React.useMemo(() => React.createRef<HTMLDivElement>(), []);
    const { handleDrawerToggle, isOpen } = React.useContext(AppContext) as AppContextType;

    const isLoggedOut = useSelector(isLoggedOutOrSessionExpired);
    const hideSidebar = standaloneRoutes.includes(location.pathname);

    React.useEffect(() => {
        if (location.pathname !== prevLocation.pathname) {
            scrollRef.current?.scrollTo(0, 0);
        }
        setPrevLocation(location);
        // eslint-disable-next-line
    }, [location]);

    return (
        <React.Fragment>
            <Body>
                <Wrapper isLogged={!isLoggedOut}>
                    <AppLayout
                        isOpen={isOpen}
                        handleDrawerToggle={handleDrawerToggle}
                        isLoggedOut={isLoggedOut}
                        hideSidebar={hideSidebar}
                        scrollRef={scrollRef}
                    >
                        {props.children}
                    </AppLayout>
                </Wrapper>
            </Body>
        </React.Fragment>
    );
};

export default Layout;
