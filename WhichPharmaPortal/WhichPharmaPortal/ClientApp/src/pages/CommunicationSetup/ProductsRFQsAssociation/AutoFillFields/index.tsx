import * as React from 'react';
import SingleSelectInput from '../../../../components/inputs/SingleSelectInput';
import { Grid, IconButton, Tooltip } from '@material-ui/core';
import { useTranslations } from '../../../../store/Translations/hooks';
import { TK } from '../../../../store/Translations/translationKeys';
import TextInput from '../../../../components/inputs/TextInput';
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import AddIcon from '@material-ui/icons/AddCircle';
import PlayForWorkIcon from '@material-ui/icons/PlayForWork';
import { productFields } from '../../ProductsEmailTables/ProductsFieldsSelection';

interface AutoFillFieldsProps {
    onAutoFillField: (fieldName: string, value: string) => void,
}

const autoFillOptions = [
    TK.unitQuant,
    ...productFields,
];

const AutoFillFields: React.FC<AutoFillFieldsProps> = ({
    onAutoFillField,
}) => {
    const t = useTranslations();

    const [autoFillFields, setAutoFillFields] = React.useState<{key: string, value: string}[]>([]);

    const addField = React.useCallback(() => setAutoFillFields(prev => [...prev, {key:'', value: ''}]), [setAutoFillFields]);
    const removeField = React.useCallback((index: number) => () => setAutoFillFields(prev => prev.filter((_, i) => i !== index)), [setAutoFillFields]);
    const updateFieldKey = React.useCallback((index: number) => (key: string) => setAutoFillFields(prev => prev.map((v, i) => i !== index ? v : {...v, key})), [setAutoFillFields]);
    const updateFieldValue = React.useCallback((index: number) => (value: string) => setAutoFillFields(prev => prev.map((v, i) => i !== index ? v : {...v, value})), [setAutoFillFields]);
    const handleFillTables = React.useCallback(() => autoFillFields.filter(f => f.key).forEach(f => onAutoFillField(f.key, f.value)), [autoFillFields, onAutoFillField]);

    return (
        <>
            <Tooltip title={t(TK.addFieldsToBeAutomaticallyFilledInProductsTables)}>
                <IconButton 
                    style={{position: 'absolute'}} 
                    onClick={addField}
                >
                    <AddIcon/>
                </IconButton>
            </Tooltip>
            <Grid container style={{position: 'relative'}}>
                {autoFillFields.map((field, index) => 
                    <>
                        <Grid item xs={6}>
                            <SingleSelectInput 
                                value={field.key}
                                options={autoFillOptions}
                                isLoading={!autoFillOptions?.length}
                                onChange={updateFieldKey(index)}
                                getOptionLabel={v => t(v as TK)}
                            />
                        </Grid>
                        <Grid item xs={6} style={{position: 'relative'}}>
                            <TextInput 
                                value={field.value}
                                onChange={updateFieldValue(index)} 
                            />
                            <IconButton style={{position: 'absolute', top: 0, right: 0, bottom: 0}} onClick={removeField(index)}><RemoveIcon/></IconButton>
                        </Grid>
                    </>
                )}
                { !!autoFillFields.length && 
                    <Tooltip title={t(TK.fillProductTables)}>
                        <IconButton 
                            style={{position: 'absolute', top: 0, right: -48, bottom: 0}} 
                            onClick={handleFillTables}
                        >
                            <PlayForWorkIcon/>
                        </IconButton>
                    </Tooltip>
                }
            </Grid>
        </>
    );
}

export default AutoFillFields;