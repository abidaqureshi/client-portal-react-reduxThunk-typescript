import * as React from 'react';
import { ITranslate } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition, ColumnTypeTemplate } from '../../components/Table/types';
import { ProductV1 } from '../../models/ProductV1';
import ShortageInfo from '../../components/Shortage';
import { FiltersKey } from './ProductsFilters/types';
import { ProductStatus } from '../../models/ProductStatus';
import { ShortageType } from '../../models/ShortageType';
import moment from 'moment';
import Price from '../../components/Price';
import { DateTimeFormat } from '../../components/Table/DataTypeFormatter';
import { Chip } from '@material-ui/core';
import CountryFlag from '../../components/CountryFlag';

export interface ProductColumnDefinition extends ColumnDefinition<ProductV1> {
    filterKey?: FiltersKey;
    renderDetails?: (data: ProductV1, t: ITranslate<TK>) => string | React.ReactNode;
}

export interface Columns {
    country: ProductColumnDefinition;
    shortage: ProductColumnDefinition;
    name: ProductColumnDefinition;
    documents: ProductColumnDefinition;
    activeSubstances: ProductColumnDefinition;
    atc: ProductColumnDefinition;
    drugForm: ProductColumnDefinition;
    administrationForm: ProductColumnDefinition;
    status: ProductColumnDefinition;
    manufacturer: ProductColumnDefinition;
    maNumber: ProductColumnDefinition;
    maHolder: ProductColumnDefinition;
    strength: ProductColumnDefinition;
    package: ProductColumnDefinition;
    notes: ProductColumnDefinition;
    retailPrice: ProductColumnDefinition;
    reimbursementPrice: ProductColumnDefinition;
    wholesalePrice: ProductColumnDefinition;
    factoryPrice: ProductColumnDefinition;
    exFactoryPrice: ProductColumnDefinition;
    productCode: ProductColumnDefinition;
    scrapingOrigin: ProductColumnDefinition;
    scrapingOriginId: ProductColumnDefinition;
    lastUpdate: ProductColumnDefinition;
}

