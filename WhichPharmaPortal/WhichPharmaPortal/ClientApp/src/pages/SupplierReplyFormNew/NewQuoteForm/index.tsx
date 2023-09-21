import { Button, Grid, Link } from '@material-ui/core';
import * as React from 'react';
import Panel from '../../../components/Panel';
import { RFQQuote } from '../../../models/RFQQuote';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import { OurInfoWithAutoComplete } from '../OurInfoForm';
import { CheckboxParagraph, MyCheckbox } from '../EditQuoteForm/styled';
import SupplierInfoForm from '../SupplierInfoForm';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import TermsAndConditionsDialog from '../TermsAndConditionsDialog';

const NewQuoteForm: React.FC<{
    defaultValue: RFQQuote,
    responsible?: string,
    receiveEmail: boolean,
    loading?: boolean,
    token: string,
    onChangeReceiveEmail: (value: boolean) => void,
    onAdd: (value: RFQQuote) => void,
    onCancel: () => void,
}> = ({
    defaultValue,
    receiveEmail,
    loading,
    token,
    onChangeReceiveEmail,
    onAdd,
    onCancel,
}) => {
        const t = useTranslations();
        const [value, setValue] = React.useState<RFQQuote>({ ...defaultValue, state: RFQQuoteState.Alternative });
        const [acceptTerms, setAcceptTerms] = React.useState(false);
        const [errors, setErrors] = React.useState<string[]>([]);
        const [termsAndConditionsOpen, setTermsAndConditionsOpen] = React.useState(false);

        const handleSubmitOffer = React.useCallback(() => {
            var errors = [
                value.name?.length ? '' : TK.name,
                value.activeSubstances?.length ? '' : TK.activeSubstances,
                value.productCode?.length ? '' : TK.productCode,
                value.countryOfOrigin?.length ? '' : TK.countryOfOrigin,
                value.maHolder?.length ? '' : TK.maHolder,
                value.packSize?.length ? '' : TK.packSize,
                value.exwNetPriceEuro?.length ? '' : TK.netPriceEuro,
                value.availabilityPacks ? '' : TK.availabilityPacks,
                value.leadTimeToDeliver?.length ? '' : TK.leadTimeToDeliver,
            ].filter(v => v.length);

            if (errors.length) {
                setErrors(errors);
            }
            else {
                onChangeReceiveEmail(true);
                onAdd(value);
            }
        }, [value, setErrors, onAdd, onChangeReceiveEmail]);

        const handleValueChanged = React.useCallback((value: RFQQuote) => {
            setValue(value);
            setErrors([]);
        }, [setValue, setErrors]);

        return (
            <Panel title={t(TK.offerAlternative)}>
                <OurInfoWithAutoComplete hideTitle token={token} value={value} setValue={handleValueChanged} fieldsWithError={errors} style={{ marginBottom: '20px' }} />
                <SupplierInfoForm value={value} setValue={handleValueChanged} fieldsWithError={errors} />
                <hr />
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CheckboxParagraph>
                            <MyCheckbox checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
                            {t(TK.accept)} <Link onClick={() => setTermsAndConditionsOpen(true)}>{t(TK.termsAndConditions)}</Link>
                        </CheckboxParagraph>

                    </Grid>
                    <Grid item xs={6}>
                        <Button disabled={loading} fullWidth variant="outlined" size="large" color="secondary" onClick={onCancel}>
                            {t(TK.cancel)}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button disabled={loading || !acceptTerms} fullWidth variant="contained" size="large" color="primary" onClick={handleSubmitOffer}>
                            {t(TK.submitOffer)}
                        </Button>
                    </Grid>
                </Grid>
                <TermsAndConditionsDialog open={termsAndConditionsOpen} onClose={() => setTermsAndConditionsOpen(false)} />
            </Panel>
        );
    }

export default NewQuoteForm;