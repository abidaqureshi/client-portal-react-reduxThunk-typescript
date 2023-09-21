import * as React from 'react';
import { Avatar, Typography, Tooltip } from '@material-ui/core';
import { UserItemContainer } from './styled';
import { User } from '../../models/User';
import { useCollaborators } from '../../store/Users/hooks';

const niceColors = [
    '#9e9e9e', // grey
    '#c78b38', // orange
    '#32a852', // green
    '#c23427', // red
    '#c4c720', // yellow
    '#95bf3b', // green yellow
    '#32a88c', // green blue
    '#3cbbc9', // ligth blue
    '#388ad1', // blue
    '#3b3a9c', // dark blue
    '#7445a1', // purple
    '#a545ba', // light purple
    '#c94bbb', // pink
    '#c94b82', // dark pink
];

export const getUserAvatarColor = (user: User, users: User[]): string => {
    return niceColors[(users.findIndex(u => user.username === u.username) + 1)%niceColors.length]
}

export const UserAvatarComponent: React.FC<{
    avatarColor?: string, 
    name: string,
    hideName?: boolean,
    imgUrl?: string,
    size: 'small'|'large',
}> = ({
    avatarColor, 
    name,
    hideName,
    size,
    imgUrl,
}) => (
    <UserItemContainer size={size} addRightMargin={!hideName}>
        { hideName
            ? 
                <Tooltip title={name}>
                    <Avatar style={{background: avatarColor}} src={imgUrl}>{name[0]}</Avatar>
                </Tooltip>
            : 
                <>
                    <Avatar style={{background: avatarColor}} src={imgUrl}>{name[0]}</Avatar>
                    <Typography variant={size === 'large' ? 'h4' : 'body1'}>{name}</Typography>
                </>
        }
    </UserItemContainer>
)

const UserAvatar : React.FC<{username: string, showName?: boolean, size?: 'small'|'large'}> = ({username, showName, size}) => {
    const users = useCollaborators();
    const user = React.useMemo(() => users.find(user => user.username === username), [users, username]);
    return (
        <UserAvatarComponent 
            avatarColor={user ? getUserAvatarColor(user, users) : niceColors[0]} 
            imgUrl={user?.imageUrl}
            name={user?.firstName ? `${user.firstName} ${user.lastName}` : username}
            size={size ? size : showName ? 'small' : 'large'}
            hideName={!showName}
        />
    );
}

export default UserAvatar;