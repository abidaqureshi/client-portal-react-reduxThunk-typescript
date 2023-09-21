import moment from 'moment';
import * as React from 'react';
import { ProductV2 } from '../../models/ProductV2';
import { ShortageInfo } from '../../models/ShortageInfo';
import { OthersCodesInfo } from '../../models/OthersCodesInfo';
import { ShortageType } from '../../models/ShortageType';
import { ITranslate, useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
//import { MapOf } from '../../utils/Types';
import { ButtonDocs, SqaureBox, CircleBox, Row2, Collumn2, LineSeparator, TriangleBox, Collumn3 } from './styled';
import { ProductDetailsContainer, ProductDetailsColumn } from '../ProductDetailsV1/styled';

import { Price } from '../../models/Price';

import { Tooltip } from '@material-ui/core';
import { MapOf } from '../../utils/Types';
import { renders } from '../../pages/ProductsListV2/columns';


//const ProductDetails

interface ProductWrapper {
    product: ProductV2;
}



const RemoveFromObject = (prop: { [key: string]: string }, ...keysToRemove: string[]) => {
    if (prop === undefined) {
        return [];
    }
    let keys = Object.keys(prop);
    let r: { [key: string]: string } = {};
    keys.forEach((i) => {
        let removed = false;
        keysToRemove.forEach((j) => {
            if (prop[i] == j) {
                removed = true;
            }
        });
        if (!removed) {
            r[i] = prop[i];
        }
    });
    return Object.keys(r);
};

const colors: { [key: string]: string } = {
    NotAuthorised: 'black',
    NotMarketed: 'blue',
    Shortage3M: 'yellow',
    Shortage3to6M: 'orange',
    Shortage6M: 'red',
    Marketed: '#87ba65',
};

const ProductContect: React.FC<ProductWrapper> = ({ product }: ProductWrapper) => {
    const t = useTranslations();
    if (!product) {
        return <></>;
    }
    let Type: 'Shortage3M' | 'Shortage3to6M' | 'Shortage6M' | 'NotAuthorised' | 'NotMarketed' | 'Marketed';

    if (product.isMarketed && product.isAuthorised) {
        Type = 'Marketed';
    } else if (product.isAuthorised) {
        Type = 'NotMarketed';
    } else {
        Type = 'NotAuthorised';
    }
    if (product.shortageInfo) {
        Type = 'Shortage3M';
        var startDates = moment(product.shortageInfo?.start).toDate().getTime();
        var current = new Date().getTime();
        var interval = current - startDates;
        var months = moment(interval).toDate().getMonth();
        var year = moment(interval).toDate().getFullYear();

        if (months > 2) {
            Type = 'Shortage3to6M';
        }
        if (year > 1970) {
            Type = 'Shortage6M';
        }
        if (months > 5) {
            Type = 'Shortage6M';
        }
    }

    var codesAux = product.codes as { [key: string]: string };
    var SPC = product.documents?.SPC;
    var PIL = product.documents?.PIL;
    var pricesAux = product.prices as Price[];
    var pr2 = Object.assign({}, ...pricesAux.map((map) => ({ [map.type]: map.value })));
    var maNumber = product?.codes?.MANumber as string;
    var codes = RemoveFromObject(codesAux, product.productCode, maNumber);
    let first = codes.pop();

    var startDate = !!product.shortageInfo?.start ? moment(product.shortageInfo?.start).format('DD.MM.YYYY') : '';
    var endDate = !!product.shortageInfo?.end ? moment(product.shortageInfo?.end).format('DD.MM.YYYY') : '';
    return (
        <ProductDetailsContainer>
            <Row2>
                <Collumn2>
                    <b>{'Authorisation Number'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    <b>{'Marketing Authorisation Holder'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    {!!SPC ? (
                        <ButtonDocs href={SPC}>SPC</ButtonDocs>
                    ) : (
                        <Collumn2
                            style={{
                                backgroundColor: '#b7e1cd',
                                margin: '16px ',
                                position: 'relative',
                                height: '28px',
                            }}
                        />
                    )}
                    {!!PIL ? (
                        <ButtonDocs href={PIL}>PIL</ButtonDocs>
                    ) : (
                        <Collumn2
                            style={{
                                backgroundColor: '#b7e1cd',
                                margin: '16px ',
                                position: 'relative',
                                height: '28px',
                            }}
                        />
                    )}
                </Collumn2>
            </Row2>

            <Row2>
                <Collumn2>{maNumber}</Collumn2>
                <Collumn2>{product.maHolder}</Collumn2>
                <Collumn2></Collumn2>
            </Row2>
            <Row2>
                <Collumn2 style={{ color: colors[Type] }}>AUTHORISED + MARKETED</Collumn2>
                <Collumn2></Collumn2>
                <Collumn2></Collumn2>
            </Row2>

            <Row2 />
            <LineSeparator />
            <Row2 />
            <Row2>
                <Collumn2>
                    <b>{'Pharmaceutical Form'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    <b>{'Administration Route'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    <b>{'Strength'.toUpperCase()}</b>
                </Collumn2>
            </Row2>
            <Row2>
                <Collumn2 style={{ textAlign: 'center' }}>
                    {(renders[TK.pharmaceuticalForm] && renders[TK.pharmaceuticalForm](product, t)) || '-'}
                </Collumn2>
                <Collumn2 style={{ textAlign: 'center' }}>
                    {(renders[TK.administration] && renders[TK.administration](product, t)) || '-'}
                </Collumn2>
                <Collumn2 style={{ textAlign: 'center' }}>
                    {(renders[TK.strength] && renders[TK.strength](product, t)) || product.strength}
                </Collumn2>
            </Row2>
            <Row2 ><Collumn2> </Collumn2></Row2>
            <Row2>
                <Collumn2> </Collumn2>
            </Row2>
            <Row2>
                <Collumn2>
                    {!!product.isGeneric && (
                        <Tooltip title={<span>This is a generic product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isGeneric}>G</CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                    {!!product.isPrescription && (
                        <Tooltip title={<span>This is a prescription product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isPrescription}>Rx</CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                    {!!product.isBiological && (
                        <Tooltip title={<span>This is a biological product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isBiological}>B</CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                    {!!product.isAdditionalMonitoring && (
                        <Tooltip title={<span>This is a addtional monitoring product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isAdditionalMonitoring}>
                                    <TriangleBox></TriangleBox>
                                </CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                    {!!product.isParallelImport && (
                        <Tooltip title={<span>This is a parallel import product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isParallelImport}>PI</CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                    {!!product.isPsychotropic && (
                        <Tooltip title={<span>This is a psychotropic product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isPsychotropic}>Ps</CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                    {!!product.isHospitalar && (
                        <Tooltip title={<span>This is a hospitalar product</span>}>
                            <Collumn3>
                                <CircleBox isActive={product.isHospitalar}>H</CircleBox>
                            </Collumn3>
                        </Tooltip>
                    )}
                </Collumn2>
                <Collumn2>
                    <b>{'Active Substance'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    <b>ATC</b>
                </Collumn2>
            </Row2>
            <Row2>
                <Collumn2></Collumn2>
                <Collumn2>{product.activeSubstances}</Collumn2>
                <Collumn2>{product.atc}</Collumn2>
            </Row2>
            <Row2 />
            <LineSeparator />
            <Row2 />
            <Row2>
                <Collumn2>
                    <b>{'Pack Size'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    <b>{'Codes'.toUpperCase()}</b>
                </Collumn2>
                <Collumn2>
                    <b>{'Prices'.toUpperCase()}</b>
                </Collumn2>
            </Row2>
            <Row2>
                <Collumn2>{product.package}</Collumn2>
                <Collumn2>{product.productCode}</Collumn2>
                <Collumn2>{'PVP: ' + pr2.Retail}</Collumn2>
            </Row2>
            <Row2>
                <Collumn2></Collumn2>
                <Collumn2>
                    {!!first && (
                        <>
                            {first + ' :'}
                            {codesAux[first]}
                        </>
                    )}
                </Collumn2>
                <Collumn2>
                    {!!pr2.Factory && <Collumn2> {'PVA: ' + pr2.Factory}</Collumn2>}
                    {!!pr2.Wholesale && <Collumn2>{'PVF: ' + pr2.Wholesale}</Collumn2>}
                </Collumn2>
            </Row2>
            {!!codes.length && (
                <>
                    {codes.map((key) => (
                        <Row2>
                            <Collumn2>{}</Collumn2>
                            <Collumn2>
                                {key + ': '}
                                {codesAux[key]}
                            </Collumn2>
                            <Collumn2></Collumn2>
                        </Row2>
                    ))}
                </>
            )}
            {!!product.shortageInfo && (
                <>
                    <Row2 style={{ backgroundColor: '#ffefef', margin: '8px 16px 0' }}>
                        <Collumn2 style={{ color: '#ff2c2c', fontWeight: 700 }}>SHORTAGE</Collumn2>
                        <Collumn2>
                            <b style={{ whiteSpace: 'pre-wrap' }}>{'FROM: '}</b>
                            {startDate ? '    ' + startDate : ''}
                        </Collumn2>
                        <Collumn2>
                            <b style={{ whiteSpace: 'pre-wrap' }}>{'UNITL: '}</b>
                            {endDate ? endDate : ''}
                        </Collumn2>
                    </Row2>
                    <Row2 style={{ backgroundColor: '#ffefef', margin: '0 16px 8px' }}>
                        <Collumn2></Collumn2>
                        <Collumn2>
                            <b>REASON: </b>
                            {product.shortageInfo.reason ?? 'Not Indicated'}
                        </Collumn2>
                        <Collumn2>{}</Collumn2>
                    </Row2>
                </>
            )}
        </ProductDetailsContainer>
    );
};

const MiddleRow: React.FC<ProductV2> = (prop: ProductV2) => {
    var firstIcon = Test2([
        { bol: prop.isGeneric as boolean, cols: 'G' },
        { bol: prop.isPrescription as boolean, cols: 'Ps' },
        { bol: prop.isBiological as boolean, cols: 'B' },
    ]);

    return <></>;
};

const Test2: React.FC<{ bol: boolean; cols: string }[]> = (props) => {
    return null;
};

const ShortageDetails: React.FC<{ shortage: ShortageInfo }> = ({ shortage }) => {
    const t = useTranslations();
    return (
        <ul>
            <li>
                {t(TK.from)}: {moment(shortage.start).format('DD/MM/YYYY')}
            </li>
            <li>
                {t(TK.until)}: {shortage.end ? moment(shortage.end).format('DD/MM/YYYY') : ''}
            </li>
            <li>
                {t(TK.reason)}: {shortage.reason}
            </li>
            <li>
                {t(TK.additionalNotes)}: {shortage.additionalNotes}
            </li>
        </ul>
    );
};
export default ProductContect;
