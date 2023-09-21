import * as React from 'react';
import { Box, Chip, Grid, Typography } from '@material-ui/core';
import TextInput from '../../../components/inputs/TextInput';
import { useTranslations } from '../../../store/Translations/hooks';
import { RFQQuote } from '../../../models/RFQQuote';
import { TK } from '../../../store/Translations/translationKeys';
import SingleSelectInput from '../../../components/inputs/SingleSelectInput';
import { ProductV2 } from '../../../models/ProductV2';
import CountryFlag from '../../../components/CountryFlag';
import { getExternalSupplierProductsSearchAsync } from '../../../fetch/requests';
import useDebounce from '../../../utils/debounceHook';
import { ValueLabels } from './styled';

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

const OurInfo: React.FC<OutInfoFormProps> = ({
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
                <Grid item xs={12} style={{ marginTop: '-30px' }}>
                    <Typography variant="h6">{t(TK.whatWeNeed)}</Typography>
                </Grid>
            )}
            <Grid item xs={12} style={{ marginTop: '-20px' }}>
                <Box display="flex" alignItems="baseline">
                    <Typography variant="h4">{value.name}</Typography>
                    <ValueLabels>
                        <Typography>(Product Name)</Typography>
                    </ValueLabels>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" alignItems="baseline">
                    <Typography variant="h5">{value.activeSubstances}</Typography>
                    <ValueLabels>
                        <Typography>(Active substances)</Typography>
                    </ValueLabels>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" alignItems="baseline">
                    <Typography variant="h5">{value.maHolder ? value.maHolder : 'N/A'}</Typography>
                    <ValueLabels>
                        <Typography>(MA holder)</Typography>
                    </ValueLabels>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex">
                    <Chip size="medium" label={value.productCode} color="primary" />
                    <Box marginLeft={3} display="flex">
                        <Chip size="medium" label={parseInt(value.packSize || '0') + ' pack size'} color="primary" />
                        <Box marginLeft={1} marginRight={1}>
                            x
                        </Box>
                        <Chip size="medium" label={numOfPacks + ' packs'} color="primary" />
                    </Box>
                </Box>
            </Grid>
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
        <OurInfo
            {...props}
            autocompleteOptions={options}
            autocompleteOptionsLoading={loading}
            onUpdateAutocompleteOptions={setSearchTerm}
            onAutocomlpeteOptionClick={handleAutocompleteClick}
        />
    );
};

export default OurInfo;
