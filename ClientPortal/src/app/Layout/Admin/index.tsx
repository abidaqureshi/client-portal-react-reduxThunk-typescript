import React, { RefObject } from 'react';
import clsx from 'clsx';
import { useStyles } from '../../NavMenu/styled';
import NavMenu from '../../NavMenu/NavMenu';
import { Container } from '../styled';
import { IAppLayoutProps } from '../Hoc/AppLayout';

export const AdminLayoutComponent: React.FC<IAppLayoutProps> = (props) => {
    const { isOpen, handleDrawerToggle, hideSidebar, scrollRef, isLoggedOut } = props;
    const classes = useStyles();

    return (
        <>
            <NavMenu isOpen={isOpen} handleDrawerToggle={handleDrawerToggle} />
            <div
                className={clsx(classes.content, {
                    [classes.contentShift]: isOpen,
                })}
            >
                <Container ref={scrollRef} isLogged={!isLoggedOut} $fullWidth={hideSidebar}>
                    {props.children}
                </Container>
            </div>
        </>
    );
};
