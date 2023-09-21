import * as React from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete, createFilterOptions, FilterOptionsState } from '@material-ui/lab';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { Country } from '../../models/Country';

export interface MultipleSelectInputProps<T> {
    label?: string;
    values?: T[];
    options?: T[];
    placeholder?: string;
    allowAdd?: boolean; // Only works when T type is string
    freeSolo?: boolean;
    limitTags?: number;
    isCustomFilter?: boolean;
    style?: React.CSSProperties;
    orderBy?: T[];
    onAdd?: (newValue: string) => void;
    onChange: (values: T[]) => void;
    renderOption?: (option: T, selected: any) => React.ReactNode;
    getOptionLabel?: (option: T) => string;
    texts?: {
        addNew?: string;
        loading?: string;
        noOptions?: string;
    };
}

const MultipleSelectInput: React.FC<MultipleSelectInputProps<any>> = ({
    label,
    values,
    options,
    placeholder,
    allowAdd,
    texts,
    freeSolo,
    limitTags = 2,
    style,
    isCustomFilter,
    onAdd,
    onChange,
    renderOption,
    getOptionLabel,
}) => {
    const t = useTranslations();

    const computedPlaceholder = !!values?.length ? '' : placeholder;

    var defaultFilter = createFilterOptions<string>({ ignoreAccents: true, ignoreCase: true, limit: 100, trim: true });

    const addNewPrefix = (allowAdd && `${texts?.addNew === undefined ? t(TK.addNew) : texts.addNew} "`) || '';

    const filter = !allowAdd
        ? defaultFilter
        : (options: string[], state: FilterOptionsState<string>): string[] => {
              const filtered = defaultFilter(options, state);
              if (state.inputValue !== '') {
                  filtered.unshift(`${addNewPrefix}${state.inputValue}"`);
              }
              return filtered;
          };

    const handleOnChange = (_: React.ChangeEvent<{}>, values: any[]) => {
        if (!allowAdd) {
            onChange(values);
            return;
        }
        const newValueLabel = values.find((v: string) => v.startsWith(addNewPrefix));
        const newValue = newValueLabel && newValueLabel.substring(addNewPrefix.length, newValueLabel.length - 1);

        onAdd && newValue && onAdd(newValue);
        onChange(values.map((v) => (v !== newValueLabel ? v : newValue)));
    };

    const countryFilter = (options: string[], state: FilterOptionsState<string>): string[] => {
        let searchStr = state.inputValue.toLowerCase();
        if (searchStr !== '') {
            return options.filter(
                (item: any) =>
                    item.name.toLowerCase().match(new RegExp('^' + searchStr, 'gi')) ||
                    item.alpha2Code.toLowerCase().match(new RegExp('^' + searchStr, 'gi')),
            );
        }
        return options;
    };

    return (
        <Autocomplete
            multiple={true}
            disableCloseOnSelect
            style={style || {}}
            value={values || []}
            onChange={handleOnChange}
            options={options || []}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            filterOptions={isCustomFilter ? countryFilter : filter}
            loading={options && !values?.length && !options.length}
            noOptionsText={texts?.noOptions === undefined ? t(TK.noOptions) : texts.noOptions}
            loadingText={texts?.loading === undefined ? `${t(TK.loading)}...` : texts.loading}
            limitTags={limitTags}
            freeSolo={freeSolo}
            size="small"
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    InputLabelProps={{ shrink: true }}
                    placeholder={computedPlaceholder}
                    variant="outlined"
                    size="small"
                />
            )}
        />
    );
};

export default MultipleSelectInput;
