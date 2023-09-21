import moment from 'moment';
import * as React from 'react';
import { v4 as uuid4 } from 'uuid';
import { ProductV2 } from '../../models/ProductV2';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
//import { MapOf } from '../../utils/Types';
import {
    Row,
    Collumn2,
    Value,
    SectionHeading,
    RowHeading,
    CardPriceColumn,
    CardSubHeading,
    CardFieldValue,
} from './styled';
import { ProductDetailsContainer } from '../ProductDetails/styled';

import { Box, Chip, makeStyles, Typography } from '@material-ui/core';

import { renders } from '../../pages/ProductsListV2/columns';
import { AGIconHoc } from '../AGTable/CellFormatter/Hoc/AGIconHoc';

import { ShortageDetail } from './ShortageDetail';
import { groupBy } from '../../utils/utils';
import Price from '../PriceV2';
import ColorPalete from '../../theme/colors';
import { Product } from '../../models/Product';
import { stringify } from 'querystring';
//import { Tooltip } from 'reactstrap';
import  Tooltip  from '@material-ui/core/Tooltip';
import { render } from 'react-dom';
import { FaDice } from 'react-icons/fa';

//const ProductDetails
interface ProductWrapper {
    product: ProductV2;
}
interface AtcSeparte {
    atc: string;
    divider: number;
}

