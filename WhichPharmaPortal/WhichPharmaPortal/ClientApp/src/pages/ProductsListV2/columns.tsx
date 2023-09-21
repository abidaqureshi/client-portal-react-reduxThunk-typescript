import * as React from 'react';
import { ITranslate } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition, ColumnTypeTemplate } from '../../components/Table/types';
import { ProductV2 } from '../../models/ProductV2';
import ShortageInfo from '../../components/Shortage';
import { FiltersKey } from './ProductsFilters/types';
import { ShortageType } from '../../models/ShortageType';
import moment from 'moment';
import Price from '../../components/Price';
import { DateTimeFormat } from '../../components/Table/DataTypeFormatter';
import { Chip, Typography } from '@material-ui/core';
import CountryFlag from '../../components/CountryFlag';
import { groupBy, tryGetNameFromOriginal } from '../../utils/utils';
import { MapOf } from '../../utils/Types';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import AvailabilityCell from '../../components/Marketed';

export interface ProductColumnDefinition extends ColumnDefinition<ProductV2> {
    filterKey?: FiltersKey;
}

export interface Columns {
    country: ProductColumnDefinition;
    shortage: ProductColumnDefinition;
    productCode: ProductColumnDefinition;
    name: ProductColumnDefinition;
    documents: ProductColumnDefinition;
    activeSubstances: ProductColumnDefinition;
    atc: ProductColumnDefinition;
    pharmaceuticalForm: ProductColumnDefinition;
    administration: ProductColumnDefinition;
    authorised: ProductColumnDefinition;
    marketed: ProductColumnDefinition;
    strength: ProductColumnDefinition;
    package: ProductColumnDefinition;
    manufacturer: ProductColumnDefinition;
    maHolder: ProductColumnDefinition;
    codes: ProductColumnDefinition;
    prices: ProductColumnDefinition;
    otherFields: ProductColumnDefinition;
    scrapingOrigin: ProductColumnDefinition;
    scrapingOriginIdentifier: ProductColumnDefinition;
    lastUpdate: ProductColumnDefinition;
    generic: ProductColumnDefinition;
    psychotropic: ProductColumnDefinition;
    biological: ProductColumnDefinition;
    additionalMonitoring: ProductColumnDefinition;
    parallelimport: ProductColumnDefinition;
    prescription: ProductColumnDefinition;
    hospitalar: ProductColumnDefinition;
    precautionsForStorage: ProductColumnDefinition;
    statusNote: ProductColumnDefinition;
    [column: string]: ProductColumnDefinition;
}

const Cell: React.FC<{ children: React.ReactNode; subValue?: string }> = ({ children, subValue }) => {
    return (
        <div>
            {children}
            {subValue && subValue !== children && (
                <Typography style={{ fontSize: 10 }} color="secondary" variant="subtitle2">
                    {subValue}
                </Typography>
            )}
        </div>
    );
};

const YesNo: React.FC<{ value?: boolean | null | undefined }> = ({ value }) =>
    value === undefined ? (
        <HelpOutlineIcon style={{ color: 'goldenrod' }} />
    ) : value ? (
        <CheckIcon color="primary" />
    ) : (
        <CloseIcon color="error" />
    );

