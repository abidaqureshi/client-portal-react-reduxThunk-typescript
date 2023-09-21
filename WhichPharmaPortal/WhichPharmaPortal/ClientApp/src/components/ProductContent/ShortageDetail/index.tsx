import React from 'react';
import moment from 'moment';
import { ProductV2 } from '../../../models/ProductV2';
import { Collumn2, Row, RowHeading, ShortageDetailTitle } from '../styled';
import { useProductContentStyles } from '..';

export const ShortageDetail: React.FC<{ product: ProductV2 }> = ({ product }) => {
    const classes = useProductContentStyles();
    var startDate = !!product.shortageInfo?.start ? moment(product.shortageInfo?.start).format('DD.MM.YYYY') : '';
    var endDate = !!product.shortageInfo?.end ? moment(product.shortageInfo?.end).format('DD.MM.YYYY') : '';
    return (
        <>
            {!!product.shortageInfo && (
                <>
                    <ShortageDetailTitle>Shortage</ShortageDetailTitle>
                    <div>
                        <div style={{marginTop: '10px'}}>
                            <span>Begining:</span>
                            <span style={{marginLeft: '5px'}}>{startDate ? '    ' + startDate : ''}</span>
                        </div>
                        <div style={{marginTop: '10px'}}>
                            <span> End:</span>
                            <span style={{marginLeft: '5px'}}>{endDate ? endDate : ''}</span>
                        </div>
                        <div style={{marginTop: '10px', marginBottom: '10px'}}>
                            <span>Reason:</span>
                            <span style={{marginLeft: '5px'}}>
                                {product.shortageInfo.reason ?? 'Not Indicated'}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