export const columns: Columns = {
    country: {
        labelTK: TK.country,
        columnName: 'country',
        filterKey: FiltersKey.Countries,
        defaultWidth: 100,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        // eslint-disable-next-line react/display-name
        renderTableCell: (p) => <CountryFlag country={p.country} countryCode={p.countryCode} />,
    },
    shortage: {
        labelTK: TK.shortage,
        columnName: 'shortage',
        defaultWidth: 120,
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
        // eslint-disable-next-line react/display-name
        renderDetails: (p, t) => (
            <ul>
                <li>
                    {t(TK.from)}: {moment(p.shortageInfo?.start).format('DD/MM/YYYY')}
                </li>
                <li>
                    {t(TK.until)}: {p.shortageInfo?.end ? moment(p.shortageInfo?.end).format('DD/MM/YYYY') : ''}
                </li>
                <li>
                    {t(TK.type)}: {t((p.shortageInfo?.type || ShortageType.Temporary).toLowerCase() as TK)}
                </li>
                <li>
                    {t(TK.additionalNotes)}: {p.shortageInfo?.additionalNotes}
                </li>
                <li>
                    {t(TK.lastUpdate)} {moment(p.shortageInfo?.lastUpdate).fromNow()}
                </li>
            </ul>
        ),
    },
    name: {
        labelTK: TK.name,
        columnName: 'name',
        filterKey: FiltersKey.Name,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        renderTableCell: (p) => (
            <a style={{ fontWeight: 'bold' }} href={p.scrapingOriginUrl} target="_blank" rel="noopener noreferrer">
                {p.name}
            </a>
        ),
    },
    documents: {
        labelTK: TK.documents,
        columnName: 'documentsUrls',
        renderTableCell: (p, t) => (
            <span>
                {p.pilFileUrl && (
                    <a href={p.pilFileUrl} target="_blank" rel="noopener noreferrer">
                        {t(TK.pil)}{' '}
                    </a>
                )}
                {p.spcFileUrl && (
                    <a href={p.spcFileUrl} target="_blank" rel="noopener noreferrer">
                        {t(TK.spc)}{' '}
                    </a>
                )}
                {p.labelFileUrl && (
                    <a href={p.labelFileUrl} target="_blank" rel="noopener noreferrer">
                        {t(TK.label)}{' '}
                    </a>
                )}
                {p.documentsUrls &&
                    p.documentsUrls.map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            {t(TK.file)} {i + 1}{' '}
                        </a>
                    ))}
            </span>
        ),
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
            <>
                {p.activeSubstances?.map((c) => (
                    <Chip size="small" key={c} label={c} />
                ))}
            </>
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
    drugForm: {
        labelTK: TK.drugForm,
        columnName: 'drugForm',
        filterKey: FiltersKey.DrugForms,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    administrationForm: {
        labelTK: TK.administrationForm,
        columnName: 'administrationForm',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    strength: {
        labelTK: TK.strength,
        columnName: 'strength',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getGroupValue: (value) => value?.replace(/[^\d.,;+-]/g, ''),
        renderGroupCell: (values) => values.filter((value, index, self) => self.indexOf(value) === index).join(' | '),
    },
    package: {
        labelTK: TK.package,
        columnName: 'package',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getGroupValue: (value) => value?.replace(/[^\d.,;+-]/g, ''),
        renderGroupCell: (values) => values.filter((value, index, self) => self.indexOf(value) === index).join(' | '),
    },
    status: {
        labelTK: TK.status,
        columnName: 'status',
        filterKey: FiltersKey.Statuses,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        renderTableCell: (p, t) => {
            switch (p.status) {
                case ProductStatus.Discontinued:
                    return <span style={{ color: '#eb4034' }}>{t(TK.discontinued)}</span>;
                default:
                    return p.status && t(p.status.toLowerCase() as TK);
            }
        },
    },
    manufacturer: {
        labelTK: TK.manufacturer,
        columnName: 'manufacturer',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
    },
    maNumber: {
        labelTK: TK.maNumber,
        columnName: 'maNumber',
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
    notes: {
        labelTK: TK.notes,
        columnName: 'notes',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 600,
    },
    retailPrice: {
        labelTK: TK.retailPrice,
        columnName: 'retailPrice',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        align: 'right',
        renderTableCell: (p, t) => (
            <Price
                title={t(TK.retailPrice)}
                priceWithoutVat={p.retailPrice}
                priceWithVat={p.retailPriceWithVat}
                currencyCode={p.currencyCode}
            />
        ),
    },
    reimbursementPrice: {
        labelTK: TK.reimbursementPrice,
        columnName: 'reimbursementPrice',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        align: 'right',
        renderTableCell: (p, t) => (
            <Price
                title={t(TK.reimbursementPrice)}
                priceWithoutVat={p.reimbursementPrice}
                priceWithVat={p.reimbursementPriceWithVat}
                currencyCode={p.currencyCode}
            />
        ),
    },
    wholesalePrice: {
        labelTK: TK.wholesalePrice,
        columnName: 'wholesalePrice',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        align: 'right',
        renderTableCell: (p, t) => (
            <Price
                title={t(TK.wholesalePrice)}
                priceWithoutVat={p.wholesalePrice}
                priceWithVat={p.wholesalePriceWithVat}
                currencyCode={p.currencyCode}
            />
        ),
    },
    factoryPrice: {
        labelTK: TK.factoryPrice,
        columnName: 'factoryPrice',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        align: 'right',
        renderTableCell: (p, t) => (
            <Price
                title={t(TK.factoryPrice)}
                priceWithoutVat={p.factoryPrice}
                priceWithVat={p.factoryPriceWithVat}
                currencyCode={p.currencyCode}
            />
        ),
    },
    exFactoryPrice: {
        labelTK: TK.exFactoryPrice,
        columnName: 'exFactoryPrice',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        align: 'right',
        renderTableCell: (p, t) => (
            <Price
                title={t(TK.exFactoryPrice)}
                priceWithoutVat={p.exFactoryPrice}
                priceWithVat={p.exFactoryPriceWithVat}
                currencyCode={p.currencyCode}
            />
        ),
    },
    productCode: {
        labelTK: TK.productCode,
        columnName: 'productCode',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
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
    scrapingOriginId: {
        labelTK: TK.scrapingOriginId,
        columnName: 'scrapingOriginId',
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
};

export const columnsArray: ProductColumnDefinition[] = Object.values(columns) as ProductColumnDefinition[];
