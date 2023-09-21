import React, { useCallback, useState } from 'react';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
    Button,
    Box,
    Chip,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Tooltip,
    makeStyles,
    Popover,
    Theme,
    Typography,
} from '@material-ui/core';
import { ProductV2 } from '../../models/ProductV2';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { AvailabilityColors, AvailabilityTerms, AvailabilityColorsFront } from '../../constants/general';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import LinkIcon from '@material-ui/icons/Link';

import ReactCountryFlag from 'react-country-flag';
import { CloseIconWrapper, DialogTitleContainer } from '../../pages/ProductsListV3/styled';
import ProductContent from '../ProductContent';
import { AdditionalInformation } from '../ProductContent/AdditionalInfo';
import { DateTimeFormat } from '../AGTable/DataTypeFormater';
import { ShortageDetail } from '../ProductContent/ShortageDetail';

interface IProductDialogProps {
    productOpen: ProductV2 | null;
    handleDialogClose: () => void;
    handleSelectProductOpen: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        typography: {
            padding: theme.spacing(2),
        },
        lastUpdate: {
            flex: 1,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'flex-end',
            marginRight: '30px',
            fontSize: '0.8rem',
        },
    }),
);

export const ProductDetailDialog: React.FC<IProductDialogProps> = ({
    productOpen,
    handleSelectProductOpen,
    handleDialogClose,
}) => {
    const t = useTranslations();
    const classes = useStyles();

    const [popOverOpen, setPopOverOpen] = useState<Boolean>(false);

    const copyLinkToShare = useCallback(() => {
        setPopOverOpen(true);
        setTimeout(() => {
            setPopOverOpen(false);
        }, 1000);
    }, [setPopOverOpen]);

    const getType = (): string => {
        let Type:
            | 'ShortageFuture'
            | 'Shortage3M'
            | 'Shortage3to6M'
            | 'Shortage6M'
            | 'NotAuthorised'
            | 'NotMarketed'
            | 'Marketed'
            | 'Unknown';

        Type = 'Marketed';
        if (productOpen?.isMarketed && productOpen.isAuthorised) {
            Type = 'Marketed';
        } else if (
            (productOpen?.isAuthorised && productOpen?.isMarketed === undefined) ||
            (productOpen?.isAuthorised === undefined && productOpen?.isMarketed === undefined)
        ) {
            Type = 'Unknown';
        } else if (productOpen?.isMarketed === false) {
            Type = 'NotMarketed';
        }

        if (productOpen?.shortageInfo) {
            Type = 'Shortage3M';
            let startDate = moment(productOpen?.shortageInfo?.start).toDate().getTime();
            let current = new Date().getTime();
            let interval = current - startDate;
            let months = moment(interval).toDate().getMonth();
            let year = moment(interval).toDate().getFullYear();

            if (months > 2) {
                Type = 'Shortage3to6M';
            }
            if (year > 1970) {
                Type = 'Shortage6M';
            }
            if (months > 5) {
                Type = 'Shortage6M';
            }

            if (startDate > current) {
                Type = 'ShortageFuture';
            }
        }

        return Type;
    };

    return (
        <Dialog open={!!productOpen} onClose={handleDialogClose} maxWidth="lg">
            <DialogTitle style={{ padding: 0 }}>
                <DialogTitleContainer>
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <ReactCountryFlag
                                style={{ height: 20, width: 20 }}
                                svg
                                countryCode={productOpen?.countryCode || ''}
                            />
                            <Typography style={{ marginLeft: '5px' }} variant="h5">
                                {productOpen?.originalName || productOpen?.name}
                            </Typography>
                            <Tooltip title={productOpen ? <ShortageDetail product={productOpen} /> : ''}>
                                <Chip
                                    style={{
                                        fontWeight: 'bold',
                                        marginLeft: '10px',
                                        backgroundColor: `${AvailabilityColors[getType()]}`,
                                        color: `${AvailabilityColorsFront[getType()]}`,
                                    }}
                                    label={AvailabilityTerms[getType()]}
                                />
                            </Tooltip>
                        </div>
                        <div style={{ width: '100%' }}>
                            {productOpen && <AdditionalInformation product={productOpen} />}
                        </div>
                    </div>
                    <CloseIconWrapper>
                        <IconButton onClick={handleDialogClose} style={{ outline: 'none' }}>
                            <HighlightOffIcon color="primary" fontSize="large" />
                        </IconButton>
                    </CloseIconWrapper>
                </DialogTitleContainer>

                <hr style={{ margin: 0 }} />
            </DialogTitle>
            <DialogContent style={{ width: '100%' }}>
                <ProductContent product={productOpen as ProductV2}> </ProductContent>
            </DialogContent>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}></div>
                <DialogActions style={{ justifyContent: 'center', padding: '20px' }}>
                    <Button onClick={handleSelectProductOpen} color="primary" variant="contained">
                        {t(TK.createRequestForQuote)}
                    </Button>
                    <CopyToClipboard text={window?.location.href} onCopy={copyLinkToShare}>
                        <Button color="secondary" variant="outlined">
                            <LinkIcon color="primary" fontSize="small" style={{ marginRight: '5px' }} />
                            {t(TK.shareLink)}
                        </Button>
                    </CopyToClipboard>
                    <Button onClick={handleDialogClose} color="secondary" variant="outlined">
                        {t(TK.close)}
                    </Button>

                    <Popover
                        id="simple-popover"
                        open={Boolean(popOverOpen)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <Typography className={classes.typography}>Link copied!</Typography>
                    </Popover>
                </DialogActions>
                <Box className={classes.lastUpdate} fontStyle="italic">
                    Last updated: {moment(productOpen?.lastUpdate).format(DateTimeFormat)}
                </Box>
            </div>
        </Dialog>
    );
};
