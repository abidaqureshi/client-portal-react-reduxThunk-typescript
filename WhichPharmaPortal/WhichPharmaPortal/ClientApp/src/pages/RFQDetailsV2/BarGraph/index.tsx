import React from 'react';
import { createStyles, withStyles, Theme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { RFQQuoteV2 } from '../../../models/RFQQuote';
import { Box } from '@material-ui/core';

export interface IitemProps {
    item: RFQQuoteV2;
}
const BorderLinearProgress = withStyles((theme: Theme) =>
    createStyles({
        root: {
            height: 20,
            borderRadius: 3,
        },
        colorPrimary: {
            backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
        },
        bar: {
            borderRadius: 3,
            border: '1px solid #dddddd',
            backgroundColor: '#00c4aa',
        },
    }),
)(LinearProgress);

export const BarGraph: React.FC<IitemProps> = ({ item }) => {
    const { availabilityPacks, unitQuant } = item.data;

    let requiredQuantity = 0;
    if (unitQuant) {
        requiredQuantity = parseInt(unitQuant);
    }

    let percentage = 0;
    if (requiredQuantity && availabilityPacks) {
        percentage = availabilityPacks / requiredQuantity;
        if (percentage > 1) {
            percentage = 1;
        }
    }
    //let percentage = unitQuant ? parseInt(availabilityPacks) / parseInt(unitQuant) : 0;
    percentage = Math.round(percentage * 100);
    return (
        <Box position="relative" marginTop={1}>
            <Box position="absolute" top={-10} left={40} zIndex={10} fontWeight={500} fontSize={12}>
                {percentage}%
            </Box>
            <BorderLinearProgress variant="determinate" value={percentage} />
        </Box>
    );
};
