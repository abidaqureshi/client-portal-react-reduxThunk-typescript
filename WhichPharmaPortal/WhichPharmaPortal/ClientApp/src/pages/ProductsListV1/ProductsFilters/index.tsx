import * as React from 'react';
import {
    Grid,
    IconButton,
    InputAdornment,
    Typography,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
} from '@material-ui/core';
import { TK } from '../../../store/Translations/translationKeys';
import MultipleSelectInput from '../../../components/inputs/MultipleSelectInput';
import { Country } from '../../../models/Country';
import TextInput from '../../../components/inputs/TextInput';
import { useTranslations } from '../../../store/Translations/hooks';
import {
    useATCsSet,
    useActiveSubstancesSet,
    useCountriesSet,
    useOriginsSet,
    useDrugFormsSet,
    useStatusesSet,
    useAdministrationFormsSet,
} from '../../../store/Sets/hooks';
import { Filters, FiltersKey } from './types';
import SearchContainer, { AdvancedSearchContainer } from '../../../components/SearchContainer';
import { SearchButton, ExpandableContainer } from './styled';
import useKeyPress from '../../../utils/hooks/keyPress';
import InfoIcon from '@material-ui/icons/Info';
import { Spinner } from 'reactstrap';
import RequireRole from '../../../components/RequireRole';
import { UserRole } from '../../../models/UserRole';
import SingleSelectInput from '../../../components/inputs/SingleSelectInput';
import { AppContext } from '../../../app/App';
import { AppContextType } from '../../../context/@types/types';

export interface ProductsFiltersProps {
    defaultFilters: Filters;
    isLoading: boolean;
    onChange: (filters: Filters) => void;
}

const getAsArray = (value: string | string[] | null | undefined): string[] =>
    value === undefined ? [] : typeof value === 'string' ? [value as string] : (value as string[]);

