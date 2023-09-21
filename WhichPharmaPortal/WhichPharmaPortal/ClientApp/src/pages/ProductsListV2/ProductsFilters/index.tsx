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
    useAdministrationFormsSet,
} from '../../../store/SetsV2/hooks';
import { Filters, FiltersKey } from './types';
import SearchContainer, { AdvancedSearchContainer } from '../../../components/SearchContainer';
import { SearchButton, ExpandableContainer } from './styled';
import useKeyPress from '../../../utils/hooks/keyPress';
import InfoIcon from '@material-ui/icons/Info';
import { Spinner } from 'reactstrap';
import CountryFlag from '../../../components/CountryFlag';
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

const areDifferent = (filters1: Filters, filters2: Filters) =>
    !areEqual(filters1[FiltersKey.Free], filters2[FiltersKey.Free]) ||
    !areEqual(filters1[FiltersKey.Name], filters2[FiltersKey.Name]) ||
    !areEqual(filters1[FiltersKey.Countries], filters2[FiltersKey.Countries]) ||
    !areEqual(filters1[FiltersKey.ActiveSubstances], filters2[FiltersKey.ActiveSubstances]) ||
    !areEqual(filters1[FiltersKey.Atc], filters2[FiltersKey.Atc]) ||
    !areEqual(filters1[FiltersKey.PharmaceuticalForms], filters2[FiltersKey.PharmaceuticalForms]) ||
    !areEqual(filters1[FiltersKey.AdministrationForms], filters2[FiltersKey.AdministrationForms]) ||
    !areEqual(filters1[FiltersKey.ProductCode], filters2[FiltersKey.ProductCode]) ||
    !areEqual(filters1[FiltersKey.Holder], filters2[FiltersKey.Holder]) ||
    !areEqual(filters1[FiltersKey.IsAuthorised], filters2[FiltersKey.IsAuthorised]) ||
    !areEqual(filters1[FiltersKey.IsMarketed], filters2[FiltersKey.IsMarketed]) ||
    !areEqual(filters1[FiltersKey.Origins], filters2[FiltersKey.Origins]);

export const resettedFilters: Filters = {
    [FiltersKey.IsAuthorised]: TK.yes,
    [FiltersKey.IsMarketed]: [TK.yes, TK.unknown],
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

    const [freeTextInfoOpen, setFreeTextInfoOpen] = React.useState(false);
    const [filters, setFilters] = React.useState(defaultFilters);
    const { handleDrawerToggle, isOpen } = React.useContext(AppContext) as AppContextType;

    const updateFilters = React.useCallback(
        (property: string, value: string | string[]): void => {
            const newFilters = { ...filters, [property]: value && value.length ? value : undefined };
            setFilters(newFilters);
        },
        [filters, setFilters],
    );

    const onSearchClick = React.useCallback(() => {
        onChange(filters);
        if (isOpen) {
            handleDrawerToggle();
        }
    }, [onChange, filters]);

    const clearAll = React.useCallback(() => {
        setFilters(resettedFilters);
        onChange(resettedFilters);
    }, [setFilters, onChange]);

    const hasAdvancedFilters = React.useMemo<boolean>(() => areDifferent(resettedFilters, filters), [filters]);

    const hasFilters = React.useMemo<boolean>(() => !!(hasAdvancedFilters || filters[FiltersKey.Name]), [
        filters,
        hasAdvancedFilters,
    ]);

    const hasChanged = React.useMemo<boolean>(() => areDifferent(filters, defaultFilters), [filters, defaultFilters]);

    useKeyPress('Enter', () => !isLoading && hasChanged && onChange(filters));

    return (
        <SearchContainer showClearButton={hasFilters} onClearAll={clearAll}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4} lg={3}>
                    <MultipleSelectInput
                        label={t(TK.country)}
                        placeholder={t(TK.all)}
                        options={countries}
                        orderBy={countries.sort((c, d) => c.name.localeCompare(d.name))}
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
                        renderOption={(option: Country): React.ReactNode => (
                            <CountryFlag
                                countryCode={option.alpha2Code}
                                country={`${option.name} (${option.alpha2Code})`}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={8} lg={9}>
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
                <ExpandableContainer container spacing={2}>
                    <Grid item {...gridItemColumnsProps}>
                        <SingleSelectInput
                            label={t(TK.authorised)}
                            placeholder={t(TK.all)}
                            options={[TK.yes, TK.no]}
                            getOptionLabel={(value) => t(value as TK)}
                            value={filters[FiltersKey.IsAuthorised]}
                            onChange={(v): void => updateFilters(FiltersKey.IsAuthorised, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.marketed)}
                            placeholder={t(TK.all)}
                            options={[TK.yes, TK.no, TK.unknown]}
                            getOptionLabel={(value) => t(value as TK)}
                            values={getAsArray(filters[FiltersKey.IsMarketed])}
                            onChange={(v): void => updateFilters(FiltersKey.IsMarketed, v)}
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
                            label={t(TK.pharmaceuticalForm)}
                            placeholder={t(TK.all)}
                            options={drugForms}
                            values={getAsArray(filters[FiltersKey.PharmaceuticalForms])}
                            onChange={(v): void => updateFilters(FiltersKey.PharmaceuticalForms, v)}
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
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.scrapingOrigin)}
                            placeholder={t(TK.all)}
                            options={origins}
                            values={getAsArray(filters[FiltersKey.Origins])}
                            onChange={(v): void => updateFilters(FiltersKey.Origins, v)}
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
