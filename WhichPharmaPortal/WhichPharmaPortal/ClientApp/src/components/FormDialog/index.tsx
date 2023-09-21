import * as React from 'react';
import { Dialog, DialogTitle, List, ListItem, Button } from '@material-ui/core';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import Input from '../inputs/Input';
import { PanelButtonsContainer } from '../Panel';
import SingleSelectInput from '../inputs/SingleSelectInput';
import { ifEnter } from '../../utils/utils';

export interface FormDialogProps {
    title: string,
    open: boolean,
    fields?: {
        key: string,
        label?: string,
        options?: string[],
        placeholder?: string,
        freeSolo?: boolean,
        validate?: (value: string) => string|undefined,
    }[],
    onClose: () => void,
    onSubmit: (values: {[key: string]: string}) => void,
}

const FormDialog : React.FC<FormDialogProps> = ({
    title, 
    open, 
    fields,
    onClose, 
    onSubmit,
}) => {

    const t = useTranslations();

    const [values, setValues] = React.useState<{[key:string]:string}>({});
    const [errors, setErrors] = React.useState<{[key:string]:string|undefined}>({});

    const hasErrors = React.useMemo(() => Object.values(errors).filter(error => error).length > 0, [errors]);

    const handleSubmit = React.useCallback(() => {
        const newErrors = fields
            ?.map(field => ({[field.key]: field.validate && field.validate(values[field.key])}))
            .reduce((prev, curr) => Object.assign(prev, curr), {}) || {};

        setErrors(newErrors);

        const anyError = Object.values(newErrors).filter(error => error).length > 0;

        if(!anyError){
            onSubmit(values);
        }
    }, [values, fields, onSubmit]);

    const handleOnKeyUp = React.useCallback((keyCode: number) => ifEnter(keyCode, handleSubmit), [handleSubmit])

    const handleValueChange = React.useCallback((key: string) => (value: string) => {
        setErrors(prev => ({...prev, [key]: undefined}));
        setValues(prev => ({...prev, [key]: value}));
    }, []);
    
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <List>
                {fields?.map(field => (
                    <ListItem key={field.key}>
                        {field.options 
                            ?   <SingleSelectInput 
                                    label={field.label}
                                    options={field.options}
                                    placeholder={field.placeholder}
                                    value={values[field.key]}
                                    error={errors[field.key]}
                                    freeSolo={field.freeSolo}
                                    onChange={handleValueChange(field.key)}
                                    onKeyUp={handleOnKeyUp}
                                />
                            :   <Input
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    value={values[field.key]}
                                    error={errors[field.key]}
                                    onChange={handleValueChange(field.key)}
                                    onKeyUp={handleOnKeyUp}
                                />
                        }
                    </ListItem>
                ))}
                <hr/>
                <ListItem>
                    <PanelButtonsContainer nomargin>
                        <Button onClick={onClose}>
                            {t(TK.cancel)}
                        </Button>
                        <Button disabled={hasErrors} color="primary" variant="contained" onClick={handleSubmit}>
                            {t(TK.ok)}
                        </Button>
                    </PanelButtonsContainer>
                </ListItem>
            </List>
        </Dialog>
    );
}

export default FormDialog;