const RemoveFromObject = (prop: { [key: string]: string }, ...keysToRemove: string[]) => {
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

export const useProductContentStyles = makeStyles({
    dialogSectionHeading: {
        color: `${ColorPalete.textRBGreen}`,
    },
    dialogSectionField: {
        color: `${ColorPalete.delicateRBGreen}`,
    },
    cardColor: {
        backgroundColor: `${ColorPalete.brightGreen}`,
    },
    cardSectionHeading: {
        color: `${ColorPalete.textRBGreen}`,
        fontWeight: 600,
    },
    cardSectionField: {
        color: `${ColorPalete.delicateRBGreen}`,
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    cardSectionFieldValue: {
        color: '#000',
        fontSize: '0.8rem',
    },
});


const AtcChipFunc: React.FC<AtcSeparte> = ({ atc, divider }) => {
    var firstPart = "";
    var count = 0;
    var l = [] as number[];
    atc.split('').forEach((s, idx) => {
        if (s == ' ' ) {
            count = idx;
            l.push(idx);
        }
    })
    count = atc.length;
    
    l.forEach(I => {
        var x = I - divider;
        x = Math.abs(x);
        if (x < Math.abs(count - divider)) {
            count=I;
        }

    })


    return (<>
        {atc.substring(0, count)}
        <br />
        {atc.substring(count)}
    </>);
}

const ProductContent: React.FC<ProductWrapper> = ({ product }: ProductWrapper) => {
    const t = useTranslations();
    const classes = useProductContentStyles();
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
        let startDates = moment(product.shortageInfo?.start).toDate().getTime();
        let current = new Date().getTime();
        let interval = current - startDates;
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
    }

    let codesAux = (product.codes as { [key: string]: string }) || {};
    const { documents, prices } = product;
    let docs = documents && Object.keys(documents);
    
/*    if (x2.activeSubstances != null) {
        x2.activeSubstances = x2.activeSubstances.map(I => {
            if (I.length <= 49)
                return I;
            var regex = /.{1,49}/g;
            var s = I.match(regex);
            
            if (s == null) {
                return "";
            }
            var x =  `\\n`;
            var s2 = s.join(x);
            return s2;
            
        });
    }
*/
    var ActiveSubsDiv;
    var counts = 0;
    var ids = 1;
    product.activeSubstances?.forEach((i, idx) => {
        counts += i.length;
        if (counts<=49) {
            ids = idx+1;
        }
    });
    var x33 = product.activeSubstances?.slice(ids);
    if (product.activeSubstances == null) {
        ActiveSubsDiv = (<></>);
    } else {
        if (product.activeSubstances.length > ids) {
            var ret1 = (<>
                {product.activeSubstances.slice(0, ids).map(sub => {
                    return (<span style={{ whiteSpace: "pre-wrap", backgroundColor: "#e0e0e0", height: "fit-content", borderRadius: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
                        {sub}
                    </span>)
                })}
            </>);
            var ret2 = (
                <Tooltip title={
                    x33.map(subs =>
                    (<div key={subs} style={{ lineHeight: '2.2rem' }}>
                        <Chip size="small" label={subs} />
                    </div>))}
                >
                    <Chip
                        style={{ marginLeft: '0.1rem', borderRadius: '0.5rem' }}
                        size="small"
                        label={'+' + x33.length}
                    />
                </Tooltip>
            );
            ActiveSubsDiv = (<>
                {ret1}
                {ret2}
            </>);
        } else if (product.activeSubstances.length==2) {
            ActiveSubsDiv = (<>
                    <span style={{ whiteSpace: "pre-wrap", backgroundColor: "#e0e0e0", height: "fit-content", borderRadius: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
                    {product.activeSubstances[0]}
                    </span>
                <br />
                <span style={{ whiteSpace: "pre-wrap", backgroundColor: "#e0e0e0", height: "fit-content", borderRadius: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
                    {product.activeSubstances[1]}
                </span>
                    
                </>)
        } else  {
            ActiveSubsDiv = product.activeSubstances.map(sub => {
                return (<span style={{ whiteSpace: "pre-wrap", backgroundColor: "#e0e0e0", height: "fit-content", borderRadius: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
                    {sub}
                </span>)
            })
        }
    }
    var MAX_LINE_LIMIT = 45;
    var AtcChip;
    if (product.atc == null) {
        AtcChip = (<></>);
    } else {
        if (product.atc.split('\n').length >=2) {
            var ret1 = (<>
                <span style={{ whiteSpace: "pre-wrap", backgroundColor: "#e0e0e0", height: "fit-content", borderRadius: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
                    {product.atc.split('\n')[0].length > MAX_LINE_LIMIT && <>{AtcChipFunc({ atc: product.atc.split('\n')[0], divider: product.atc.split('\n')[0].length / 2 })}</>}
                    {product.atc.split('\n')[0].length <= MAX_LINE_LIMIT && <>{product.atc.split('\n')[0]}</>}
                </span>
            </>);
            var ret2 = (
                <Tooltip title={
                    product.atc.split('\n').slice(1).map(subs =>
                    (<div key={subs} style={{ lineHeight: '2.2rem' }}>
                        <Chip size="small" label={subs} />
                    </div>))}
                >
                    <Chip
                        style={{ marginLeft: '0.01rem', borderRadius: '0.5rem' }}
                        size="small"
                        label={'+' + product.atc.split('\n').slice(1).length}
                    />
                </Tooltip>
            );
            AtcChip = (<>
                {ret1}
                {ret2}
            </>);
        } else {
            AtcChip = product.atc.split('\n').map(sub => {
                return (<span style={{ whiteSpace: "pre-wrap", backgroundColor: "#e0e0e0", height: "fit-content", borderRadius: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
                    {sub.length > MAX_LINE_LIMIT && <>
                        {AtcChipFunc({ atc : sub, divider:(sub.length/2) })}
                    </>}
                    {sub.length <= MAX_LINE_LIMIT && <>{sub}</>}
                </span>)
            })
        }
    }

    


    let maNumber = product?.codes?.MANumber as string;
    let gtinCode = product?.codes?.GTIN as string;

    let codes = RemoveFromObject(codesAux, product.productCode, maNumber);

    let pricesByType = (prices && groupBy(prices, 'type')) || {};
    let pricesArray: string[] = Object.keys(pricesByType);

    let first = codes.pop();

    const PriceByType = (type: string) => {
        let priceWithVat = prices?.find((pr) => pr.type.toLocaleLowerCase() === type && pr.includeVAT);
        let priceWithoutVat = prices?.find((pr) => pr.type.toLocaleLowerCase() === type && !pr.includeVAT);
        return (
            <div key={uuid4()} style={{ lineHeight: '2rem' }}>
                <Price
                    title={t((type + 'Price') as TK)}
                    priceWithoutVat={priceWithoutVat?.value}
                    priceWithVat={priceWithVat?.value}
                    currencyCode={priceWithoutVat?.currencyCode || priceWithVat?.currencyCode}
                />
            </div>
        );
    };

    return (
        <ProductDetailsContainer>
            <Box width={800}>
                <SectionHeading className={classes.dialogSectionHeading}>
                    <Typography variant="h6" style={{ fontWeight: 600 }}>
                        PRODUCT CHARACTERISTICS
                    </Typography>
                </SectionHeading>
                <RowHeading className={classes.dialogSectionField}>
                    <Collumn2>Active Ingredient</Collumn2>
                    <Collumn2>Strength</Collumn2>
                    <Collumn2>ATC Code</Collumn2>
                </RowHeading>
                <Row>
                    <Value style={{ textAlign: 'center' }}><div style={{ padding: "0 0", fontSize:"0.81rem" }}>{ActiveSubsDiv}</div></Value>
                    <Value style={{ textAlign: 'center' }}>
                        {(renders[TK.strength] && renders[TK.strength](product, t)) || product.strength}
                    </Value>
                    <Value style={{ textAlign: "center" }}>
                        {
                            AtcChip
                        }
                    </Value>
                </Row>
                <RowHeading className={classes.dialogSectionField}>
                    <Collumn2>Pharmaceutical Form</Collumn2>
                    <Collumn2>Administration Route</Collumn2>
                    {/* <Collumn2 style={{ color: colors[Type] }}>AUTHORISED + MARKETED</Collumn2> */}
                    <Collumn2>Pack Size</Collumn2>
                </RowHeading>
                <Row>
                    <Value style={{ textAlign: 'center' }}>
                        {(renders[TK.pharmaceuticalForm] && renders[TK.pharmaceuticalForm](product, t)) || '-'}
                    </Value>
                    <Value style={{ textAlign: 'center' }}>
                        {(renders[TK.administration] && renders[TK.administration](product, t)) || '-'}
                    </Value>
                    <Value style={{ textAlign: 'center' }}>{(renders[TK.package] && renders[TK.package](product, t)) || product.package}</Value>
                </Row>

                <SectionHeading className={classes.dialogSectionHeading}>
                    <Typography variant="h6" style={{ fontWeight: 600 }}>
                        OTHER INFORMATION
                    </Typography>
                </SectionHeading>
                <RowHeading className={classes.dialogSectionField}>
                    <Collumn2>Marketing Authorisation Number</Collumn2>
                    <Collumn2>Gtin Code</Collumn2>
                    <Collumn2>Product Code</Collumn2>
                </RowHeading>
                <Row>
                    <Value>{maNumber}</Value>
                    <Value style={{ textAlign: 'center' }}>{gtinCode}</Value>
                    <Value>
                        <div>{product.productCode}</div>
                        {/* <div>{!!first && codesAux[first]}</div>
                        {!!codes.length && (
                            <>
                                {codes.map((key) => (
                                    <div>{codesAux[key]}</div>
                                ))}
                            </>
                        )} */}
                    </Value>
                </Row>
                <RowHeading className={classes.dialogSectionField}>
                    <Collumn2>Market Authorisation Holder</Collumn2>
                    <Collumn2></Collumn2>
                    <Collumn2></Collumn2>
                </RowHeading>
                <Row>
                    <Value style={{textAlign: 'center'}}>{product?.maHolder}</Value>
                    <Value></Value>
                    <Value></Value>
                </Row>
            </Box>
            <Box width={300} mr={2} mt={2}>
                <Box className={classes.cardColor} p={2}>
                    <Box className={classes.cardSectionHeading}>Prices</Box>
                    <CardSubHeading style={{height: '17px', marginTop: '10px'}} className={classes.cardSectionField}>
                        <CardPriceColumn>Retail</CardPriceColumn>
                        <CardPriceColumn>Wholesaler</CardPriceColumn>
                        <CardPriceColumn>Ex-Factory</CardPriceColumn>
                    </CardSubHeading>
                    <Row className={classes.cardSectionFieldValue}>
                        <CardFieldValue>{PriceByType('retail')}</CardFieldValue>
                        <CardFieldValue>{PriceByType('wholesale')}</CardFieldValue>
                        <CardFieldValue>{PriceByType('factory')}</CardFieldValue>
                    </Row>
                    {/* <ShortageDetail product={product} /> */}
                </Box>
                <Box mt={2} p={2} className={classes.cardColor}>
                    <Box className={classes.cardSectionHeading}>Documents</Box>
                    <Box display="flex" flexWrap="wrap">
                        {docs &&
                            docs.map(
                                (docType, index) =>
                                    documents && (
                                        <Box key={uuid4()} m={1}>
                                            <a
                                                key={docType}
                                                href={documents[docType]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Chip color="primary" clickable label={t(docType as TK)} />
                                            </a>
                                        </Box>
                                    ),
                            )}
                    </Box>
                </Box>
            </Box>
        </ProductDetailsContainer>
    );
};

export default ProductContent;
