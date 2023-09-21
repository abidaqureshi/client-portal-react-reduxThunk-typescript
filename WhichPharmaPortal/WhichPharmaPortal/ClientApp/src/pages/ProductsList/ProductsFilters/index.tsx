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
    Checkbox,
    Box,
    Link,
    makeStyles,
    createStyles,
    Switch,
} from '@material-ui/core';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import PageviewIcon from '@material-ui/icons/Pageview';

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
    useAdditionalInformationSet,
} from '../../../store/SetsV2/hooks';
import { Filters, FiltersKey } from './types';
import SearchContainer, { AGAdvancedSearchContainer } from '../../../components/SearchContainer';
import { ExpandableContainer, RbButton } from './styled';
import useKeyPress from '../../../utils/hooks/keyPress';
import { Spinner } from 'reactstrap';
import CountryFlag from '../../../components/CountryFlag';
import { ButtonWrapper } from '../../../components/Styled/Buttons';
import { AppContext } from '../../../app/App';
import { AppContextType } from '../../../context/@types/types';
import { SearchTags } from '../../../components/SearchTag';
import { useDispatch } from 'react-redux';
import { suppliersDeselectAll } from '../../../store/Suppliers/actions';
import { useLocation } from 'react-router';

export interface ProductsFiltersProps {
    defaultFilters: Filters;
    isLoading: boolean;
    isSwitch?: boolean;
    setIsSwitch?: React.Dispatch<React.SetStateAction<boolean>>;
    onChange: (filters: Filters) => void;
    hideNonCommercialItems?: (isActive: boolean) => void;
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
    !areEqual(filters1[FiltersKey.isAuthorised], filters2[FiltersKey.isAuthorised]) ||
    !areEqual(filters1[FiltersKey.isMarketed], filters2[FiltersKey.isMarketed]) ||
    !areEqual(filters1[FiltersKey.isShortage], filters2[FiltersKey.isShortage]) ||
    !areEqual(filters1[FiltersKey.Origins], filters2[FiltersKey.Origins]) ||
    !areEqual(filters1[FiltersKey.AdditionalInformation], filters2[FiltersKey.AdditionalInformation]) ||
    !areEqual(filters1[FiltersKey.notCommercialized], filters2[FiltersKey.notCommercialized]);

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const resettedFilters: Filters = {
    [FiltersKey.isAuthorised]: TK.yes,
    [FiltersKey.isMarketed]: [TK.yes, TK.unknown],
};

const useStyles = makeStyles(() =>
    createStyles({
        searchIconButton: {
            height: '20px',
            padding: '0px',
            marginRight: '-18px',
        },
        searchIconLarge: {
            fontSize: '3.7875rem',
        },
    }),
);

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
    defaultFilters,
    isLoading,
    isSwitch = false,
    setIsSwitch,
    onChange,
    hideNonCommercialItems,
}: ProductsFiltersProps) => {
    const t = useTranslations();
    const atcs = useATCsSet();
    const activeSubstances = useActiveSubstancesSet();
    const countries = useCountriesSet();
    const path = useLocation();
    const dispatch = useDispatch();

    const drugForms = useDrugFormsSet();
    const administrationForms = useAdministrationFormsSet();
    const additionalInformation = useAdditionalInformationSet();

    const [freeTextInfoOpen, setFreeTextInfoOpen] = React.useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [isCommercial, setIsCommercial] = React.useState(true);

    const { handleDrawerToggle, isOpen } = React.useContext(AppContext) as AppContextType;

    const [filters, setFilters] = React.useState(defaultFilters);

    const classes = useStyles();

    React.useEffect(() => {
        if (!path.search) {
            dispatch(suppliersDeselectAll());
        }
    }, [path, dispatch]);

    const updateFilters = React.useCallback(
        (property: string, value: string | string[]): void => {
            const newFilters = { ...filters, [property]: value && value.length ? value : undefined };
            setFilters(newFilters);
        },
        [filters, setFilters],
    );

    const updateFiltersAndSearch = React.useCallback(
        (property: string, value: string | string[]): void => {
            const newFilters = { ...filters, [property]: value && value.length ? value : undefined };
            setFilters(newFilters);
            onChange(newFilters);
            setShowAdvancedFilters(false);
            if (isOpen) {
                handleDrawerToggle();
            }
        },
        [filters, setFilters, onChange, setShowAdvancedFilters],
    );

    const onSearchClick = React.useCallback(() => {
        onChange(filters);
        setShowAdvancedFilters(false);
        if (isOpen) {
            handleDrawerToggle();
        }
    }, [onChange, filters, setShowAdvancedFilters]);

    const clearAll = React.useCallback(() => {
        setFilters({});
        onChange({});
        dispatch(suppliersDeselectAll());
    }, [setFilters, onChange, dispatch]);

    const hideFilters = React.useCallback(() => {
        setShowAdvancedFilters(false);
    }, [setShowAdvancedFilters]);

    const hasAdvancedFilters = React.useMemo<boolean>(() => areDifferent(resettedFilters, filters), [filters]);

    const hasFilters = React.useMemo<boolean>(() => !!(hasAdvancedFilters || filters[FiltersKey.Name]), [
        filters,
        hasAdvancedFilters,
    ]);

    const hasChanged = React.useMemo<boolean>(() => areDifferent(filters, defaultFilters), [filters, defaultFilters]);

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsCommercial(event.target.checked);
        setIsSwitch && setIsSwitch(true);
        hideNonCommercialItems && hideNonCommercialItems(event.target.checked);
    };

    useKeyPress('Enter', () => !isLoading && hasChanged && onChange(filters));
    return (
        <SearchContainer showClearButton={hasFilters} onClearAll={clearAll}>
            <Box>
                <Box display="flex">
                    <MultipleSelectInput
                        label={t(TK.country)}
                        placeholder={t(TK.all)}
                        options={countries}
                        limitTags={2}
                        isCustomFilter={true}
                        style={{ width: '75%' }}
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
                        renderOption={(option: Country, { selected }): React.ReactNode => (
                            <React.Fragment>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                <CountryFlag
                                    countryCode={option.alpha2Code}
                                    showCode={false}
                                    country={`${option.name} (${option.alpha2Code})`}
                                />
                            </React.Fragment>
                        )}
                    />
                    <TextInput
                        placeholder={t(TK.freeTextSearchDescription)}
                        value={filters[FiltersKey.Free] as string}
                        fullWidth={true}
                        formStyle={{ width: '275%', marginLeft: '12px' }}
                        onChange={(v): void => updateFilters(FiltersKey.Free, v)}
                        endAdorment={
                            <InputAdornment position="end">
                                <Link
                                    href="#"
                                    onClick={(
                                        e:
                                            | React.MouseEvent<HTMLAnchorElement, MouseEvent>
                                            | React.MouseEvent<HTMLSpanElement, MouseEvent>,
                                    ) => {
                                        e.preventDefault();
                                        setShowAdvancedFilters(!showAdvancedFilters);
                                    }}
                                >
                                    Advanced search
                                </Link>
                                {isLoading ? (
                                    <Spinner size="sm" style={{ marginLeft: '5px' }} />
                                ) : (
                                    <IconButton
                                        onClick={onSearchClick}
                                        className={classes.searchIconButton}
                                        style={{ outline: 'none' }}
                                        aria-label="free text filter info"
                                        edge="end"
                                    >
                                        <PageviewIcon color="primary" className={classes.searchIconLarge} />
                                    </IconButton>
                                )}
                            </InputAdornment>
                        }
                    />

                    <Button
                        size="small"
                        style={{ marginLeft: '10px', outline: 'none' }}
                        color="secondary"
                        variant="outlined"
                        onClick={clearAll}
                    >
                        {t(TK.clearFilters)}
                    </Button>
                </Box>
                <Box display="flex" justifyContent="end">
                    <Box mr={9} display="flex" alignItems="center">
                        <Typography>Hide not commercialised</Typography>
                        <Switch
                            color="primary"
                            checked={isCommercial}
                            onChange={handleSwitchChange}
                            name="notCommercial"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                            disabled={isSwitch}
                        />
                    </Box>
                </Box>
                <Box display="flex" justifyContent="center">
                    {window.location.search && <SearchTags filters={filters} updateFilters={updateFiltersAndSearch} />}
                </Box>
            </Box>

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

            <AGAdvancedSearchContainer isOpen={showAdvancedFilters} showChangeNotification={hasAdvancedFilters}>
                <ExpandableContainer container spacing={2}>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.activeSubstances)}
                            placeholder={t(TK.all)}
                            options={activeSubstances}
                            values={getAsArray(filters[FiltersKey.ActiveSubstances])}
                            onChange={(v): void => updateFilters(FiltersKey.ActiveSubstances, v)}
                            allowAdd
                            texts={{ addNew: '' }}
                            renderOption={(option: string, { selected }): React.ReactNode => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option}
                                </React.Fragment>
                            )}
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
                            renderOption={(option: string, { selected }): React.ReactNode => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option}
                                </React.Fragment>
                            )}
                        />
                    </Grid>

                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.atc)}
                            placeholder={t(TK.all)}
                            options={atcs}
                            values={getAsArray(filters[FiltersKey.Atc])}
                            onChange={(v): void => updateFilters(FiltersKey.Atc, v)}
                            renderOption={(option: string, { selected }): React.ReactNode => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option}
                                </React.Fragment>
                            )}
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
                            renderOption={(option: string, { selected }): React.ReactNode => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option}
                                </React.Fragment>
                            )}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <MultipleSelectInput
                            label={t(TK.additionalInformation)}
                            placeholder={t(TK.all)}
                            options={additionalInformation}
                            values={getAsArray(filters[FiltersKey.AdditionalInformation])}
                            onChange={(v): void => updateFilters(FiltersKey.AdditionalInformation, v)}
                            renderOption={(option: string, { selected }): React.ReactNode => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option}
                                </React.Fragment>
                            )}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <TextInput
                            label={t(TK.productCodeOrMANumber)}
                            fullWidth
                            placeholder={t(TK.all)}
                            value={filters[FiltersKey.ProductCode] as string}
                            onChange={(v): void => updateFilters(FiltersKey.ProductCode, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <TextInput
                            label={t(TK.manufacturerOrMAHolder)}
                            placeholder={t(TK.all)}
                            fullWidth
                            value={filters[FiltersKey.Holder] as string}
                            onChange={(v): void => updateFilters(FiltersKey.Holder, v)}
                        />
                    </Grid>
                    <Grid item {...gridItemColumnsProps}></Grid>
                    <Grid item {...gridItemColumnsProps}></Grid>
                    <Grid item {...gridItemColumnsProps}></Grid>
                    <Grid item {...gridItemColumnsProps}>
                        <ButtonWrapper align="center">
                            <RbButton
                                disabled={!Object.keys(filters).length || !hasChanged || isLoading}
                                variant="contained"
                                size="large"
                                color="primary"
                                width="10"
                                onClick={onSearchClick}
                            >
                                {t(TK.search)}
                                {isLoading && <Spinner size="sm" />}
                            </RbButton>
                            <RbButton
                                size="small"
                                color="secondary"
                                variant="outlined"
                                width="5"
                                style={{ marginLeft: '10px', outline: 'none' }}
                                onClick={clearAll}
                            >
                                {t(TK.clearFilters)}
                            </RbButton>
                            <RbButton
                                size="small"
                                variant="outlined"
                                width="5"
                                style={{ marginLeft: '10px', color: 'white', background: 'black' }}
                                onClick={hideFilters}
                            >
                                {t(TK.close)}
                            </RbButton>
                        </ButtonWrapper>
                    </Grid>
                    <Grid item {...gridItemColumnsProps}></Grid>
                </ExpandableContainer>
            </AGAdvancedSearchContainer>
        </SearchContainer>
    );
};

export default ProductsFilters;
