import * as React from 'react';
import './Users.scss';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { getUsers, isUpdatingUsers } from '../../store/Users/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, updateUser, createUser } from '../../store/Users/actions';
import UserForm from '../../components/UserForm';
import { CreateUser } from '../../models/CreateUser';
import { User } from '../../models/User';
import RequireRole from '../../components/RequireRole';
import { UserRole } from '../../models/UserRole';
import Page from '../../components/Page';
import List from '../../components/List';
import AddIcon from '@material-ui/icons/AddCircle';
import { Tooltip, IconButton } from '@material-ui/core';
import { Item } from '../../components/List';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const newUserUsernameId = 'addnewuser';

const Users: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const dispatch = useDispatch();
    const t = useTranslations();
    const users = useSelector(getUsers);
    const isUpdating = useSelector(isUpdatingUsers);

    const [expanded, setExpanded] = React.useState<string | undefined>(undefined);
    const [usersAdapted, setUsersAdapted] = React.useState(users.map((user) => ({ ...user, id: user.username })));

    // eslint-disable-next-line
    React.useEffect(() => {
        dispatch(fetchUsers());
        setHeaderName(t(TK.users));
    }, []);

    React.useEffect(() => setUsersAdapted(users.map((user) => ({ ...user, id: user.username }))), [users]);

    const onAddNew = React.useCallback((): void => {
        setUsersAdapted([{ id: newUserUsernameId, username: '', roles: [] }, ...usersAdapted]);
        setExpanded(newUserUsernameId);
    }, [setUsersAdapted, setExpanded, usersAdapted]);

    const onUpdateUser = React.useCallback(
        (user: CreateUser): void => {
            dispatch(updateUser(user.username, user));
        },
        [dispatch],
    );
    const onCreateUser = React.useCallback(
        (user: CreateUser): void => {
            dispatch(createUser(user));
        },
        [dispatch],
    );

    const onCancelCreate = React.useCallback((): void => {
        setUsersAdapted(usersAdapted.slice(1));
        setExpanded(undefined);
    }, [setExpanded, setUsersAdapted, usersAdapted]);

    return (
            <Page
            title={t(TK.users)}
            actionPanel={
                <Tooltip title={t(TK.addNew)}>
                    <IconButton onClick={onAddNew}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            }
            style={{ marginTop: '10rem' }}
        >
            <RequireRole roles={[UserRole.Administrator]} showRestrictedMessage>
                <List
                    items={usersAdapted}
                    defaultExpanded={expanded}
                    renderName={(user: User & Item) => (user.id === newUserUsernameId ? t(TK.addNew) : user.username)}
                    renderSummary={(user: User & Item) => user.roles.join(', ')}
                    renderDetails={(user: User & Item) => (
                        <UserForm
                            type={user.id === newUserUsernameId ? 'create' : 'edit'}
                            isAdmin
                            isLoading={isUpdating}
                            value={user as any}
                            onChange={user.id === newUserUsernameId ? onCreateUser : onUpdateUser}
                            onCancel={user.id === newUserUsernameId ? onCancelCreate : undefined}
                        />
                    )}
                />
            </RequireRole>
        </Page>
    );
};

export default Users;
