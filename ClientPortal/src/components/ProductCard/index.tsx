import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import GradeIcon from '@material-ui/icons/Grade';
import Typography from '@material-ui/core/Typography';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { useProductCardStyles } from './styled';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { RFQQuoteTableItem } from '../../pages/RFQDetailsV2';
import CountryFlag from '../CountryFlag';
import { parseEuDecimalToDecimal, parseNumber } from '../../utils/utils';
import { TextField } from '@material-ui/core';
import { AdditionalCost } from '../../pages/RFQDetailsV2/AdditionalCost';
import { RFQQuoteChip } from '../RFQQuoteAvatar';
import { RFQQuoteState } from '../../models/RFQQuoteState';
import { useCountriesSet } from '../../store/SetsV2/hooks';

interface IProductCardProps {
    title: string;
    cardInfo: RFQQuoteTableItem;
    removeCard: (itemId: string, supplierId: string) => void;
    onPackSizeChangeHndle: (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        id: string,
        supplierId: string,
    ) => void;
    getAdditionalCost: (item: { id: string; supplierId: string; additionalCost: number }) => void;
    handleCopyCard: (itemId: string, supplierId: string) => void;
}

export const ProductCard: React.FC<IProductCardProps> = ({
    title,
    cardInfo,
    removeCard,
    onPackSizeChangeHndle,
    handleCopyCard,
    getAdditionalCost,
}) => {
    const {
        availabilityPacks,
        name,
        packSize,
        unitQuant,
        availabilityPacsForCard,
        cardDate,
        exwNetPriceEuro,
        id,
        state,
        supplierId,
        country,
        countryOfOrigin,
        leadTimeToDeliver,
        additionalCost,
        weightedPrice,
        priceCurrencyToEuro,
        isCopy,
    } = cardInfo;

    const countries = useCountriesSet();

    if (countryOfOrigin) {
        const itemCountry = countries.find((item) => item.name == countryOfOrigin);
        country.code = itemCountry?.alpha2Code || country.code;
    }
    const price = state == RFQQuoteState.Quoted ? priceCurrencyToEuro : exwNetPriceEuro;
    const classes = useProductCardStyles();
    const words = title.split(' ');
    return (
        <Card
            key={id + '_' + supplierId}
            className={classes.root}
            variant="outlined"
            draggable="true"
            style={{ display: 'inline-block', background: !isCopy ? '#ffffff' : '#f5f5f5' }}
        >
            <CardContent>
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Box width="100%">
                        <Box marginBottom={2} display="flex" justifyContent="space-between">
                            <RFQQuoteChip state={state} size="medium" />
                            <Box display="flex">
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => {
                                        handleCopyCard(id, supplierId);
                                    }}
                                    color="primary"
                                    style={{ marginTop: '-11px' }}
                                >
                                    <FileCopyIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={() => {
                                        removeCard(id, supplierId);
                                    }}
                                    aria-label="delete"
                                    color="primary"
                                    style={{ marginTop: '-11px' }}
                                >
                                    <DeleteForeverIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                        <Box marginBottom={2}>
                            <Typography>Date: {cardDate}</Typography>
                        </Box>
                        {isCopy && (
                            <Box marginBottom={2}>
                                <Typography>ID: {'Copy-' + id.substring(0, 5)}</Typography>
                            </Box>
                        )}
                        <Box display="flex">
                            <CountryFlag country={`(${country.code})`} countryCode={country.code} hideName={true} />
                            <Typography
                                style={{ margin: '-5px 2px' }}
                                className={classes.title}
                                color="textSecondary"
                                gutterBottom
                            >
                                {words.length > 2 ? words[0] + ' ' + words[1] : title}
                            </Typography>
                            {state === RFQQuoteState.InProgress ? (
                                <GradeIcon fontSize="small" style={{ color: '#000000' }} />
                            ) : (
                                ''
                            )}
                        </Box>
                    </Box>
                </Box>

                <Typography variant="body2" component="div">
                    <Box marginTop={2} marginBottom={2} height={54}>
                        <Typography className={classes.supplierTitle}>
                            {name.length > 60 ? name.substring(0, 55) : name}
                        </Typography>
                    </Box>

                    <Box fontWeight={530}>Pack size: {parseNumber(packSize) || 'NA'}</Box>
                    <Box fontWeight={530}>Requested Qtt: {unitQuant || 'NA'}</Box>
                    <Box fontWeight={530}>Av. Qtt: {availabilityPacsForCard || 'NA'}</Box>
                    <Box fontSize="15px">
                        <Box className={classes.cardBoxItems}>
                            <Box marginTop="10px">Available Qtt: </Box>
                            <Box display="flex">
                                <TextField
                                    type="number"
                                    style={{ width: '60px' }}
                                    value={availabilityPacks || ''}
                                    onChange={(e) => onPackSizeChangeHndle(e, id, supplierId)}
                                    // onKeyDown={(e) => onHandleKeydown(e)}
                                />
                                <Box marginTop="10px">Packs</Box>
                            </Box>
                        </Box>
                        <Box className={classes.cardBoxItems}>
                            <Box>Pack price: </Box>
                            <Box>
                                {parseEuDecimalToDecimal(price as string) || 0} €
                                {` (${((parseNumber(price as string) || 0) / (parseNumber(packSize) || 1)).toFixed(
                                    2,
                                )} €/unit)`}
                            </Box>
                        </Box>
                        <Box className={classes.cardBoxItems} fontWeight={630}>
                            <Box>Lead time</Box>
                            <Box>{leadTimeToDeliver} days</Box>
                        </Box>
                        <Box className={classes.cardBoxItems} fontWeight={630}>
                            <Box>Additional cost: </Box>
                            <Box>{additionalCost || 0} €</Box>
                        </Box>
                        <Box>
                            <AdditionalCost item={cardInfo} getAdditionalCost={getAdditionalCost} />
                        </Box>
                        <Box className={classes.cardBoxItems} fontWeight={630}>
                            <Box>Weighted price: </Box>
                            <Box>
                                {(weightedPrice || 0).toFixed(2)} €
                                {` (${((weightedPrice || 0) / (parseNumber(packSize) || 1)).toFixed(2)} €/unit)`}
                            </Box>
                        </Box>
                    </Box>
                </Typography>
            </CardContent>
            <CardActions>{/* <Button size="small">Remove</Button> */}</CardActions>
        </Card>
    );
};
