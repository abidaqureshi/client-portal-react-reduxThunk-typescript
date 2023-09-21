import * as React from 'react';
import { InputWrapper, InputStyled, Label, Error } from '../Styled/FormElements';

interface InputProps<T> {
    label?: string;
    value?: T;
    type?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    onChange: (value: T) => void;
    onKeyUp: (keyCode: number) => void;
}

const Input: React.FC<InputProps<any>> = ({
    label,
    value,
    type,
    placeholder,
    error,
    disabled,
    onChange,
    onKeyUp,
}) => {
    return (
        <div style={{width: '100%'}}>
            { label && <Label>{label}</Label> }
            <InputWrapper rounded error={!!error}>
                <InputStyled
                    value={value || ''}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onKeyUp={(e: React.KeyboardEvent) => onKeyUp(e.keyCode)}
                />
            </InputWrapper>
            { error && <Error>{error}</Error> }
        </div>
    );
};
export default Input;
