import * as React from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition as AGColumnDefinition } from '../../components/AGTable/types';
import { ColumnDefinition } from '../../components/Table/types';
import { AGSupplier, Supplier } from '../../models/Supplier';
import ReactCountryFlag from 'react-country-flag';
import { FiltersKey } from './SuppliersFilters/types';
import { SupplierState } from '../../models/SupplierState';
import { SupplierType } from '../../models/SupplierType';
import StarIcon from '@material-ui/icons/Star';
import { Tooltip } from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import { Clear, Check, VerifiedUser, LocalShipping, Colorize, Business, Explore } from '@material-ui/icons';
import { FaIndustry } from 'react-icons/fa';
import { IconStyle } from './SuppliersFilters/styled';
import moment from 'moment';
import { useTranslations } from '../../store/Translations/hooks';

export const columnsAGArray: AGColumnDefinition<AGSupplier>[] = [
    {
        headerName: TK.id,
        field: 'id',
        hide: true,
    },
    {
        headerName: TK.country,
        field: 'country',
        minWidth: 150,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        // eslint-disable-next-line react/display-name
        valueGetter: (p) => p.data.country,
        cellRenderer: (p) => (
            <span>
                <ReactCountryFlag svg countryCode={p.data.countryCode} />
                <span> {p.data.country}</span>
            </span>
        ),
    },
    {
        headerName: TK.name,
        field: 'name',
        minWidth: 120,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellRenderer: (p) => <span style={{ fontWeight: 'bold' }}>{p.data.name}</span>,
    },
    {
        headerName: TK.status,
        field: 'status',
        minWidth: 120,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellRenderer: (p) => {
            switch (p.data.state) {
                case SupplierState.Suspended:
                    return <span style={{ color: '#eb4034', textTransform: 'capitalize' }}>{TK.suspended}</span>;
                case SupplierState.Qualified:
                    return <span style={{ color: '#5ce322', textTransform: 'capitalize' }}>{TK.qualified}</span>;
                case SupplierState.Qualify:
                    return <span style={{ color: '#e28c0a', textTransform: 'capitalize' }}>{TK.qualify}</span>;
                default:
                    return p.data.state && SupplierState[p.data.state];
            }
        },
    },
    {
        headerName: TK.contacts,
        field: 'contacts',
        minWidth: 250,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        valueGetter: (p) => (p.data.contacts ? p.data.contacts.map((c) => `${c.name} (${c.email})`).join(', ') : ''),
        cellRenderer: (p) => {
            if (!p.data.contacts || !p.data.contacts.length) return <></>;

            const stared = p.data.contacts.filter((c) => c.isStared);

            const email1 = stared.length ? stared[0] : p.data.contacts[0];
            const email2 = stared.length > 1 ? stared[1] : stared.length ? null : p.data.contacts[1];
            const showArray = [email1, email2].filter((x) => x);

            return (
                <Tooltip
                    title={p.data.contacts.map((c) => (
                        <p key={c.email}>
                            {c.name} ({c.email}){c.isStared && <StarIcon style={{ height: 12 }} />}
                        </p>
                    ))}
                >
                    <span>
                        {showArray.map(
                            (c) =>
                                c && (
                                    <span key={c.email}>
                                        {c.isStared && <StarIcon />}
                                        &nbsp;{c.name}
                                    </span>
                                ),
                        )}
                        &nbsp;
                        {p.data.contacts.length > 1 ? `(+${p.data.contacts.length - 1})` : ''}
                    </span>
                </Tooltip>
            );
        },
    },
    {
        headerName: TK.classification,
        minWidth: 150,
        field: 'classification',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellRenderer: (p) => (
            <Tooltip title={p.data.classification}>
                <span>
                    <Rating
                        max={3}
                        value={
                            p.data.classification == 3
                                ? 1
                                : p.data.classification == 1
                                ? 3
                                : p.data.classification == 2
                                ? 2
                                : 0
                        }
                        precision={0.5}
                        readOnly
                    />
                </span>
            </Tooltip>
        ),
    },
    {
        headerName: TK.type,
        field: 'type',
        minWidth: 120,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },

        //getCellValue: p => p.data.type && SupplierType[p.data.type],
        cellRenderer: (p) => {
            if (!p.data.type || !p.data.type.length) return <></>;
            const classes = IconStyle();

            let IconPicker = (p: SupplierType) => {
                switch (p) {
                    case SupplierType.AimOwner:
                        return <VerifiedUser />;
                    case SupplierType.Distributor:
                        return <Explore />;
                    case SupplierType.GenericLaboratory:
                        return <Colorize />;
                    case SupplierType.Mah:
                        return <Business />;
                    case SupplierType.Manufacturer:
                        return <FaIndustry className={classes.IndustryIcon} />;
                    case SupplierType.Wholesaler:
                        return <LocalShipping />;
                    case SupplierType.DesignatedWholesaler:
                        return <LocalShipping />;
                }
            };

            return (
                <Tooltip title={SupplierType[p.data.type]}>
                    <span>{IconPicker(p.data.type)}</span>
                </Tooltip>
            );
        },
    },
    {
        headerName: TK.notes,
        field: 'notes',
        minWidth: 400,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
    },
    {
        headerName: TK.expiryDateSupplier,
        field: 'expirationDate',
        minWidth: 170,
        cellRenderer: (p) => {
            return <span>{moment(p.data.expirationDate).format('DD-MM-YYYY')}</span>;
        },
    },
    {
        headerName: TK.creationDateSupplier,
        field: 'creationDate',
        minWidth: 170,
        cellRenderer: (p) => {
            return <span>{moment(p.data.creationDate).format('DD-MM-YYYY')}</span>;
        },
    },
];

