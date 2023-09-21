import * as React from 'react';
import { Grid } from '@material-ui/core';
import { TK } from '../../../store/Translations/translationKeys';
import MultipleSelectInput from '../../../components/inputs/MultipleSelectInput';
import { Country } from '../../../models/Country';
import { useTranslations } from '../../../store/Translations/hooks';
import {
    useCountriesSet,
} from '../../../store/Sets/hooks';
import { Filters, FiltersKey } from './types';
import TextInput from '../../../components/inputs/TextInput';
import { ShortageType } from '../../../models/ShortageType';
import { ToggleButton } from '@material-ui/lab';
import moment from 'moment';
import { DateFormat } from '../../../components/Table/DataTypeFormatter';
import SearchContainer, { AdvancedSearchContainer } from '../../../components/SearchContainer';
import { SearchButton, ExpandableContainer } from './styled';
import useKeyPress from '../../../utils/hooks/keyPress';
import { Spinner } from 'reactstrap';

export interface ShortagesFiltersProps {
    defaultFilters: Filters;
    isLoading: boolean;
    onChange: (filters: Filters) => void;
}

interface ColumnsDefinition {
    xs?: boolean | "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    sm?: boolean | "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    md?: boolean | "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    lg?: boolean | "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
}

const gridItemColumnsProps: ColumnsDefinition = {
    xs: 12,
    sm: 6,
}

const getAsArray = (value: string | string[] | undefined): string[] =>
    value === undefined ? [] : typeof value === 'string' ? [value as string] : (value as string[]);

const areEqual = (o1: any, o2: any): boolean => {
    if(Array.isArray(o1)) o1 = o1.join(", ");
    if(Array.isArray(o2)) o2 = o2.join(", ");
    return o1 === o2;
}

