import * as React from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition } from '../../components/Table/types';
import { Supplier } from '../../models/Supplier';
import ReactCountryFlag from 'react-country-flag';
import { FiltersKey } from './SuppliersFilters/types';
import { SupplierState } from '../../models/SupplierState';
import { SupplierType } from '../../models/SupplierType';
import StarIcon from '@material-ui/icons/Star';
import { Tooltip } from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import { Clear, Check, VerifiedUser, LocalShipping, Colorize, Business, Explore } from '@material-ui/icons';
import { FaIndustry } from "react-icons/fa";
import { IconStyle } from './SuppliersFilters/styled';

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
        renderTableCell: p =>
            <span>
                <ReactCountryFlag svg countryCode={p.countryCode} />
                <span> {p.country}</span>
            </span>,
    },
    name: {
        labelTK: TK.name,
        columnName: 'name',
        filterKey: FiltersKey.Name,
        canBeSorted: true,
        canBeFiltered: true,
        renderTableCell: p => <span style={{ fontWeight: 'bold' }}>{p.name}</span>,
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
        getCellValue: p => p.contacts ? p.contacts.map(c => `${c.name} (${c.email})`).join(', ') : '',
        renderTableCell: p => {
            if (!p.contacts || !p.contacts.length) return <></>;

            const stared = p.contacts.filter((c) => c.isStared);

            const email1 = stared.length ? stared[0] : p.contacts[0];
            const email2 = stared.length > 1 ? stared[1] : stared.length ? null : p.contacts[1];
            const showArray = [email1, email2].filter(x => x);

            return (<Tooltip
                title={p.contacts.map((c) => (
                    <p key={c.email}>
                        {c.name} ({c.email}){c.isStared && <StarIcon style={{ height: 12 }} />}
                    </p>
                ))}
            >
                <span>
                    {showArray.map((c) => c && (
                        <span key={c.email}>
                            {c.isStared && <StarIcon />}
                            &nbsp;{c.name}
                        </span>
                    ))}
                    &nbsp;
                    {p.contacts.length > 1 ? `(+${p.contacts.length - 1})` : ''}
                </span>
            </Tooltip>);
        },
    },
    classification: {
        labelTK: TK.classification,
        columnName: 'classification',
        canBeSorted: true,
        canBeFiltered: true,
        renderTableCell: p => (
            <Tooltip title={p.classification}>
                <span>
                    <Rating
                        max={3}
                        value={(p.classification == 3) ? 1
                            : (p.classification == 1) ? 3
                                : (p.classification == 2) ? 2
                                    : 0}
                        precision={0.5} readOnly />
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
        renderTableCell: p => {
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
                    <span>
                        {IconPicker(p.type)}
                    </span>
                </Tooltip>
            )
        },
    },
    isEurope: {
        labelTK: TK.isEurope,
        columnName: 'isEurope',
        canBeSorted: true,
        canBeFiltered: true,
        //  getCellValue: p => (p.isEurope ? 'Yes' : 'No'),
        renderTableCell: p => {
            return (p.isEurope ? <Check /> : <Clear />)
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
