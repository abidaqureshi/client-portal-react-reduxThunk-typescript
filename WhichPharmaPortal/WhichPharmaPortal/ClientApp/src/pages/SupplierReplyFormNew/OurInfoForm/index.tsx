import * as React from 'react';
import { Grid, Typography } from '@material-ui/core';
import TextInput from '../../../components/inputs/TextInput';
import { useTranslations } from '../../../store/Translations/hooks';
import { RFQQuote } from '../../../models/RFQQuote';
import { TK } from '../../../store/Translations/translationKeys';
import SingleSelectInput from '../../../components/inputs/SingleSelectInput';
import { ProductV2 } from '../../../models/ProductV2';
import CountryFlag from '../../../components/CountryFlag';
import { getExternalSupplierProductsSearchAsync } from '../../../fetch/requests';
import useDebounce from '../../../utils/debounceHook';

export interface OutInfoFormProps {
    value: RFQQuote;
    style?: React.CSSProperties;
    readOnly?: boolean;
    hideTitle?: boolean;
    fieldsWithError?: string[];
    autocompleteOptions?: ProductV2[];
    autocompleteOptionsLoading?: boolean;
    onUpdateAutocompleteOptions?: (name: string) => void;
    onAutocomlpeteOptionClick?: (product: ProductV2) => void;
    setValue: (value: RFQQuote) => void;
}

const OurInfoForm: React.FC<OutInfoFormProps> = ({
    value,
    style,
    readOnly,
    hideTitle,
    fieldsWithError: errors = [],
    autocompleteOptions,
    autocompleteOptionsLoading,
    onUpdateAutocompleteOptions,
    onAutocomlpeteOptionClick,
    setValue,
}) => {
    const t = useTranslations();
    const numOfPacks = Math.ceil(
        value.unitQuant && value.packSize ? parseInt(value.unitQuant) / parseInt(value.packSize) : 0,
    );

    return (
        <Grid container spacing={2} style={style}>
            {!hideTitle && (
                <Grid item xs={12}>
                    <Typography variant="h5">{t(TK.whatWeNeed)}</Typography>
                </Grid>
            )}
            <Grid item xs={12}>
                <SingleSelectInput
                    readOnly={readOnly}
                    label={t(TK.name) + (readOnly ? '' : '*')}
                    value={{ name: value.name }}
                    error={errors.includes(TK.name) ? t(TK.mandatoryFields) : undefined}
                    options={autocompleteOptions || []}
                    isLoading={autocompleteOptionsLoading}
                    getOptionLabel={(p: ProductV2) => p.name}
                    renderOption={(p: ProductV2) => (
                        <div onClick={() => onAutocomlpeteOptionClick && onAutocomlpeteOptionClick(p)}>
                            <CountryFlag country={p.countryName} countryCode={p.countryCode} />
                            <b>
                                {p.name} ({p.atc || ''})
                            </b>{' '}
                            - {p.package || ''} - {p.pharmaceuticalForm || ''} - {p.productCode || ''}-{' '}
                            {p.maHolder || ''}
                        </div>
                    )}
                    freeSolo
                    onChange={(name) => {
                        setValue({ ...value, name });
                        onUpdateAutocompleteOptions && onUpdateAutocompleteOptions(name);
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextInput
                    style={{ width: '100%' }}
                    readOnly={readOnly}
                    label={t(TK.description) + (readOnly ? '' : '*')}
                    value={value.activeSubstances}
                    error={errors.includes(TK.activeSubstances)}
                    onChange={(activeSubstances) => setValue({ ...value, activeSubstances })}
                />
            </Grid>
            <Grid item xs={12}>
                <TextInput
                    style={{ width: '100%' }}
                    readOnly={readOnly}
                    label={t(TK.maHolder) + (readOnly ? '' : '*')}
                    value={value.maHolder}
                    error={errors.includes(TK.maHolder)}
                    onChange={(maHolder) => setValue({ ...value, maHolder })}
                />
            </Grid>
            <Grid item xs={12} container direction="row">
                <TextInput
                    style={{ width: '100%', marginRight: '5px' }}
                    readOnly={readOnly}
                    label={t(TK.productCode) + (readOnly ? '' : '*')}
                    value={value.productCode}
                    error={errors.includes(TK.productCode)}
                    onChange={(productCode) => setValue({ ...value, productCode })}
                />
                <TextInput
                    style={{ width: '95%', marginLeft: '5px', marginRight: '57px' }}
                    readOnly={readOnly}
                    label={t(TK.packSize) + (readOnly ? '' : '*')}
                    value={value.packSize}
                    error={errors.includes(TK.packSize)}
                    onChange={(packSize) => setValue({ ...value, packSize })}
                />
                {value.unitQuant && (
                    <TextInput
                        style={{ width: '114%' }}
                        readOnly={readOnly}
                        label={t(TK.requestedPacks)}
                        value={numOfPacks.toString() + ' ( ' + value.unitQuant + ' units )'}
                    />
                )}
            </Grid>
            <Grid item xs={12}>
                <TextInput
                    style={{ width: '100%' }}
                    readOnly={readOnly}
                    label={t(TK.countryOfOrigin) + (readOnly ? '' : '*')}
                    value={value.countryOfOrigin}
                    error={errors.includes(TK.countryOfOrigin)}
                    onChange={(countryOfOrigin) => setValue({ ...value, countryOfOrigin })}
                />
            </Grid>

            {/* {value.unitQuant && (
                <Grid item xs={6}>
                    <TextInput
                        readOnly={readOnly}
                        label={t(TK.quantityRequested)}
                        value={value.unitQuant}
                        style={{ width: '180px' }}
                        error={errors.includes(TK.quantity)}
                        onChange={(unitQuant) => setValue({ ...value, unitQuant })}
                    />
                </Grid>
            )} */}
        </Grid>
    );
};

export const OurInfoWithAutoComplete: React.FC<OutInfoFormProps & { token: string }> = (props) => {
    const { value, setValue, token } = props;

    const [options, setOptions] = React.useState<ProductV2[]>([]);
    const [loading, setLoading] = React.useState<boolean>();
    const [searchTerm, setSearchTerm] = React.useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    React.useEffect(() => {
        if ((debouncedSearchTerm?.length || 0) < 3) {
            if (options?.length) {
                setOptions([]);
                setLoading(false);
            }
            return;
        }

        setLoading(true);

        getExternalSupplierProductsSearchAsync(debouncedSearchTerm, token).then((res) => {
            setOptions(res);
            setLoading(false);
        });
        // eslint-disable-next-line
    }, [debouncedSearchTerm]);

    const handleAutocompleteClick = React.useCallback(
        (p: ProductV2) => {
            setValue({
                ...value,
                id: p.id,
                name: p.name,
                activeSubstances: p.activeSubstances.join(', '),
                productCode: p.productCode,
                countryOfOrigin: p.countryName,
                maHolder: p.maHolder,
                packSize: p.package,
            });
        },
        [setValue, value],
    );

    return (
        <OurInfoForm
            {...props}
            autocompleteOptions={options}
            autocompleteOptionsLoading={loading}
            onUpdateAutocompleteOptions={setSearchTerm}
            onAutocomlpeteOptionClick={handleAutocompleteClick}
        />
    );
};

export default OurInfoForm;
