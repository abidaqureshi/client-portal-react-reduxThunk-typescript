import * as React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { Box, Tooltip, Typography } from '@material-ui/core';
import { CountryFlagWithNameSpan } from './styled';

const CountryFlag: React.FC<{ country: string; countryCode: string; hideName?: boolean; showCode?: boolean }> = ({
    country,
    countryCode,
    showCode,
    hideName,
}) => {
    return hideName ? (
        <Tooltip title={country}>
            <ReactCountryFlag svg countryCode={countryCode} style={{ margin: 0, width: 30 }} />
        </Tooltip>
    ) : (
        <CountryFlagWithNameSpan>
            <ReactCountryFlag svg countryCode={countryCode} style={{ margin: 0 }} />
            <Box style={{ marginLeft: '5px' }}>{showCode ? countryCode : country}</Box>
        </CountryFlagWithNameSpan>
    );
};

export default CountryFlag;
