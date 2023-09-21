import * as React from 'react';
import { InputAdornment, TextField } from '@material-ui/core';
import { Error } from '../Styled/FormElements';

export interface TextInputProps<T> {
    label?: string;
    value?: T;
    type?: string;
    formStyle?: { [key: string]: string };
    width?: number;
    placeholder?: string;
    error?: string | boolean;
    disabled?: boolean;
    readOnly?: boolean;
    multiline?: boolean;
    endAdorment?: React.ReactNode | string;
    onChange?: (value: T) => void;
    [x: string]: any;
}

const TextInput: React.FC<TextInputProps<string>> = ({
    label,
    value,
    type = 'text',
    disabled,
    readOnly,
    placeholder,
    multiline,
    error,
    endAdorment,
    formStyle,
    onChange,
    ...rest
}) => {
    return (
        <form
            noValidate
            style={formStyle}
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <TextField
                variant={readOnly ? 'standard' : 'outlined'}
                placeholder={placeholder}
                disabled={disabled}
                value={value || ''}
                error={!!error}
                type={type}
                label={label}
                multiline={multiline}
                rows={multiline ? 3 : 1}
                InputLabelProps={{ shrink: true }}
                size="small"
                onChange={(e) => onChange && onChange(e.target.value as string)}
                autoComplete="off"
                InputProps={{
                    endAdornment:
                        typeof endAdorment === 'string' ? (
                            <InputAdornment position="start">{endAdorment}</InputAdornment>
                        ) : (
                            endAdorment
                        ),
                    autoComplete: 'off',
                    readOnly,
                }}
                {...rest}
            />
            {error && typeof error === 'string' && <Error>{error}</Error>}
        </form>
    );
};
export default TextInput;
