import * as React from 'react';
import { Box, Grid, Select, Typography } from '@material-ui/core';
import TextInput from '../../../components/inputs/TextInput';
import { useTranslations } from '../../../store/Translations/hooks';
import { RFQQuote } from '../../../models/RFQQuote';
import { TK } from '../../../store/Translations/translationKeys';
//import UploadeIcon from "@material-ui/icons/AttachFile";

function onchange(e: any) {
    let files = e.target.files;

    let reader = new FileReader();

    reader.onload = (e) => {
        console.log('Data file', e.target?.result);
    };

    reader.readAsDataURL(files[0]);
}

const SupplierInfoForm: React.FC<{
    value: RFQQuote;
    fieldsWithError?: string[];
    readOnly?: boolean;
    setValue: (value: RFQQuote) => void;
}> = ({ value, fieldsWithError = [], readOnly, setValue }) => {
    const t = useTranslations();

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h5">{t(TK.yourQuote)}</Typography>
            </Grid>
            {/*      <Grid item xs={6}
                    container
                    direction="column-reverse"
                    justify="flex-end"
                    alignItems="flex-end">
                    <label htmlFor="contained-buttion-file">
                        <IconButton
                            color="primary" aria-label="upload picture" component="span">
                            <UploadeIcon />
                        </IconButton>
                    </label>
                </Grid>
                           <Grid item xs={12}>
                    <input
                        style={{ display: 'none' }}
                        accept="application/pdf"
                        id="contained-buttion-file"
                        multiple
                        value={value.attachment}
                        onChange={(e) => onchange(e)}
                        type="file"
                    />
        </Grid>*/}
            <Grid item xs={12}>
                <Box display="flex">
                    <TextInput
                        style={{ backgroundColor: '#f2f2f2', width: '150px' }}
                        type="currency"
                        readOnly={readOnly}
                        label={t(TK.netPriceEuro) + '*'}
                        error={fieldsWithError.includes(TK.netPriceEuro)}
                        value={value.exwNetPriceEuro}
                        onChange={(exwNetPriceEuro) => setValue({ ...value, exwNetPriceEuro })}
                    />
                    <Select
                        native
                        value={value.currency}
                        style={{ backgroundColor: '#f2f2f2', height: '39px', marginLeft: '10px', marginRight: '10px' }}
                        variant="outlined"
                        onChange={(evt) => setValue({ ...value, currency: evt.target.value as string })}
                        name="currency"
                        disabled={readOnly}
                    >
                        <option value="EUR">EURO</option>
                        <option value="USD">USD</option>
                        <option value="CAD">CAD</option>
                    </Select>
                    <TextInput
                        style={{ backgroundColor: '#f2f2f2', width: '150px' }}
                        type="text"
                        readOnly={readOnly}
                        label={t(TK.availabilityPacks) + '*'}
                        error={fieldsWithError.includes(TK.availabilityPacks)}
                        value={value.availabilityPacks?.toString()}
                        onChange={(availabilityPacks) =>
                            setValue({ ...value, availabilityPacks: parseFloat(availabilityPacks).toString() })
                        }
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex">
                    <TextInput
                        style={{ backgroundColor: '#f2f2f2', width: '150px' }}
                        type="month"
                        readOnly={readOnly}
                        label={t(TK.expiryDate)}
                        error={fieldsWithError.includes(TK.expiryDate)}
                        value={value.expDate}
                        onChange={(expDate) => setValue({ ...value, expDate })}
                    />
                    <TextInput
                        style={{ backgroundColor: '#f2f2f2', width: '149px', marginLeft: '108px' }}
                        type="number"
                        endAdorment={t(TK.days)}
                        readOnly={readOnly}
                        label={t(TK.leadTimeToDeliver) + '*'}
                        error={fieldsWithError.includes(TK.leadTimeToDeliver)}
                        value={value.leadTimeToDeliver}
                        onChange={(leadTimeToDeliver) => setValue({ ...value, leadTimeToDeliver })}
                    />
                </Box>
            </Grid>

            <Grid item xs={12}>
                <TextInput
                    style={{ backgroundColor: '#f2f2f2', width: '100%' }}
                    multiline
                    readOnly={readOnly}
                    label={t(TK.comments)}
                    error={fieldsWithError.includes(TK.comments)}
                    value={value.comments}
                    onChange={(comments) => setValue({ ...value, comments })}
                />
            </Grid>
        </Grid>
    );
};

export default SupplierInfoForm;