export const columns: Columns = {
    statusNote: {
        labelTK: TK.statusNotes,
        columnName: 'statusNotes',
        defaultWidth: 130,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    country: {
        labelTK: TK.country,
        columnName: 'country',
        filterKey: FiltersKey.Countries,
        defaultWidth: 100,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        // eslint-disable-next-line react/display-name
        renderTableCell: (p) => <CountryFlag country={p.countryName} countryCode={p.countryCode} />,
    },
    shortage: {
        labelTK: TK.shortage,
        columnName: 'shortage',
        defaultWidth: 40,
        renderTableCell: (p) =>
            p.shortageInfo && (
                <ShortageInfo
                    start={p.shortageInfo?.start || ''}
                    end={p.shortageInfo?.end || ''}
                    isActive={p.shortageInfo.isActive}
                    type={ShortageType[p.shortageInfo?.type || ShortageType.Temporary]}
                    additionalNotes={p.shortageInfo?.additionalNotes || ''}
                    lastUpdate={p.shortageInfo?.lastUpdate || ''}
                />
            ),
    },
    authorised: {
        labelTK: TK.authorised,
        columnName: 'isAuthorised',
        defaultWidth: 120,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isAuthorised === undefined ? 'Unknown' : p.isAuthorised ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isAuthorised} />,
    },
    marketed: {
        labelTK: TK.marketed,
        columnName: 'isMarketed',
        defaultWidth: 110,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isMarketed === undefined ? 'Unknown' : p.isMarketed ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isMarketed} />,
    },
    productCode: {
        labelTK: TK.productCode,
        columnName: 'productCode',
        defaultWidth: 130,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    name: {
        labelTK: TK.name,
        columnName: 'name',
        filterKey: FiltersKey.Name,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => p.name + ' - ' + p.originalName,
        renderTableCell: (p) => (
            <Cell subValue={p.originalName ?? ''}>
                <Link to={(location) => ({ ...location, hash: '#' + p.id })}>
                    {p.name ?? tryGetNameFromOriginal(p.originalName ?? '')}
                </Link>
            </Cell>
        ),
    },

    availability: {
        labelTK: TK.authorised,
        columnName: 'availability',
        canBeSorted: true,
        defaultWidth: 40,
        canBeGrouped: true,
        renderTableCell: (p) => (
            <AvailabilityCell authorised={p.isAuthorised} marketed={p.isMarketed} shortage={p.shortageInfo} />
        ),
    },

    documents: {
        labelTK: TK.documents,
        columnName: 'documentsUrls',
        renderTableCell: (p, t) => {
            const docs = p.documents && Object.keys(p.documents);
            return (
                docs && (
                    <span>
                        {docs.map(
                            (docType, index) =>
                                p.documents && (
                                    <>
                                        <a
                                            key={docType}
                                            href={p.documents[docType]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t(docType as TK)}
                                        </a>
                                        {index < docs.length - 1 ? ', ' : ''}
                                    </>
                                ),
                        )}
                    </span>
                )
            );
        },
    },
    activeSubstances: {
        labelTK: TK.activeSubstances,
        columnName: 'activeSubstances',
        filterKey: FiltersKey.ActiveSubstances,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getGroupValue: (value) => value?.join(', '),
        renderTableCell: (p) => (
            <span>
                {(p.activeSubstances?.length &&
                    p.activeSubstances.map((c) => <Chip size="small" key={c} label={c} />)) ||
                    '-'}
            </span>
        ),
    },
    atc: {
        labelTK: TK.atc,
        columnName: 'atc',
        filterKey: FiltersKey.Atc,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
    },
    pharmaceuticalForm: {
        labelTK: TK.pharmaceuticalForm,
        columnName: 'pharmaceuticalFormCategories',
        filterKey: FiltersKey.PharmaceuticalForms,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => p.pharmaceuticalFormCategories?.join(', '),
        renderTableCell: (p, t) => (
            <Cell subValue={p.pharmaceuticalForm}>
                {(p.pharmaceuticalFormCategories?.length &&
                    p.pharmaceuticalFormCategories.map((c) => (
                        <Chip size="small" key={c} label={t(((TK as any)[c] || c) as TK)} />
                    ))) ||
                    '-'}
            </Cell>
        ),
    },
    administration: {
        labelTK: TK.administration,
        columnName: 'administrationCategories',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => p.administrationCategories?.join(', '),
        renderTableCell: (p, t) => (
            <Cell subValue={p.administrationRoute}>
                {(p.administrationCategories?.length &&
                    p.administrationCategories.map((c) => (
                        <Chip size="small" key={c} label={t(((TK as any)[c] || c) as TK)} />
                    ))) ||
                    '-'}
            </Cell>
        ),
    },
    strength: {
        labelTK: TK.strength,
        columnName: 'strengthDetailed',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getGroupValue: (value) => value?.replace(/[^\d.,;+-]/g, ''),
        renderGroupCell: (values) => values.filter((value, index, self) => self.indexOf(value) === index).join(' | '),
        getCellValue: (p) => p.strengthDetailed + ' - ' + p.strength,
        renderTableCell: (p) => <Cell subValue={p.strength}>{p.strengthDetailed && <Chip size="small" key={p.strengthDetailed} label={p.strengthDetailed} />}</Cell>,
    },
    package: {
        labelTK: TK.package,
        columnName: 'packageDetailed',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getGroupValue: (value) => value?.replace(/[^\d.,;+-]/g, ''),
        renderGroupCell: (values) => values.filter((value, index, self) => self.indexOf(value) === index).join(' | '),
        getCellValue: (p) => p.packageDetailed + ' - ' + p.package,
        renderTableCell: (p) => <Cell subValue={p.package}>{p.packageDetailed && <Chip size="small" key={p.packageDetailed} label={p.packageDetailed} />}</Cell>,
    },
    manufacturer: {
        labelTK: TK.manufacturer,
        columnName: 'manufacturer',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    maHolder: {
        labelTK: TK.maHolder,
        columnName: 'maHolder',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    prices: {
        labelTK: TK.prices,
        columnName: 'prices',
        renderTableCell: (p, t) => {
            var pricesByType = (p.prices && groupBy(p.prices, 'type')) || {};
            return (
                <div>
                    {Object.keys(pricesByType).map((type, index) => {
                        var priceWithVat = p.prices?.find((pr) => pr.type === type && pr.includeVAT);
                        var priceWithoutVat = p.prices?.find((pr) => pr.type === type && !pr.includeVAT);
                        return (
                            <>
                                <Price
                                    key={type}
                                    title={t((type + 'Price') as TK)}
                                    priceWithoutVat={priceWithoutVat?.value}
                                    priceWithVat={priceWithVat?.value}
                                    currencyCode={priceWithoutVat?.currencyCode || priceWithVat?.currencyCode}
                                />
                                {index < Object.keys(pricesByType).length - 1 ? ', ' : ''}
                            </>
                        );
                    })}
                </div>
            );
        },
    },
    codes: {
        labelTK: TK.codes,
        columnName: 'codes',
        canBeFiltered: true,
        canBeSorted: true,
        defaultWidth: 600,
        getCellValue: (p) =>
            p.codes &&
            Object.keys(p.codes)
                .map((code) => p.codes && `${code}: ${p.codes[code]}`)
                .join(', '),
    },
    otherFields: {
        labelTK: TK.notes,
        columnName: 'otherFields',
        canBeFiltered: true,
        canBeSorted: true,
        defaultWidth: 600,
        getCellValue: (p) =>
            p.otherFields &&
            Object.keys(p.otherFields)
                .map((key) => p.otherFields && `${key}: ${p.otherFields[key]}`)
                .join(', '),
    },
    scrapingOrigin: {
        labelTK: TK.scrapingOrigin,
        columnName: 'scrapingOrigin',
        filterKey: FiltersKey.Origins,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 120,
    },
    scrapingOriginIdentifier: {
        labelTK: TK.scrapingOriginId,
        columnName: 'scrapingOriginIdentifier',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
    },
    lastUpdate: {
        labelTK: TK.lastUpdate,
        columnName: 'lastUpdate',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,

        templateType: ColumnTypeTemplate.DateTime,
        renderTableCell: (p) => moment(p.lastUpdate).format(DateTimeFormat),
    },
    generic: {
        labelTK: TK.generic,
        columnName: 'isGeneric',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isGeneric === undefined ? 'Unknown' : p.isGeneric ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isGeneric} />,
    },
    psychotropic: {
        labelTK: TK.psychotropic,
        columnName: 'isPsychotropic',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isPsychotropic === undefined ? 'Unknown' : p.isPsychotropic ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isPsychotropic} />,
    },
    biological: {
        labelTK: TK.biological,
        columnName: 'isBiological',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isBiological === undefined ? 'Unknown' : p.isBiological ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isBiological} />,
    },
    additionalMonitoring: {
        labelTK: TK.additionalMonitoring,
        columnName: 'isAdditionalMonitoring',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) =>
            p.isAdditionalMonitoring === undefined ? 'Unknown' : p.isAdditionalMonitoring ? 'Yes' : 'No',
        renderTableCell: (p) => <YesNo value={p.isAdditionalMonitoring} />,
    },
    parallelimport: {
        labelTK: TK.parallelimport,
        columnName: 'isParallelImport',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isParallelImport === undefined ? 'Unknown' : p.isParallelImport ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isParallelImport} />,
    },
    prescription: {
        labelTK: TK.prescription,
        columnName: 'isPrescription',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isPrescription === undefined ? 'Unknown' : p.isPrescription ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isPrescription} />,
    },
    hospitalar: {
        labelTK: TK.hospitalar,
        columnName: 'isHospitalar',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (p) => (p.isHospitalar === undefined ? 'Unknown' : p.isHospitalar ? 'Yes' : 'No'),
        renderTableCell: (p) => <YesNo value={p.isHospitalar} />,
    },
    precautionsForStorage: {
        labelTK: TK.precautionsForStorage,
        columnName: 'precautionsForStorage',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
};

export const renders = Object.values(columns)
    .map((column) => ({
        [column.labelTK]:
            column.renderTableCell ||
            ((p: ProductV2): React.ReactNode => (p as any)[column.columnName]?.toString() || ''),
    }))
    .reduce<MapOf<(p: ProductV2, t: ITranslate<TK>) => React.ReactNode>>((prev, curr) => Object.assign(prev, curr), {});

export const columnsArray: ProductColumnDefinition[] = Object.values(columns) as ProductColumnDefinition[];
