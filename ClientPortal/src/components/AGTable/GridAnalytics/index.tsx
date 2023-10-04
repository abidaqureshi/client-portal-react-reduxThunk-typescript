import React from 'react';
import { GridAnalyticsWrapper } from './styled';

interface IGridAnalytics {
    totalRecords: number;
    timeInSeconds: number;
    caption?: string | undefined;
    showRecords: boolean;
}

export const GridAnalystic: React.FC<IGridAnalytics> = ({
    caption,

    showRecords,
    totalRecords,
    timeInSeconds,
}) => {
    return (
        <GridAnalyticsWrapper>
            <div>
                <span>
                    <b>{caption ? caption : '' + ' '}</b>
                </span>
                <span>
                    {showRecords && totalRecords > 0 ? ' ' + totalRecords : ''}
                    {timeInSeconds > 0 ? ' (' + timeInSeconds + ' seconds)' : ''}
                </span>
            </div>
        </GridAnalyticsWrapper>
    );
};