export interface SupplierColumnDefinition extends ColumnDefinition<Supplier> {
    filterKey?: FiltersKey;
}

export interface Columns {
    country: SupplierColumnDefinition;
    name: SupplierColumnDefinition;
    status: SupplierColumnDefinition;
    id: SupplierColumnDefinition;
    type: SupplierColumnDefinition;
    isEurope: SupplierColumnDefinition;
    classification: SupplierColumnDefinition;
    notes: SupplierColumnDefinition;
    contacts: SupplierColumnDefinition;
    lastVerification: SupplierColumnDefinition;
    expirationDate: SupplierColumnDefinition;
    creationDate: SupplierColumnDefinition;
}

export const columns: Columns = {
    id: {
        labelTK: TK.id,
        columnName: 'id',
    },
    country: {
        labelTK: TK.country,
        columnName: 'country',
        filterKey: FiltersKey.Countries,
        defaultWidth: 100,
        canBeSorted: true,
        canBeFiltered: true,
        // eslint-disable-next-line react/display-name
        renderTableCell: (p) => (
            <span>
                <ReactCountryFlag svg countryCode={p.countryCode} />
                <span> {p.country}</span>
            </span>
        ),
    },
    name: {
        labelTK: TK.name,
        columnName: 'name',
        filterKey: FiltersKey.Name,
        canBeSorted: true,
        canBeFiltered: true,
        renderTableCell: (p) => <span style={{ fontWeight: 'bold' }}>{p.name}</span>,
    },
    status: {
        labelTK: TK.status,
        columnName: 'status',
        filterKey: FiltersKey.Statuses,
        canBeSorted: true,
        canBeFiltered: true,
        renderTableCell: (p, t) => {
            switch (p.state) {
                case SupplierState.Suspended:
                    return <span style={{ color: '#eb4034' }}>{t(TK.suspended)}</span>;
                case SupplierState.Qualified:
                    return <span style={{ color: '#5ce322' }}>{t(TK.qualified)}</span>;
                case SupplierState.Qualify:
                    return <span style={{ color: '#e28c0a' }}>{t(TK.qualify)}</span>;
                default:
                    return p.state && SupplierState[p.state];
            }
        },
    },
    contacts: {
        labelTK: TK.contacts,
        columnName: 'contacts',
        canBeSorted: true,
        canBeFiltered: true,
        getCellValue: (p) => (p.contacts ? p.contacts.map((c) => `${c.name} (${c.email})`).join(', ') : ''),
        renderTableCell: (p) => {
            if (!p.contacts || !p.contacts.length) return <></>;

            const stared = p.contacts.filter((c) => c.isStared);

            const email1 = stared.length ? stared[0] : p.contacts[0];
            const email2 = stared.length > 1 ? stared[1] : stared.length ? null : p.contacts[1];
            const showArray = [email1, email2].filter((x) => x);

            return (
                <Tooltip
                    title={p.contacts.map((c) => (
                        <p key={c.email}>
                            {c.name} ({c.email}){c.isStared && <StarIcon style={{ height: 12 }} />}
                        </p>
                    ))}
                >
                    <span>
                        {showArray.map(
                            (c) =>
                                c && (
                                    <span key={c.email}>
                                        {c.isStared && <StarIcon />}
                                        &nbsp;{c.name}
                                    </span>
                                ),
                        )}
                        &nbsp;
                        {p.contacts.length > 1 ? `(+${p.contacts.length - 1})` : ''}
                    </span>
                </Tooltip>
            );
        },
    },
    classification: {
        labelTK: TK.classification,
        columnName: 'classification',
        canBeSorted: true,
        canBeFiltered: true,
        renderTableCell: (p) => (
            <Tooltip title={p.classification}>
                <span>
                    <Rating
                        max={3}
                        value={p.classification == 3 ? 1 : p.classification == 1 ? 3 : p.classification == 2 ? 2 : 0}
                        precision={0.5}
                        readOnly
                    />
                </span>
            </Tooltip>
        ),
    },

    type: {
        labelTK: TK.type,
        columnName: 'type',
        canBeSorted: true,
        canBeFiltered: true,
        //getCellValue: p => p.type && SupplierType[p.type],
        renderTableCell: (p) => {
            if (!p.type || !p.type.length) return <></>;
            const classes = IconStyle();

            let IconPicker = (p: SupplierType) => {
                switch (p) {
                    case SupplierType.AimOwner:
                        return <VerifiedUser />;
                    case SupplierType.Distributor:
                        return <Explore />;
                    case SupplierType.GenericLaboratory:
                        return <Colorize />;
                    case SupplierType.Mah:
                        return <Business />;
                    case SupplierType.Manufacturer:
                        return <FaIndustry className={classes.IndustryIcon} />;
                    case SupplierType.Wholesaler:
                        return <LocalShipping />;
                    case SupplierType.DesignatedWholesaler:
                        return <LocalShipping />;
                }
            };

            return (
                <Tooltip title={SupplierType[p.type]}>
                    <span>{IconPicker(p.type)}</span>
                </Tooltip>
            );
        },
    },
    isEurope: {
        labelTK: TK.isEurope,
        columnName: 'isEurope',
        canBeSorted: true,
        canBeFiltered: true,
        //  getCellValue: p => (p.isEurope ? 'Yes' : 'No'),
        renderTableCell: (p) => {
            return p.isEurope ? <Check /> : <Clear />;
        },
    },
    notes: {
        labelTK: TK.notes,
        columnName: 'notes',
        canBeSorted: true,
        canBeFiltered: true,
        defaultWidth: 600,
    },
    expirationDate: {
        labelTK: TK.expiryDate,
        columnName: 'expirationDate',
    },
    lastVerification: {
        labelTK: TK.lastVerification,
        columnName: 'lastVerification',
    },
    creationDate: {
        labelTK: TK.creationDate,
        columnName: 'creationDate',
    },
};

export const columnsArray: SupplierColumnDefinition[] = Object.values(columns) as SupplierColumnDefinition[];
