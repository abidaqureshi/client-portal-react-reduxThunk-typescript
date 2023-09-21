import * as React from 'react';
import { v4 as uuid4 } from 'uuid';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import AcUnitIcon from '@material-ui/icons/AcUnit';

import { Chip, Typography } from '@material-ui/core';
import { Tooltip } from '@material-ui/core';

import { Product } from '../../../models/Product';
import { useTranslations } from '../../../store/Translations/hooks';

import { groupBy, tryGetNameFromOriginal } from '../../../utils/utils';
import Price from '../../../components/PriceV2';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { TK } from '../../../store/Translations/translationKeys';
import { CircleBox, TriangleBox } from '../../ProductDetailsV2/styled';
import AvailabilityCell from '../../Marketed';
import { Link } from 'react-router-dom';
import { NameWrapper, IconsWrapper, IconContainer } from './styled';
import { AGIconHoc } from './Hoc/AGIconHoc';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import ShowMore from './ShowMore';

interface ICellDataProps {
    rowData: Product;
}

interface ICellProps {
    children: React.ReactNode;
    subValue?: string;
    lineHeight?: string;
    marginTop?: string;
}

export const Cell: React.FC<ICellProps> = ({ children, subValue, lineHeight, marginTop }) => {
    return (
        <div style={{ lineHeight: lineHeight || '1.9rem', marginTop: marginTop || '0.5rem' }}>
            {children}
            {subValue && subValue !== children && (
                <Typography style={{ fontSize: 10 }} color="secondary" variant="subtitle2">
                    {subValue}
                </Typography>
            )}
        </div>
    );
};

export const ActiveSubtanceCell: React.FC<ICellDataProps & { limit: number }> = ({ rowData, limit }) => {
    return (
        <div style={{ lineHeight: '2.2rem', marginTop: '0.1rem' }}>
            <ShowMore limit={limit} data={rowData.data.activeSubstances} />
        </div>
    );
};

export const NameCell: React.FC<ICellDataProps> = ({ rowData }) => {
    const { id, originalName, name, isAuthorised, isMarketed, shortageInfo } = rowData.data;
    return (
        <NameWrapper>
            <AvailabilityCell authorised={isAuthorised} marketed={isMarketed} shortage={shortageInfo} />
            <div style={{ lineHeight: '1.2rem' }}>
                <Link to={(location) => ({ ...location, hash: '#' + id })}>
                    {name ?? tryGetNameFromOriginal(originalName)}
                </Link>
                {originalName && originalName !== name && (
                    <Typography style={{ fontSize: 10 }} color="secondary" variant="subtitle2">
                        {originalName}
                    </Typography>
                )}
            </div>
        </NameWrapper>
    );
};

export const PriceCell: React.FC<ICellDataProps> = ({ rowData }) => {
    const { prices } = rowData.data;
    var pricesByType = (prices && groupBy(prices, 'type')) || {};
    let sub;
    const t = useTranslations();
    let pricesArray: string[] = Object.keys(pricesByType);
    let showMore: boolean = false;

    if (Object.keys(pricesByType).length > 2) {
        pricesArray = pricesArray.slice(0, 2);
        showMore = true;
    }

    return (
        <div style={{ marginTop: '0.2rem' }}>
            {pricesArray.map((type, index) => {
                var priceWithVat = prices?.find((pr) => pr.type === type && pr.includeVAT);
                var priceWithoutVat = prices?.find((pr) => pr.type === type && !pr.includeVAT);
                return (
                    <div key={uuid4()} style={{ lineHeight: '2rem' }}>
                        <Price
                            title={t((type + 'Price') as TK)}
                            priceWithoutVat={priceWithoutVat?.value}
                            priceWithVat={priceWithVat?.value}
                            currencyCode={priceWithoutVat?.currencyCode || priceWithVat?.currencyCode}
                        />
                        {index < Object.keys(pricesByType).length - 1 ? ' ' : ''}
                    </div>
                );
            })}
            {showMore &&
                Object.keys(pricesByType)
                    .slice(2)
                    .map((type, index) => {
                        var priceWithVat = prices?.find((pr) => pr.type === type && pr.includeVAT);
                        var priceWithoutVat = prices?.find((pr) => pr.type === type && !pr.includeVAT);
                        return (
                            <div key={uuid4()} style={{ lineHeight: '2rem' }}>
                                <Price
                                    title={t((type + 'Price') as TK)}
                                    priceWithoutVat={priceWithoutVat?.value}
                                    priceWithVat={priceWithVat?.value}
                                    currencyCode={priceWithoutVat?.currencyCode || priceWithVat?.currencyCode}
                                />
                                {index < Object.keys(pricesByType).length - 1 ? ' ' : ''}
                            </div>
                        );
                    })}
        </div>
    );
};

