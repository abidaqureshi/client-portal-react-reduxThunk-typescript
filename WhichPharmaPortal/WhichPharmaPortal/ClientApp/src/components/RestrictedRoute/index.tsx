import * as React from "react";
import { RouteProps, Route } from "react-router";
import { UserRole } from "../../models/UserRole";
import RestritedComponent from "../RestrictedComponent";

export interface RestrictedRouteProps extends RouteProps {
    requiresLogin?: boolean,
    requiresLogout?: boolean,
    requiresRoles?: UserRole[],
    notAllowedElement?: React.ReactElement,
}

const RestrictedRoute: React.FC<RestrictedRouteProps> = ({
    component,
    requiresLogin,
    requiresLogout,
    requiresRoles,
    notAllowedElement,
    ...rest
}) => (
    <Route {...rest} render={(props) => 
        <RestritedComponent 
            Component={component as React.ReactType}
            requiresLogin={requiresLogin}
            requiresLogout={requiresLogout}
            requiresRoles={requiresRoles}
            notAllowedElement={notAllowedElement}
            {...props}
        />
    }/>
);

export default RestrictedRoute;