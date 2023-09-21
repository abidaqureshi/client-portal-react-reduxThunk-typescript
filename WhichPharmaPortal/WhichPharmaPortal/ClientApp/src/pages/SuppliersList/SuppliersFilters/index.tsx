import * as React from 'react';
import { TK } from '../../../store/Translations/translationKeys';
import MultipleSelectInput from '../../../components/inputs/MultipleSelectInput';
import { Country } from '../../../models/Country';
import TextInput from '../../../components/inputs/TextInput';
import { useTranslations } from '../../../store/Translations/hooks';
import { useCountriesSet } from '../../../store/Sets/hooks';
import { Filters, FiltersKey } from './types';
import { SupplierState } from '../../../models/SupplierState';
import { FiltersInputsContainer } from './styled';

const getAsArray = (value: string | string[] | null | undefined): string[] =>
    value === undefined ? [] : typeof value === 'string' ? [value as string] : (value as string[]);

export interface SuppliersFiltersProps {
    initialValues: Filters;
    onChange: (filters: Filters) => void;
}

const SuppliersFilters: React.FC<SuppliersFiltersProps> = ({ initialValues, onChange }) => {
    const t = useTranslations();

    const countries = useCountriesSet();

    const [filters, setFilters] = React.useState(initialValues);
    const [debounce, setDebounce] = React.useState<NodeJS.Timeout | undefined>(undefined);
    const statuses = React.useMemo(
        () => [
            SupplierState.Suspended,
            SupplierState.Qualify,
            SupplierState.Qualified,
            SupplierState.Others,
            SupplierState.New,
        ],
        [],
    );

    const updateFilters = (property: string, value: string | string[]) => {
        const newFilters = { ...filters, [property]: value || undefined };
        setFilters(newFilters);
        debounce && clearTimeout(debounce);
        setDebounce(setTimeout(() => onChange(newFilters), 1000));
    };

    return (
        <div>
            <FiltersInputsContainer style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                <MultipleSelectInput
                    label={t(TK.country)}
                    placeholder={t(TK.all)}
                    limitTags={10}
                    options={countries}
                    values={countries.filter((country) =>
                        (filters[FiltersKey.Countries] || []).includes(country.alpha2Code),
                    )}
                    onChange={(v) =>
                        updateFilters(
                            FiltersKey.Countries,
                            v.map((country: Country) => country.alpha2Code),
                        )
                    }
                    getOptionLabel={(option: Country) => option?.name || ''}
                    renderOption={(option: Country) => `${option.name} (${option.alpha2Code})`}
                    style={{ width: '450px' }}
                />
                <MultipleSelectInput
                    label={t(TK.status)}
                    placeholder={t(TK.all)}
                    limitTags={10}
                    options={statuses}
                    values={getAsArray(filters[FiltersKey.Statuses])}
                    onChange={(v): void => updateFilters(FiltersKey.Statuses, v)}
                    style={{ width: '450px' }}
                />
                <TextInput
                    label={t(TK.name)}
                    placeholder={t(TK.all)}
                    value={filters[FiltersKey.Name] as string}
                    onChange={(v) => updateFilters(FiltersKey.Name, v)}
                    style={{ width: '450px' }}
                />
            </FiltersInputsContainer>
        </div>
    );
};

export default SuppliersFilters;
