import * as React from 'react';
import { TK } from '../../../store/Translations/translationKeys';
import { useTranslations } from '../../../store/Translations/hooks';
import Panel from '../../../components/Panel';
import MultipleSelectInput from '../../../components/inputs/MultipleSelectInput';

const quoteReplyFormFields = ['price', 'expirationDate', 'quantity', 'availableAt', 'lotNumber', 'notes'];

const QuoteReplyFormSetup: React.FC = () => {
    const t = useTranslations();

    const [mandatoryFormFields, setMandatoryFormFields] = React.useState(['price']);
    const [optionalFormFields, setOptionalFormFields] = React.useState([
        'expirationDate',
        'quantity',
        'availableAt',
        'notes',
    ]);
    const [customFormFields, setCustomFormFields] = React.useState<string[]>([]);

    const handleMandatoryFieldsChange = (values: string[]) => {
        setMandatoryFormFields(values);
        const newOptionalFields = optionalFormFields.filter((o) => !values.includes(o));
        if (newOptionalFields?.length !== optionalFormFields.length) {
            setOptionalFormFields(newOptionalFields);
        }
    };

    const handleOptionalFieldsChange = (values: string[]) => {
        setOptionalFormFields(values);
        const newMandatoryFields = mandatoryFormFields.filter((o) => !values.includes(o));
        if (newMandatoryFields?.length !== mandatoryFormFields.length) {
            setMandatoryFormFields(newMandatoryFields);
        }
    };

    return (
        <Panel title={t(TK.quoteReplyForm)} subtitle={t(TK.configureQuoteReplyForm)}>
            <MultipleSelectInput
                label={t(TK.mandatoryFields)}
                values={mandatoryFormFields}
                onChange={handleMandatoryFieldsChange}
                allowAdd
                onAdd={(value) => setCustomFormFields([...customFormFields, value])}
                options={quoteReplyFormFields.concat(customFormFields)}
                getOptionLabel={(v) => t(v as TK)}
                renderOption={(v) => t(v as TK)}
            />
            <MultipleSelectInput
                label={t(TK.optionalFields)}
                values={optionalFormFields}
                allowAdd
                onAdd={(value) => setCustomFormFields([...customFormFields, value])}
                onChange={handleOptionalFieldsChange}
                options={quoteReplyFormFields.concat(customFormFields)}
                getOptionLabel={(v) => t(v as TK)}
                renderOption={(v) => t(v as TK)}
            />
        </Panel>
    );
};

export default QuoteReplyFormSetup;
