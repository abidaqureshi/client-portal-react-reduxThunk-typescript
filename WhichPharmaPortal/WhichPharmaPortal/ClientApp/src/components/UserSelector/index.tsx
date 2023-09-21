import * as React from 'react';
import { MenuItem } from '@material-ui/core';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { UserSelect } from './styled';
import { useCollaborators } from '../../store/Users/hooks';
import UserAvatar from '../UserAvatar';

const UserSelector : React.FC<{
    seletedUsername?: string,
    disabled?: boolean,
    onChange: (username: string | undefined) => void,
}> = ({
    seletedUsername,
    disabled,
    onChange,
}) => {
    const t = useTranslations();
    const users = useCollaborators();
    const loaded = React.useMemo(() => users.findIndex(user => user.username === seletedUsername) >= 0, [seletedUsername, users]);
    return (
        <UserSelect
            variant="outlined"
            value={seletedUsername}
            disabled={disabled}
            onChange={e => onChange((e.target.value as string) || undefined)}
        >
            <MenuItem  aria-label="None" value="" ><em>{t(TK.none)}</em></MenuItem>
            {users.map(user => (
                <MenuItem  key={user.username} value={user.username}>
                    <UserAvatar showName username={user.username}/>
                </MenuItem >
            ))}
            {!loaded && seletedUsername && 
                <MenuItem  value={seletedUsername}>
                    <UserAvatar showName username={seletedUsername}/>
                </MenuItem >
            }
        </UserSelect>
    );
}

export default UserSelector;