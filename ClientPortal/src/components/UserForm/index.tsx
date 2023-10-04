import * as React from 'react';
import { CreateUser } from '../../models/CreateUser';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import MultipleSelectInput from '../inputs/MultipleSelectInput';
import { Grid, Button } from '@material-ui/core';
import TextInput from '../inputs/TextInput';
import { UserRole } from '../../models/UserRole';
import { FormContainer } from './styled';
import { PanelButtonsContainer } from '../Panel';

export interface UserFormProps {
    value?: CreateUser;
    type?: 'edit' | 'create';
    isLoading?: boolean;
    isAdmin?: boolean;
    onChange: (value: CreateUser) => void;
    onCancel?: () => void;
}

const areEqual = (o1: any, o2: any): boolean => {
    if(Array.isArray(o1)) o1 = o1.join(", ");
    if(Array.isArray(o2)) o2 = o2.join(", ");
    return (!o1 && !o2) || o1 === o2;
}

const UserForm: React.FC<UserFormProps> = ({ 
    value,
    type = 'create', 
    isLoading = false, 
    isAdmin = false, 
    onChange,
    onCancel,
}) => {

    const t = useTranslations();

    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [editedUser, setEditedUser] = React.useState({value: value || {} as CreateUser, valid: false});

    const handleChange = React.useCallback((newValue: CreateUser) => {
        if (type === 'edit') {
            const valid = !newValue.password?.length || newValue.password === confirmPassword;
            setEditedUser({value: newValue, valid});
        } else {
            const valid =
                !!newValue.password?.length && !!newValue.username?.length && newValue.password === confirmPassword;
            setEditedUser({value: newValue, valid});
        }
    }, [setEditedUser, confirmPassword, type]);

    // eslint-disable-next-line
    React.useMemo(() => handleChange(editedUser.value), [handleChange, confirmPassword]);
    
    React.useMemo(() => {
        if(value) {
            handleChange(value);
            setConfirmPassword('');
        }
        // eslint-disable-next-line
    }, [value]);

    const hasChanged = React.useMemo<boolean>(() => !!value && (
        !areEqual(value.username, editedUser.value.username) || 
        !areEqual(value.roles, editedUser.value.roles) || 
        !areEqual(value.password, editedUser.value.password) || 
        !areEqual(value.email, editedUser.value.email) || 
        !areEqual(value.firstName, editedUser.value.firstName) || 
        !areEqual(value.lastName, editedUser.value.lastName) || 
        !areEqual(value.title, editedUser.value.title) || 
        !areEqual(value.streakApiKey, editedUser.value.streakApiKey)),
    [editedUser, value]);

    const handleCancel = () => {
        setEditedUser({value: value || {} as CreateUser, valid: false}); 
        setConfirmPassword('');
        onCancel && onCancel();
    };

    return (
        <FormContainer container spacing={3}>
            <Grid item xs={12} sm={6}>
                <TextInput
                    label={t(TK.username)}
                    value={editedUser.value.username}
                    disabled={type === 'edit'}
                    error={type === 'create' && !editedUser.value.username}
                    onChange={(username) => handleChange({ ...editedUser.value, username })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextInput
                    label={t(TK.email)}
                    value={editedUser.value.email}
                    onChange={(email) => handleChange({ ...editedUser.value, email })}
                />
            </Grid>
            { isAdmin &&
                <Grid item xs={12}>
                    <MultipleSelectInput
                        label={t(TK.roles)}
                        options={Object.keys(UserRole)}
                        values={editedUser.value.roles}
                        renderOption={(v) => v}
                        getOptionLabel={(v) => v}
                        onChange={(roles) => handleChange({ ...editedUser.value, roles })}
                    />
                </Grid>
            }
            <Grid item xs={6}>
                <TextInput
                    label={t(TK.password)}
                    value={editedUser.value.password}
                    type="password"
                    error={type === 'create' && !editedUser.value.password}
                    onChange={(password) => handleChange({ ...editedUser.value, password })}
                />
            </Grid>
            <Grid item xs={6}>
                <TextInput
                    label={t(TK.confirmPassword)}
                    value={confirmPassword}
                    type="password"
                    error={(editedUser.value.password?.length && editedUser.value.password !== confirmPassword) || false}
                    onChange={(confirmPassword) => setConfirmPassword(confirmPassword)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextInput
                    label={t(TK.firstName)}
                    value={editedUser.value.firstName}
                    onChange={(firstName) => handleChange({ ...editedUser.value, firstName })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextInput
                    label={t(TK.lastName)}
                    value={editedUser.value.lastName}
                    onChange={(lastName) => handleChange({ ...editedUser.value, lastName })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextInput
                    label={t(TK.title)}
                    value={editedUser.value.title}
                    onChange={(title) => handleChange({ ...editedUser.value, title })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextInput
                    label={t(TK.streakApiKey)}
                    value={editedUser.value.streakApiKey}
                    onChange={(streakApiKey) => handleChange({ ...editedUser.value, streakApiKey })}
                />
            </Grid>
            <PanelButtonsContainer>
                <Button
                    disabled={isLoading || (type !== 'create' && !hasChanged)}
                    variant="contained"
                    onClick={handleCancel}
                >
                    {t(TK.cancel)}
                </Button>
                <Button
                    disabled={!hasChanged || isLoading || !editedUser.valid}
                    variant="contained"
                    color="primary"
                    onClick={() => onChange(editedUser.value)}
                >
                    {t(type === 'edit' ? TK.update : TK.create)}
                </Button>
            </PanelButtonsContainer>
        </FormContainer>
    );
};

export default UserForm;
