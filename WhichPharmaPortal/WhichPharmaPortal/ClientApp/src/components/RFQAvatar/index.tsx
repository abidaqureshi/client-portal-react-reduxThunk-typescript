import { Box } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getRFQSummaries } from '../../store/RFQs/selectors';
import UserAvatar from '../UserAvatar';

export const RFQAvatar: React.FC = () => {
    const location = useLocation();
    const rfqSummaries = useSelector(getRFQSummaries) || {};

    let rfqNr = '';
    if (location.pathname.includes('rfqsV2')) {
        const pathArray = location.pathname.split('/');
        rfqNr = decodeURIComponent(pathArray[pathArray.length - 1]);
    }

    const rfqSummary = React.useMemo(() => rfqSummaries[rfqNr], [rfqSummaries, rfqNr]);

    return rfqSummary ? (
        <Box marginRight={1}>
            <UserAvatar username={rfqSummary.assigneeUsername || ''} />{' '}
        </Box>
    ) : (
        <></>
    );
};