interface ColumnsDefinition {
    xs?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sm?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    md?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    lg?: boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const gridItemColumnsProps: ColumnsDefinition = {
    xs: 12,
    sm: 6,
    md: 4,
};

const areEqual = (o1: any, o2: any): boolean => {
    if (Array.isArray(o1)) o1 = o1.join(', ');
    if (Array.isArray(o2)) o2 = o2.join(', ');
    return o1 === o2;
};

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
    defaultFilters,
    isLoading,
    onChange,
}: ProductsFiltersProps) => {
    const t = useTranslations();

    const atcs = useATCsSet();
    const activeSubstances = useActiveSubstancesSet();
    const countries = useCountriesSet();
    const origins = useOriginsSet();
    const drugForms = useDrugFormsSet();
    const administrationForms = useAdministrationFormsSet();
    const statuses = useStatusesSet();

    const [freeTextInfoOpen, setFreeTextInfoOpen] = React.useState(false);
    const [filters, setFilters] = React.useState(defaultFilters);
    const { handleDrawerToggle, isOpen } = React.useContext(AppContext) as AppContextType;

    const updateFilters = React.useCallback(
        (property: string, value: string | string[]): void => {
            const newFilters = { ...filters, [property]: value && value.length ? value : undefined };
            setFilters(newFilters);
            // eslint-disable-next-line
        },
        [filters],
    );

    const onSearchClick = React.useCallback(() => {
        onChange(filters);
        if (isOpen) {
            handleDrawerToggle();
        }
    }, [onChange, filters, handleDrawerToggle, isOpen]);

    const clearAll = React.useCallback(() => {
        const newFilters = {
            [FiltersKey.Free]: undefined,
            [FiltersKey.Name]: undefined,
            [FiltersKey.Countries]: undefined,
            [FiltersKey.ActiveSubstances]: undefined,
            [FiltersKey.Atc]: undefined,
            [FiltersKey.DrugForms]: undefined,
            [FiltersKey.AdministrationForms]: undefined,
            [FiltersKey.ProductCode]: undefined,
            [FiltersKey.Holder]: undefined,
            [FiltersKey.Statuses]: undefined,
            [FiltersKey.Origins]: undefined,
            [FiltersKey.Shortages]: undefined,
        };
        setFilters(newFilters);
        onChange(newFilters);
        // eslint-disable-next-line
    }, []);

    const hasAdvancedFilters = React.useMemo<boolean>(
        () =>
            !!(
                filters[FiltersKey.Countries] ||
                filters[FiltersKey.Name] ||
                filters[FiltersKey.ActiveSubstances] ||
                filters[FiltersKey.Atc] ||
                filters[FiltersKey.DrugForms] ||
                filters[FiltersKey.AdministrationForms] ||
                filters[FiltersKey.ProductCode] ||
                filters[FiltersKey.Holder] ||
                filters[FiltersKey.Statuses] ||
                filters[FiltersKey.Origins] ||
                filters[FiltersKey.Shortages] ||
                filters[FiltersKey.IncludeExprice] === 'true'
            ),
        [filters],
    );

    const hasFilters = React.useMemo<boolean>(() => !!(hasAdvancedFilters || filters[FiltersKey.Name]), [
        filters,
        hasAdvancedFilters,
    ]);

    const hasChanged = React.useMemo<boolean>(
        () =>
            !areEqual(filters[FiltersKey.Free], defaultFilters[FiltersKey.Free]) ||
            !areEqual(filters[FiltersKey.Name], defaultFilters[FiltersKey.Name]) ||
            !areEqual(filters[FiltersKey.Countries], defaultFilters[FiltersKey.Countries]) ||
            !areEqual(filters[FiltersKey.ActiveSubstances], defaultFilters[FiltersKey.ActiveSubstances]) ||
            !areEqual(filters[FiltersKey.Atc], defaultFilters[FiltersKey.Atc]) ||
            !areEqual(filters[FiltersKey.DrugForms], defaultFilters[FiltersKey.DrugForms]) ||
            !areEqual(filters[FiltersKey.AdministrationForms], defaultFilters[FiltersKey.AdministrationForms]) ||
            !areEqual(filters[FiltersKey.ProductCode], defaultFilters[FiltersKey.ProductCode]) ||
            !areEqual(filters[FiltersKey.Holder], defaultFilters[FiltersKey.Holder]) ||
            !areEqual(filters[FiltersKey.Statuses], defaultFilters[FiltersKey.Statuses]) ||
            !areEqual(filters[FiltersKey.Origins], defaultFilters[FiltersKey.Origins]) ||
            !areEqual(filters[FiltersKey.Shortages], defaultFilters[FiltersKey.Shortages]) ||
            !areEqual(filters[FiltersKey.IncludeExprice], defaultFilters[FiltersKey.IncludeExprice]),
        [filters, defaultFilters],
    );

    useKeyPress('Enter', () => !isLoading && hasChanged && onChange(filters));

    return (
        <SearchContainer showClearButton={hasFilters} onClearAll={clearAll}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextInput
                        label={t(TK.freeTextSearch)}
                        placeholder={t(TK.freeTextSearchDescription)}
                        value={filters[FiltersKey.Free] as string}
                        onChange={(v): void => updateFilters(FiltersKey.Free, v)}
                        endAdorment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="free text filter info"
                                    edge="end"
                                    onClick={() => setFreeTextInfoOpen(true)}
                                >
                                    <InfoIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </Grid>
            </Grid>

            <Dialog open={freeTextInfoOpen} onClose={() => setFreeTextInfoOpen(false)}>
                <DialogContent>
                    <Typography variant="h5">{t(TK.freeTextSearch)}</Typography>
                </DialogContent>
                <DialogContent dividers>
                    <Typography variant="h6">{t(TK.defaultBehavior)}</Typography>
                    <Typography gutterBottom>{t(TK.freeTextSearchDefaultBehaviorInfo)}</Typography>
                    <Typography variant="h6">{t(TK.mandatoryWords)}</Typography>
                    <Typography gutterBottom>{t(TK.freeTextSearchMandatoryWordsInfo)}</Typography>
                    <Typography variant="h6">{t(TK.exactPhrase)}</Typography>
                    <Typography gutterBottom>{t(TK.freeTextSearchExactPhraseInfo)}</Typography>
                    <Typography variant="h6">{t(TK.excludeWords)}</Typography>
                    <Typography gutterBottom>{t(TK.freeTextSearchExcludeWordsInfo)}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setFreeTextInfoOpen(false)} color="primary">
                        {t(TK.ok)}
                    </Button>
                </DialogActions>
            </Dialog>

            <AdvancedSearchContainer showChangeNotification={hasAdvancedFilters}>
                <ExpandableContainer container spacing={3}>
                    <Grid item {...gridItemColumnsProps}>
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
                    <Grid item {...gridItemColumnsProps}>
                        <TextInput
                            label={t(TK.name)}
                            placeholder={t(TK.all)}
                            value={filters[FiltersKey.Name] as string}
                            onChange={(v): void => updateFilters(FiltersKey.Name, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.atc)}
                            placeholder={t(TK.all)}
                            options={atcs}
                            values={getAsArray(filters[FiltersKey.Atc])}
                            onChange={(v): void => updateFilters(FiltersKey.Atc, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.activeSubstances)}
                            placeholder={t(TK.all)}
                            options={activeSubstances}
                            values={getAsArray(filters[FiltersKey.ActiveSubstances])}
                            onChange={(v): void => updateFilters(FiltersKey.ActiveSubstances, v)}
                            allowAdd
                            texts={{ addNew: '' }}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.drugForm)}
                            placeholder={t(TK.all)}
                            options={drugForms}
                            values={getAsArray(filters[FiltersKey.DrugForms])}
                            onChange={(v): void => updateFilters(FiltersKey.DrugForms, v)}
                            allowAdd
                            texts={{ addNew: '' }}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.administrationForm)}
                            placeholder={t(TK.all)}
                            options={administrationForms}
                            values={getAsArray(filters[FiltersKey.AdministrationForms])}
                            onChange={(v): void => updateFilters(FiltersKey.AdministrationForms, v)}
                            allowAdd
                            texts={{ addNew: '' }}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <TextInput
                            label={t(TK.productCodeOrMANumber)}
                            placeholder={t(TK.all)}
                            value={filters[FiltersKey.ProductCode] as string}
                            onChange={(v): void => updateFilters(FiltersKey.ProductCode, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <TextInput
                            label={t(TK.manufacturerOrMAHolder)}
                            placeholder={t(TK.all)}
                            value={filters[FiltersKey.Holder] as string}
                            onChange={(v): void => updateFilters(FiltersKey.Holder, v)}
                        />
                    </Grid>
                    <RequireRole roles={[UserRole.PlatformContributor]}>
                        <Grid item {...gridItemColumnsProps}>
                            <MultipleSelectInput
                                label={t(TK.scrapingOrigin)}
                                placeholder={t(TK.all)}
                                options={origins}
                                values={getAsArray(filters[FiltersKey.Origins])}
                                onChange={(v): void => updateFilters(FiltersKey.Origins, v)}
                            />
                        </Grid>
                    </RequireRole>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.status)}
                            placeholder={t(TK.all)}
                            options={statuses}
                            values={getAsArray(filters[FiltersKey.Statuses])}
                            onChange={(v): void => updateFilters(FiltersKey.Statuses, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <SingleSelectInput
                            label={t(TK.includeExprice)}
                            placeholder={t(TK.no)}
                            options={[TK.yes, TK.no]}
                            getOptionLabel={(value) => t(value as TK)}
                            value={filters[FiltersKey.IncludeExprice] === 'true' ? TK.yes : TK.no}
                            onChange={(v): void =>
                                updateFilters(FiltersKey.IncludeExprice, v === TK.yes ? 'true' : 'false')
                            }
                        />
                    </Grid>
                </ExpandableContainer>
            </AdvancedSearchContainer>

            <SearchButton
                disabled={!hasChanged || isLoading}
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

export default ProductsFilters;