const ShortagesFilters: React.FC<ShortagesFiltersProps> = ({ defaultFilters, isLoading, onChange }: ShortagesFiltersProps) => {
    const t = useTranslations();

    const countries = useCountriesSet();

    const [filters, setFilters] = React.useState(defaultFilters);

    const updateFilters = React.useCallback((property: string, value: string | string[]): void => {
        const newFilters = { ...filters, [property]: value && value.length ? value : undefined };
        setFilters(newFilters);
        // eslint-disable-next-line
    }, [filters]);

    const onSearchClick = React.useCallback(() => onChange(filters), [onChange, filters]);

    const clearAll = React.useCallback(() => {
        const newFilters = {
            [FiltersKey.Countries]: undefined,
            [FiltersKey.Origins]: undefined,
            [FiltersKey.Types]: undefined,
            [FiltersKey.MinStartDate]: undefined,
            [FiltersKey.MaxStartDate]: undefined,
            [FiltersKey.MinEndDate]: undefined,
            [FiltersKey.MaxEndDate]: undefined,
        };
        setFilters(newFilters);
        onChange(newFilters);
        // eslint-disable-next-line
    }, []);

    const hasAdvancedFilters = React.useMemo<boolean>(() => !!(
        filters[FiltersKey.Origins]
        || filters[FiltersKey.Types] 
        || filters[FiltersKey.MinStartDate] 
        || filters[FiltersKey.MaxStartDate] 
        || filters[FiltersKey.MinEndDate] 
        || filters[FiltersKey.MaxEndDate]),
    [filters]);

    const hasFilters = React.useMemo<boolean>(() => !!(hasAdvancedFilters || filters[FiltersKey.Countries]), [filters, hasAdvancedFilters]);

    const hasChanged = React.useMemo<boolean>(() => 
        !areEqual(filters[FiltersKey.Countries], defaultFilters[FiltersKey.Countries]) ||
        !areEqual(filters[FiltersKey.Origins], defaultFilters[FiltersKey.Origins]) ||
        !areEqual(filters[FiltersKey.Types], defaultFilters[FiltersKey.Types]) ||
        !areEqual(filters[FiltersKey.MinStartDate], defaultFilters[FiltersKey.MinStartDate]) ||
        !areEqual(filters[FiltersKey.MaxStartDate], defaultFilters[FiltersKey.MaxStartDate]) ||
        !areEqual(filters[FiltersKey.MinEndDate], defaultFilters[FiltersKey.MinEndDate]) ||
        !areEqual(filters[FiltersKey.MaxEndDate], defaultFilters[FiltersKey.MaxEndDate]),
    [filters, defaultFilters]);

    const onlyActive = React.useMemo(() => {
        const minStartDate = filters[FiltersKey.MinStartDate];
        const maxStartDate = filters[FiltersKey.MaxStartDate];
        const minEndDate = filters[FiltersKey.MinEndDate];
        const maxEndDate = filters[FiltersKey.MaxEndDate];
        return !minStartDate && !!maxStartDate
            && !!minEndDate && !maxEndDate
            && moment(maxStartDate).startOf('day').isSame(moment().startOf('day'))
            && moment(minEndDate).startOf('day').isSame(moment().startOf('day'));
    }, [filters]);

    const toggleOnlyActive = React.useCallback(() => {
        const newFilters = onlyActive ?
            {
                ...filters,
                [FiltersKey.MinStartDate]: undefined,
                [FiltersKey.MaxStartDate]: undefined,
                [FiltersKey.MinEndDate]: undefined,
                [FiltersKey.MaxEndDate]: undefined,
            } : {
                ...filters,
                [FiltersKey.MinStartDate]: undefined,
                [FiltersKey.MaxStartDate]: moment().format(DateFormat),
                [FiltersKey.MinEndDate]: moment().format(DateFormat),
                [FiltersKey.MaxEndDate]: undefined,
            };
            
        setFilters(newFilters);
        // eslint-disable-next-line
    }, [filters]);

    useKeyPress('Enter', () => !isLoading && hasChanged && onChange(filters));

    return (
        <SearchContainer showClearButton={hasFilters} onClearAll={clearAll}>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={9} >
                    <MultipleSelectInput
                        label={t(TK.country)}
                        placeholder={t(TK.all)}
                        options={countries}
                        values={countries.filter((country) =>
                            (filters[FiltersKey.Countries] || []).includes(country.alpha2Code),
                        )}
                        onChange={(v): void =>
                            updateFilters(
                                FiltersKey.Countries,
                                v.map((country: Country) => country.alpha2Code),
                            )
                        }
                        getOptionLabel={(option: Country): string => option?.name || ''}
                        renderOption={(option: Country): string => `${option.name} (${option.alpha2Code})`}
                    />
                </Grid>
                <Grid item sm={3} >
                    <ToggleButton 
                        style={{width: '100%'}} 
                        size="small"
                        selected={onlyActive}
                        onChange={toggleOnlyActive}
                    >
                        {t(TK.onlyActive)}
                    </ToggleButton>
                </Grid>
            </Grid>

            <AdvancedSearchContainer showChangeNotification={hasAdvancedFilters}>
                <ExpandableContainer container spacing={3}>
                    <Grid item {...gridItemColumnsProps} >
                        <TextInput 
                            label={t(TK.minStart)}
                            type="date"
                            value={filters[FiltersKey.MinStartDate] as string}
                            onChange={v => updateFilters(FiltersKey.MinStartDate, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps} >
                        <TextInput 
                            label={t(TK.maxStart)}
                            type="date"
                            value={filters[FiltersKey.MaxStartDate] as string}
                            onChange={v => updateFilters(FiltersKey.MaxStartDate, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps} >
                        <TextInput 
                            label={t(TK.minEnd)}
                            type="date"
                            value={filters[FiltersKey.MinEndDate] as string}
                            onChange={v => updateFilters(FiltersKey.MinEndDate, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps} >
                        <TextInput 
                            label={t(TK.maxEnd)}
                            type="date"
                            value={filters[FiltersKey.MaxEndDate] as string}
                            onChange={v => updateFilters(FiltersKey.MaxEndDate, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps} >
                        <MultipleSelectInput
                            label={t(TK.type)}
                            placeholder={t(TK.all)}
                            options={Object.keys(ShortageType).filter(v => typeof v === 'string')}
                            values={getAsArray(filters[FiltersKey.Types])}
                            onChange={(v): void => updateFilters(FiltersKey.Types, v)}
                        />
                    </Grid>
                </ExpandableContainer>
            </AdvancedSearchContainer>

            <SearchButton 
                disabled={!hasChanged} 
                variant="contained" 
                size="large" 
                color="primary" 
                onClick={onSearchClick}
            >
                {t(TK.search)}
                {isLoading && <Spinner size="sm" />}
            </SearchButton>
        </SearchContainer>
    );
};

export default ShortagesFilters;
