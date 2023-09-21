import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment';
import * as React from 'react';
import { ProductV2 } from '../../models/ProductV2';
import { ShortageInfo } from '../../models/ShortageInfo';
import { OthersCodesInfo } from '../../models/OthersCodesInfo';
import { ShortageType } from '../../models/ShortageType';
import { ITranslate, useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { MapOf } from '../../utils/Types';
import Price from '../Price';
import { ProductDetailsColumn, ProductDetailsContainer, ProductField, Box2 } from './styled';

export interface ProductDetailsProps {
    product: ProductV2 | null;
    renders: MapOf<(p: ProductV2, t: ITranslate<TK>) => React.ReactNode>;
}

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

const Bold = {
    fontWeight: 700,
};

const OtherCodesDetails: React.FC<{ otherCode: any }> = ({ otherCode }) => {
    const t = useTranslations();
    return (
        <ul>
            {/*<li>*/}
            {/*    {t(TK.codes)}: {otherCode.GCode}*/}
            {/*</li>*/}
            {Object.keys(otherCode).map((fieldName) => (
                <li>
                    <b>{fieldName}</b> : {otherCode[fieldName]}
                </li>
            ))}
        </ul>
    );
};

const leftFields = [
    TK.country,
    //TK.name,
    TK.nameV2,
    TK.productCode,
    TK.authorised,
    TK.marketed,
    TK.atc,
    TK.activeSubstances,
    TK.pharmaceuticalForm,
    TK.administration,
    TK.strength,
    TK.package,
    TK.documents,
    TK.scrapingOrigin,
    TK.lastUpdate,
];

const rigthFields = [
    TK.shortage,
    TK.maHolder,
    TK.manufacturer,
    TK.prices,
    TK.codes,
    TK.notes,
    TK.generic,
    TK.psychotropic,
    TK.biological,
    TK.additionalMonitoring,
    TK.parallelimport,
    TK.prescription,
    TK.hospitalar,
    TK.statusNotes,
    TK.precautionsForStorage,
];

const ProductFieldContainer: React.FC<ProductDetailsProps & { field: TK }> = ({ product, renders, field }) => {
    const t = useTranslations();

    if (!product) {
        return (
            <ProductField key={field}>
                <Box2>{t(field)}:</Box2>
                <Skeleton />
            </ProductField>
        );
    }
    let var2 = (renders[field] && renders[field](product, t)) || '-';

    if (var2 === '-' || (field === TK.prices && product.prices?.length == 0)) {
        return null;
    }

    if (field === TK.shortage && product.shortageInfo) {
        return (
            <ProductField key={field}>
                <Box2>{t(field)}:</Box2>
                <ShortageDetails shortage={product.shortageInfo} />
            </ProductField>
        );
    }

    /*
    if(field === TK.codes && product.codes) {
        return (
            <>
                { Object.keys(product.codes).map(codeType => (
                    <ProductField key={codeType} >
                        <Box fontWeight="fontWeightBold">{codeType}:</Box>
                        {product.codes && product.codes[codeType]}
                    </ProductField>
                ))}
            </>
        );
    }*/

    //  testing:
    if (field === TK.codes && product.codes) {
        return (
            <ProductField key={field}>
                <Box2>{t(field)}:</Box2>
                <OtherCodesDetails otherCode={product.codes} />
            </ProductField>
        );
    }

    if (field === TK.notes && product.otherFields) {
        return (
            <ProductField key={field}>
                <Box2>{t(field)}:</Box2>
                <OtherCodesDetails otherCode={product.otherFields} />
            </ProductField>
        );
    }
    if (field === TK.prices && product.prices && product.prices.length != 0) {
        return (
            <ProductField key={field}>
                <Box2>{t(field)}:</Box2>
                <ul>
                    {product.prices.map((price) => (
                        <li>
                            <b>
                                {t((price.type + 'Price') as TK)} ({t(price.includeVAT ? TK.withVAT : TK.withoutVAT)})
                            </b>{' '}
                            :
                            <Price
                                title={t((price.type + 'Price') as TK)}
                                priceWithoutVat={price.includeVAT ? undefined : price.value}
                                priceWithVat={price.includeVAT ? price.value : undefined}
                                currencyCode={price.currencyCode}
                            />
                        </li>
                    ))}
                </ul>
            </ProductField>
        );
    }
    /*if(field === TK.prices && product.prices) {
        return (
            <>
                { product.prices.map(price => (
                    <ProductField key={price.type+price.includeVAT} >
                        <Box2 fontWeight="fontWeightBold">{t(price.type + 'Price' as TK)} ({t(price.includeVAT ? TK.withVAT : TK.withoutVAT)}):</Box2>
                        <Price
                            title={t((price.type + 'Price') as TK)}
                            priceWithoutVat={price.includeVAT ? undefined : price.value}
                            priceWithVat={price.includeVAT ? price.value : undefined}
                            currencyCode={price.currencyCode} />
                    </ProductField>
                ))}
            </>
        );
    }*/

    return (
        <ProductField key={field}>
            <Box2>{t(field)}:</Box2>
            {(renders[field] && renders[field](product, t)) || '-'}
        </ProductField>
    );
};

const ProductDetails: React.FC<ProductDetailsProps> = (props) => {
    return (
        <ProductDetailsContainer>
            <ProductDetailsColumn>
                {leftFields.map((field) => (
                    <ProductFieldContainer {...props} field={field} />
                ))}
            </ProductDetailsColumn>
            <ProductDetailsColumn>
                {rigthFields.map((field) => (
                    <ProductFieldContainer {...props} field={field} />
                ))}
            </ProductDetailsColumn>
        </ProductDetailsContainer>
    );
};

export default ProductDetails;
