import * as React from "react";
import { getMyRoles } from "../../store/Users/selectors";
import { useSelector, useDispatch } from "react-redux";
import { useTranslations } from "../../store/Translations/hooks";
import { TK } from "../../store/Translations/translationKeys";
import { UserRole } from "../../models/UserRole";
import { goToHome, goToLogin } from "../../store/Router/actions";
import { isLoggedOutOrSessionExpired } from "../../store/Session/selectors";

export interface RestrictedComponentProps {
    Component: React.ReactType,
    requiresLogin?: boolean,
    requiresLogout?: boolean,
    requiresRoles?: UserRole[],
    notAllowedElement?: React.ReactElement,
}

const RestritedComponent: React.FC<RestrictedComponentProps> = ({
    requiresLogin,
    requiresLogout,
    requiresRoles,
    notAllowedElement,
    Component,
    ...props
}) => {
    const t = useTranslations();
    const dispatch = useDispatch(); 
    const roles = useSelector(getMyRoles);
    const loggedOutOrSessionExpired = useSelector(isLoggedOutOrSessionExpired);

    React.useEffect(() => {
        if(requiresLogin && loggedOutOrSessionExpired) {
            dispatch(goToLogin());
        }
        else if(requiresLogout && !loggedOutOrSessionExpired) {
            dispatch(goToHome());
        }
    }, [dispatch, loggedOutOrSessionExpired, requiresLogin, requiresLogout]);

    const allowed = React.useMemo(() => !requiresRoles || 
        (roles.findIndex(role => role === UserRole.Administrator || requiresRoles?.includes(role)) >= 0), [roles, requiresRoles]);

    return allowed 
        ? <Component {...props}/>
        : notAllowedElement || <h2>{t(TK.accessRestricted)}</h2>;
}

export default RestritedComponent;