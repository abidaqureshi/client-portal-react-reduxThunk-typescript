import React from 'react';
import { Typography } from '@material-ui/core';
import { Sidebar, Container, Logo, AppInfoContainer } from '../styled';
import { IAppLayoutProps } from '../Hoc/AppLayout';

export const LoginLayoutComponent: React.FC<IAppLayoutProps> = (props) => {
    const { hideSidebar, isLoggedOut, scrollRef } = props;

    const SidebarInfo = () => (
        <AppInfoContainer>
            <Typography variant="subtitle1">Search for Pharms</Typography>
            <Typography variant="subtitle1">Get quotes</Typography>
            <Typography variant="subtitle1">Be aware of shortages</Typography>
            <Typography variant="subtitle1">Communicate with suppliers</Typography>
            <Typography variant="subtitle1">Check requests</Typography>
            <Typography variant="subtitle1">…and more!</Typography>
        </AppInfoContainer>
    );

    return (
        <>
            <Sidebar hidden={hideSidebar}>
                <Logo isLogged={!isLoggedOut} />
                <hr />
                {!isLoggedOut ? '' : <SidebarInfo />}
            </Sidebar>{' '}
            <Container ref={scrollRef} isLogged={!isLoggedOut} $fullWidth={hideSidebar}>
                {props.children}
            </Container>
        </>
    );
};
