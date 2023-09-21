import * as React from 'react';
import { ITranslate } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition, ColumnTypeTemplate } from '../../components/Table/types';
import { Shortage } from '../../models/Shortage';
import ReactCountryFlag from 'react-country-flag';
import { ProductStatus } from '../../models/ProductStatus';
import moment from 'moment';
import { DateTimeFormat, DateFormat } from '../../components/Table/DataTypeFormatter';

export interface ShortageColumnDefinition extends ColumnDefinition<Shortage> {
    renderDetails?: (data: Shortage, t: ITranslate<TK>) => string | React.ReactNode;
}

export interface Columns {
    country: ShortageColumnDefinition;
    active: ShortageColumnDefinition;
    type: ShortageColumnDefinition;
    start: ShortageColumnDefinition;
    end: ShortageColumnDefinition;
    notes: ShortageColumnDefinition;
    scrapingOrigin: ShortageColumnDefinition;
    lastUpdate: ShortageColumnDefinition;

    product_name: ShortageColumnDefinition;
    product_code: ShortageColumnDefinition;
    product_activeSubstances: ShortageColumnDefinition;
    product_atc: ShortageColumnDefinition;
    product_drugForm: ShortageColumnDefinition;
    product_strength: ShortageColumnDefinition;
    product_package: ShortageColumnDefinition;
    product_status: ShortageColumnDefinition;
    product_manufacturer: ShortageColumnDefinition;
    product_maNumber: ShortageColumnDefinition;
    product_maHolder: ShortageColumnDefinition;
    product_notes: ShortageColumnDefinition;
}

export const columns: Columns = {
    country: {
        labelTK: TK.country,
        columnName: 'country',
        defaultWidth: 100,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        // eslint-disable-next-line react/display-name
        renderTableCell: (s) => (
            <span>
                <ReactCountryFlag svg countryCode={s.countryCode} />
                <span> {s.country}</span>
            </span>
        ),
    },
    active: {
        labelTK: TK.active,
        columnName: 'isActive',
        templateType: ColumnTypeTemplate.Bool,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
        renderTableCell: (s, t) => (s.isActive ? t(TK.yes) : t(TK.no)),
    },
    type: {
        labelTK: TK.type,
        columnName: 'type',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
    },
    start: {
        labelTK: TK.start,
        columnName: 'start',
        templateType: ColumnTypeTemplate.Date,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
        renderTableCell: (s) => moment(s.start).format(DateFormat),
    },
    end: {
        labelTK: TK.end,
        columnName: 'end',
        templateType: ColumnTypeTemplate.Date,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
        renderTableCell: (s) => (s.end ? moment(s.end).format(DateFormat) : undefined),
    },
    notes: {
        labelTK: TK.notes,
        columnName: 'additionalNotes',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 200,
    },
    scrapingOrigin: {
        labelTK: TK.scrapingOrigin,
        columnName: 'scrapingOrigin',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 120,
    },
    lastUpdate: {
        labelTK: TK.lastUpdate,
        columnName: 'lastUpdate',
        templateType: ColumnTypeTemplate.DateTime,
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        renderTableCell: (s) => moment(s.lastUpdate).format(DateTimeFormat),
    },

    // Product
    product_name: {
        labelTK: TK.name,
        columnName: 'product.name',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.name : undefined),
        renderTableCell: (s) => s.product && <span style={{ fontWeight: 'bold' }}>{s.product.name}</span>,
    },
    product_code: {
        labelTK: TK.productCode,
        columnName: 'product.productCode',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
        getCellValue: (s) => (s.product ? s.product.productCode : undefined),
    },
    product_activeSubstances: {
        labelTK: TK.activeSubstances,
        columnName: 'product.activeSubstances',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) =>
            s.product && s.product.activeSubstances ? s.product.activeSubstances.join(', ') : undefined,
    },
    product_atc: {
        labelTK: TK.atc,
        columnName: 'product.atc',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        defaultWidth: 100,
        getCellValue: (s) => (s.product ? s.product.atc : undefined),
    },
    product_drugForm: {
        labelTK: TK.drugForm,
        columnName: 'product.drugForm',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.drugForm : undefined),
    },
    product_strength: {
        labelTK: TK.strength,
        columnName: 'product.strength',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.strength : undefined),
    },
    product_package: {
        labelTK: TK.package,
        columnName: 'product.package',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.package : undefined),
    },
    product_status: {
        labelTK: TK.status,
        columnName: 'product.status',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.status : undefined),
        renderTableCell: (s, t) => {
            if (!s.product) return undefined;
            switch (s.product.status) {
                case ProductStatus.Discontinued:
                    return <span style={{ color: '#eb4034' }}>{t(TK.discontinued)}</span>;
                default:
                    return s.product.status && t(s.product.status.toLowerCase() as TK);
            }
        },
    },
    product_manufacturer: {
        labelTK: TK.manufacturer,
        columnName: 'product.manufacturer',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.manufacturer : undefined),
    },
    product_maNumber: {
        labelTK: TK.maNumber,
        columnName: 'product.maNumber',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.maNumber : undefined),
    },
    product_maHolder: {
        labelTK: TK.maHolder,
        columnName: 'product.maHolder',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.maHolder : undefined),
    },
    product_notes: {
        labelTK: TK.productNotes,
        columnName: 'product.notes',
        canBeSorted: true,
        canBeFiltered: true,
        canBeGrouped: true,
        getCellValue: (s) => (s.product ? s.product.notes : undefined),
    },
};

export const columnsArray: ShortageColumnDefinition[] = Object.values(columns) as ShortageColumnDefinition[];
