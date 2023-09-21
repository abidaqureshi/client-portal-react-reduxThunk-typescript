import * as React from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { useTranslations } from '../../store/Translations/hooks';
import { TextInputProps } from './TextInput';
import { TK } from '../../store/Translations/translationKeys';
import { Error } from '../Styled/FormElements';
import CircularProgress from '@material-ui/core/CircularProgress';

export interface SingleSelectInputProps<T> extends TextInputProps<T> {
    options: T[];
    freeSolo?: boolean;
    error?: string;
    isLoading?: boolean;
    hideClearButton?: boolean;
    renderOption?: (option: T) => React.ReactNode;
    getOptionLabel?: (option: T) => string;
    onKeyUp?: (keyCode: number) => void;
    className?: string;
}

const SingleSelectInput: React.FC<SingleSelectInputProps<any>> = ({
    label,
    value,
    placeholder,
    options,
    freeSolo,
    error,
    readOnly,
    isLoading,
    className,
    hideClearButton,
    onChange,
    renderOption,
    getOptionLabel,
    onKeyUp,
}) => {
    const t = useTranslations();
    return (
        <div style={{ width: '100%' }} className={className}>
            <Autocomplete
                multiple={false}
                freeSolo={freeSolo}
                clearOnBlur={!freeSolo}
                value={value || ''}
                disableClearable={hideClearButton}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                filterOptions={createFilterOptions({ ignoreAccents: true, ignoreCase: true, limit: 100, trim: true })}
                onChange={(_: any, value: any) => !freeSolo && onChange && onChange(value as string)}
                onKeyUp={(e: React.KeyboardEvent) => onKeyUp && onKeyUp(e.keyCode)}
                options={[...options] || []}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                        placeholder={options.length ? placeholder : isLoading ? `${t(TK.loading)}...` : ''}
                        variant={readOnly ? 'standard' : 'outlined'}
                        size="small"
                        InputProps={{
                            ...params.InputProps,
                            readOnly,
                            endAdornment: (
                                <React.Fragment>
                                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                        onChange={(e) => {
                            freeSolo && onChange && onChange(e.target.value);
                        }}
                    />
                )}
            />
            {error && <Error>{error}</Error>}
        </div>
    );
};

export default SingleSelectInput;
