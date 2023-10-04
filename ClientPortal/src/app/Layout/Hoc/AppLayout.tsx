import React, { PropsWithChildren, RefObject } from 'react';
import { AdminLayoutComponent } from '../Admin';
import { LoginLayoutComponent } from '../Login';

export interface IAppLayoutProps {
    isOpen: boolean;
    handleDrawerToggle: () => void;
    isLoggedOut: boolean;
    hideSidebar: boolean;
    scrollRef: RefObject<HTMLDivElement>;
    children: React.ReactNode;
}
export const AppLayout: React.FC<IAppLayoutProps> = (props) => {
    return props.isLoggedOut ? (
        <LoginLayoutComponent {...props}>{props.children}</LoginLayoutComponent>
    ) : (
        <AdminLayoutComponent {...props}>{props.children}</AdminLayoutComponent>
    );
};
