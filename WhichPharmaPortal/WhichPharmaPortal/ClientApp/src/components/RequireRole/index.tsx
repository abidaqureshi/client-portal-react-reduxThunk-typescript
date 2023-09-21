import * as React from 'react';
import { useSelector } from 'react-redux';
import { getLoggedUser } from '../../store/Session/selectors';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { UserRole } from '../../models/UserRole';

interface RequireRole {
    roles: UserRole[];
    showRestrictedMessage?: boolean;
}
const RequireRole: React.FC<React.PropsWithChildren<RequireRole>> = ({ roles, showRestrictedMessage, children }) => {
    const user = useSelector(getLoggedUser);
    const t = useTranslations();

    if (!user || !user.roles.some((role) => role === UserRole.Administrator || roles?.includes(role))) {
        return showRestrictedMessage ? <h1>{t(TK.accessRestricted)}</h1> : <></>;
    }

    return <>{children}</>;
};

export default RequireRole;