export const DocCell: React.FC<ICellDataProps> = ({ rowData }) => {
    const t = useTranslations();
    const { documents, id } = rowData.data;
    let docs = documents && Object.keys(documents);
    let showMore = false;
    if (docs && docs.length > 3) {
        docs = docs.slice(0, 3);
        showMore = true;
    }

    return docs ? (
        <div style={{ lineHeight: '1.8rem', marginTop: '0.33rem' }}>
            {docs.map(
                (docType, index) =>
                    documents && (
                        <React.Fragment key={uuid4()}>
                            <Tooltip title={<span>{t(docType as TK)}</span>}>
                                <a key={docType} href={documents[docType]} target="_blank" rel="noopener noreferrer">
                                    <AGIconHoc iconType={docType as TK} />
                                </a>
                            </Tooltip>{' '}
                        </React.Fragment>
                    ),
            )}
            {showMore && <Link to={(location) => ({ ...location, hash: '#' + id })}>...</Link>}
        </div>
    ) : (
        <></>
    );
};

export const PharmaCell: React.FC<ICellDataProps> = ({ rowData }) => {
    const { pharmaceuticalForm } = rowData.data;
    const { pharmaceuticalFormCategories } = rowData.data;
    const t = useTranslations();
    return (
        <Cell subValue={pharmaceuticalForm} marginTop="0.2rem">
            <ShowMore limit={2} data={pharmaceuticalFormCategories || []} />

            {/* {(pharmaceuticalFormCategories?.length &&
                pharmaceuticalFormCategories.map((c) => (
                    <Chip size="small" key={c} label={t(((TK as any)[c] || c) as TK)} />
                ))) ||
                '-'} */}
        </Cell>
    );
};

export const YesNo: React.FC<{ value?: boolean }> = ({ value }) =>
    value === undefined ? (
        <HelpOutlineIcon style={{ color: 'goldenrod' }} />
    ) : value ? (
        <CheckIcon color="primary" />
    ) : (
        <CloseIcon color="error" />
    );

export const Administration: React.FC<ICellDataProps> = ({ rowData }) => {
    const t = useTranslations();
    const { administrationRoute, administrationCategories } = rowData.data;
    return (
        <Cell subValue={administrationRoute}>
            {(administrationCategories?.length &&
                administrationCategories.map((c) => (
                    <Chip size="small" key={c} label={t(((TK as any)[c] || c) as TK)} />
                ))) ||
                '-'}
        </Cell>
    );
};

export const AdditionalInformation: React.FC<ICellDataProps> = ({ rowData }) => {
    const {
        isAdditionalMonitoring,
        isBiological,
        isParallelImport,
        isPsychotropic,
        isHospitalar,
        isPrescription,
        isGeneric,
        precautionsForStorage,
    } = rowData.data;

    return (
        <>
            <IconsWrapper>
                {isGeneric && (
                    <IconContainer>
                        <Tooltip title={<span>This is a generic product</span>}>
                            <CircleBox lineHeight={1.6} isActive={isGeneric}>
                                G
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}
                {isPrescription && (
                    <IconContainer>
                        <Tooltip title={<span>This is a prescription product</span>}>
                            <CircleBox lineHeight={1.6} isActive={isPrescription}>
                                Rx
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}
                {isBiological && (
                    <IconContainer>
                        <Tooltip title={<span>This is a biological product</span>}>
                            <CircleBox lineHeight={1.6} isActive={isBiological}>
                                B
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}

                {isAdditionalMonitoring && (
                    <IconContainer>
                        <Tooltip title={<span>This is a additional monitoring product</span>}>
                            <CircleBox isActive={isAdditionalMonitoring}>
                                <TriangleBox></TriangleBox>
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}

                {isParallelImport && (
                    <IconContainer>
                        <Tooltip title={<span>This is a parallel import product</span>}>
                            <CircleBox lineHeight={1.6} isActive={isParallelImport}>
                                PI
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}

                {isPsychotropic && (
                    <IconContainer>
                        <Tooltip title={<span>This is a psychotropic product</span>}>
                            <CircleBox lineHeight={1.6} isActive={isPsychotropic}>
                                Ps
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}

                {isHospitalar && (
                    <IconContainer>
                        <Tooltip title={<span>This is a hospitalar product</span>}>
                            <CircleBox lineHeight={1.6} isActive={isHospitalar}>
                                H
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}

                {precautionsForStorage && (
                    <IconContainer>
                        <Tooltip title={<span>{precautionsForStorage}</span>}>
                            <CircleBox lineHeight={1.6} isActive={true}>
                                <AcUnitIcon />
                            </CircleBox>
                        </Tooltip>
                    </IconContainer>
                )}
            </IconsWrapper>
        </>
    );
};
