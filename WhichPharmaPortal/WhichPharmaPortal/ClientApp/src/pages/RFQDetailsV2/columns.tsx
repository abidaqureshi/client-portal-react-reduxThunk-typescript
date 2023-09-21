import * as React from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition, ColumnTypeTemplate } from '../../components/AGTable/types';
import { parseEuDecimalToDecimal, parseNumber } from '../../utils/utils';
import { RFQQuoteV2 } from '../../models/RFQQuote';
import { RFQQuoteChip } from '../../components/RFQQuoteAvatar';
import moment from 'moment';
import { DateTimeFormat } from '../../components/Table/DataTypeFormatter';
import { IconStyle } from '../SuppliersListV3/SuppliersFilters/styled';
import { SupplierType } from '../../models/SupplierType';
import { Business, Colorize, Explore, LocalShipping, VerifiedUser } from '@material-ui/icons';
import { FaIndustry } from 'react-icons/fa';
import { Tooltip } from '@material-ui/core';
import HttpIcon from '@material-ui/icons/Http';
import { RFQQuoteState } from '../../models/RFQQuoteState';
import { BarGraph } from './BarGraph';
import AGEditableCommentsRenderer from './AGEditableCommentsRender';
import AGEditableCellRender from './AGEditableCellRender';
import AGEditableExpDateRender from './AGEditableExpDateRender';
import { DocCell } from '../../components/AGTable/CellFormatter';
import { useSelector } from 'react-redux';
import { getMyRoles } from '../../store/Users/selectors';
import { HttpReplyForm } from './HttpReplyForm';

export const columns: ColumnDefinition<any>[] = [
    {
        headerName: 'country',
        field: 'country',
        hide: true,
    },
    {
        headerName: 'id',
        field: 'id',
        hide: true,
    },
    {
        headerName: 'supplierId',
        field: 'supplierId',
        hide: true,
    },
    {
        headerName: TK.status,
        field: 'state',
        headerClass: 'agrid-column-rfq-quotes-status-pl agrid-column-rfq-quotes-status-pr',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        headerCheckboxSelection: true,
        checkboxSelection: true,

        cellStyle: { display: 'flex', paddingLeft: '9px' },
        minWidth: 120,
        pinned: 'left',
        cellRenderer: (row: RFQQuoteV2) => <RFQQuoteChip state={row.data.state} size="medium" />,
    },
    {
        headerName: TK.creationDate,
        minWidth: 180,
        field: 'creationDate',
        pinned: 'left',
        templateType: ColumnTypeTemplate.DateTime,
        hide: false,
        cellRenderer: (p) => (p.data.creationDate ? moment(p.data.creationDate).format(DateTimeFormat) : '-'),
    },
    {
        headerName: TK.supplier,
        minWidth: 110,

        pinned: 'left',
        field: 'supplier',

        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },

        cellStyle: { display: 'flex' },
        valueGetter: (row) => row.data.supplier,
        cellRenderer: (row) => (
            <>
                {/* <Tooltip title={`(${row.data.country.code})`}>
                    <div style={{ display: 'inline' }}>
                        <CountryFlag
                            country={`(${row.data.country.code})`}
                            hideName={true}
                            countryCode={row.data.country.code}
                        />
                    </div>
                </Tooltip> */}

                <Tooltip title={row.data.supplier}>
                    <span style={{ marginLeft: '3px' }}>
                        {row.data.supplier.length > 12 ? row.data.supplier.substr(0, 10) + '. .' : row.data.supplier}
                    </span>
                </Tooltip>
            </>
        ),
    },
    {
        headerName: TK.countryOfOrigin,
        minWidth: 100,
        sort: 'asc',
        pinned: 'left',
        headerClass: 'agrid-column-rfq-quotes-origin-pr',
        field: 'countryOfOrigin',
        cellStyle: { marginTop: '0px' },

        hide: false,
        valueGetter: (row) => (row.data.countryOfOrigin ? row.data.countryOfOrigin : row.data.country.name),
    },
    {
        headerName: TK.precForStorage,
        minWidth: 100,
        pinned: 'left',
        headerClass: 'agrid-column-rfq-quotes-origin-pr',
        field: 'precautionsForStorage',
        cellStyle: { marginTop: '0px' },
        hide: false,
    },
    {
        headerName: TK.type,
        field: 'type',
        minWidth: 60,
        pinned: 'left',
        hide: true,
        headerClass: 'agrid-column-rfq-quotes-type-pr',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellRenderer: (row) => {
            if (!row.data.type || !row.data.type.length) return <></>;
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
                <Tooltip title={SupplierType[row.data.type as SupplierType]}>
                    <div>{IconPicker(row.data.type)}</div>
                </Tooltip>
            );
        },
    },
    {
        headerName: TK.productDescription,
        minWidth: 150,
        field: 'name',
        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
    },
    {
        headerName: TK.productCode,
        minWidth: 120,
        field: 'productCode',
        hide: false,
    },
    {
        headerName: TK.maHolder,
        minWidth: 120,
        field: 'maHolder',
        hide: false,
        valueGetter: (row) => row.data.maHolder,
    },
    {
        headerName: TK.package,
        minWidth: 130,
        field: 'packSize',
        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
        valueGetter: (row) => row.data.packSize || row.data.package,
    },

    {
        headerName: TK.unUsed,
        minWidth: 120,
        field: 'unitQuant',
        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        hide: true,
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
    },
    {
        headerName: TK.unitQuant,
        minWidth: 130,
        field: 'packsTotal',
        cellStyle: { marginTop: '0px' },
        hide: false,
        comparator: (valueA: number, valueB: number, nodeA: any, nodeB: any, isInverted: any) => {
            return valueA - valueB;
        },
        valueGetter: (row) =>
            Math.ceil(
                (parseNumber(row.data.unitQuant) || 0) / (parseNumber(row.data.packSize || row.data.package) || 1),
            ).toString(),
    },
    {
        headerName: TK.availabilityPacks,
        minWidth: 125,
        field: 'availabilityPacks',

        editable: (row: RFQQuoteV2) => row.data.state === RFQQuoteState.Open,
        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        cellRenderer: AGEditableCellRender,
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
    },

    {
        headerName: TK.availabilityVisuals,
        minWidth: 140,
        field: 'availabilityPacks',
        cellStyle: { marginTop: '0px' },
        cellRenderer: (row: RFQQuoteV2) => <BarGraph item={row} />,
    },
    {
        headerName: TK.retailPrice,
        minWidth: 140,
        field: 'retailPrice',
        cellRenderer: (row) => `${parseEuDecimalToDecimal(row.data.retailPrice) || 0} €`,
    },

    {
        headerName: TK.exwNetPriceEuro,
        minWidth: 140,
        field: 'exwNetPriceEuro',
        editable: (row: RFQQuoteV2) => row.data.state === RFQQuoteState.Open,

        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
        comparator: (valueA: number, valueB: number, nodeA: any, nodeB: any, isInverted: any) => {
            let unitValueA = parseEuDecimalToDecimal(nodeA.data.exwNetPriceEuro) || 0;

            let unitValueB = parseEuDecimalToDecimal(nodeB.data.exwNetPriceEuro) || 0;

            return unitValueA - unitValueB;
        },
        cellRenderer: AGEditableCellRender,
    },
    {
        headerName: TK.unitPrice,
        minWidth: 130,
        field: 'unitPrice',
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellStyle: { marginTop: '0px' },
        cellClass: (params) => {
            let price = 0;
            if (params.data.state === RFQQuoteState.Quoted) {
                price =
                    (parseEuDecimalToDecimal(params.data.priceCurrencyToEuro) || 0) /
                    (parseNumber(params.data.packSize || params.data.package) || 1);
            }

            if (params.data.state === RFQQuoteState.Open) {
                price =
                    (parseEuDecimalToDecimal(params.data.exwNetPriceEuro) || 0) /
                    (parseNumber(params.data.packSize || params.data.package) || 1);
            }

            if (price == params.data.maxUnitPrice && price > 0) {
                return 'max-item';
            } else if (price == params.data.minUnitPrice && price > 0) {
                return 'min-item';
            } else if (price > params.data.minUnitPrice && price < params.data.averageUnitPrice) {
                return 'below-average-item';
            } else if (price >= params.data.averageUnitPrice && price < params.data.maxUnitPrice) {
                return 'above-average-item';
            }
            return '';
        },
        comparator: (valueA: number, valueB: number, nodeA: any, nodeB: any, isInverted: any) => {
            let unitValueA = 0;
            unitValueA =
                (parseEuDecimalToDecimal(nodeA.data.priceCurrencyToEuro) || 0) /
                (parseNumber(nodeA.data.packSize || nodeA.data.package) || 1);
            let unitValueB = 0;
            unitValueB =
                (parseEuDecimalToDecimal(nodeB.data.priceCurrencyToEuro) || 0) /
                (parseNumber(nodeB.data.packSize || nodeB.data.package) || 1);

            // let unitValueA =
            //     (parseEuDecimalToDecimal(nodeA.data.exwNetPriceEuro) || 0) /
            //     (parseNumber(nodeA.data.packSize || nodeA.data.package) || 1);
            // let unitValueB =
            //     (parseEuDecimalToDecimal(nodeB.data.exwNetPriceEuro) || 0) /
            //     (parseNumber(nodeB.data.packSize || nodeB.data.package) || 1);
            return unitValueA - unitValueB;
        },
        cellRenderer: (row) =>
            //`${row.data.priceCurrencyToEuro / (parseNumber(row.data.packSize || row.data.package) || 1)} €`,
            row.data.state === RFQQuoteState.Quoted
                ? `${(
                      (parseEuDecimalToDecimal(row.data.priceCurrencyToEuro) || 0) /
                      (parseNumber(row.data.packSize || row.data.package) || 1)
                  ).toFixed(2)} €`
                : `${(
                      (parseEuDecimalToDecimal(row.data.exwNetPriceEuro) || 0) /
                      (parseNumber(row.data.packSize || row.data.package) || 1)
                  ).toFixed(2)} €`,
    },
    {
        headerName: TK.leadTimeToDeliver,
        minWidth: 100,
        field: 'leadTimeToDeliver',
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        editable: (row: RFQQuoteV2) => row.data.state === RFQQuoteState.Open,
        cellRenderer: AGEditableCellRender,
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellClass: (params) => {
            let leadTime = parseInt(params.data.leadTimeToDeliver);

            if (leadTime == params.data.maxLeadTime && leadTime > 0) {
                return 'max-item';
            } else if (leadTime == params.data.minLeadTime && leadTime > 0) {
                return 'min-item';
            } else if (leadTime > params.data.minLeadTime && leadTime < params.data.averageLeadTime) {
                return 'below-average-item';
            } else if (leadTime >= params.data.averageUnitPrice && leadTime < params.data.maxLeadTime) {
                return 'above-average-item';
            }
            return '';
        },
        comparator: (valueA: number, valueB: number, nodeA: any, nodeB: any, isInverted: any) => {
            if (nodeA.data.leadTimeToDeliver && nodeB.data.leadTimeToDeliver) {
                return parseInt(nodeA.data.leadTimeToDeliver) - parseInt(nodeB.data.leadTimeToDeliver);
            }
            return 0;
        },

        cellStyle: { marginTop: '0px' },
    },
    {
        headerName: TK.expDate,
        minWidth: 110,
        field: 'expDate',
        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        editable: (row: RFQQuoteV2) => row.data.state === RFQQuoteState.Open,
        cellRenderer: AGEditableExpDateRender,
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellClass: (params) => {
            if (params.data.expDate) {
                //front-end expects the date should come in this format MM/YYYY from back-end

                const dateChunk = params.data.expDate.split('/');
                if (dateChunk[0] <= 12) {
                    const dateStamp = moment(dateChunk[1] + '/' + dateChunk[0]);
                    const now = moment();

                    if (dateStamp.diff(now, 'months') <= 6) {
                        return 'max-item';
                    }
                    if (dateStamp.diff(now, 'months') > 6 && dateStamp.diff(now, 'months') <= 12) {
                        return 'above-average-item';
                    }

                    if (dateStamp.diff(now, 'months') > 12 && dateStamp.diff(now, 'months') <= 24) {
                        return 'below-average-item';
                    }
                    if (dateStamp.diff(now, 'months') > 24) {
                        return 'min-item';
                    }
                } else {
                    console.log(' the date is in invalid format ', params.data.expDate);
                }
            }

            return '';
        },

        valueFormatter: (params) => {
            if (!params.value) {
                return 'MM/YYYY';
            }

            return params.value;
        },
        valueSetter: (params) => {
            if (params.newValue === '') {
                params.data.expDate = params.newValue;
                return true;
            }

            if (!/^\d{2}\/\d{4}$/.test(params.newValue)) {
                return false;
            }

            params.data.expDate = params.newValue;
            params.newValue = params.data.expDate;
            // params.node.data.expDate = params.newValue;
            //params.node.setDataValue('expDate', params.newValue);
            return true;
        },
    },
    {
        headerName: TK.comments,
        minWidth: 140,
        field: 'comments',

        cellStyle: { marginTop: '0px' },
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        editable: (row: RFQQuoteV2) => row.data.state === RFQQuoteState.Open,
        cellRenderer: AGEditableCommentsRenderer,
        filterParams: {
            textMatcher: ({ filter, value, filterText }) => {
                const filterTextLowerCase = filterText.toLowerCase().trim();
                const valueLowerCase = value.toString().toLowerCase();
                if (filterTextLowerCase.indexOf(' ') > -1) {
                    let words = filterTextLowerCase.split(' ');
                    let matched = 0;

                    for (let i = 0; i < words.length; i++) {
                        if (words[i]?.length >= 1 && valueLowerCase.indexOf(String(words[i])) > -1) {
                            matched++;
                        }
                    }

                    if (matched === words.length) {
                        return true;
                    }
                } else if (valueLowerCase.indexOf(filterTextLowerCase) > -1) {
                    return true;
                }
                return false;
            },
            buttons: ['reset'],
            closeOnApply: true,
        },

        // cellRenderer: (row) =>
        //     row.data.comments && row.data.comments.length > 0 ? (
        //         <Tooltip title={row.data.comments}>
        //             <div>{row.data.comments.substr(0, 12) + '...'}</div>
        //         </Tooltip>
        //     ) : (
        //         ''
        //     ),
    },
    {
        headerName: TK.updatedBy,
        minWidth: 140,
        field: 'updatedBy',

        cellRenderer: (p) =>
            p.data.updatedBy?.startsWith('supplier') ? 'Supplier' : p.data.updatedBy ? p.data.updatedBy : '-',
    },
    {
        headerName: TK.lastUpdate,
        minWidth: 180,
        field: 'lastUpdateDate',

        templateType: ColumnTypeTemplate.DateTime,

        cellRenderer: (p) => (p.data.lastUpdateDate ? moment(p.data.lastUpdateDate).format(DateTimeFormat) : '-'),
    },
    {
        headerName: TK.documents,
        colId: 'documentsUrls',
        field: 'documents',
        minWidth: 130,
        wrapText: true,
        cellRenderer: (row) => <DocCell rowData={row} />,
    },
    {
        headerName: TK.supplierReply,
        colId: 'httpUrls',
        field: 'supplierReplyForm',
        minWidth: 130,
        wrapText: true,
        cellRenderer: (row) => <HttpReplyForm item={row} />,
    },
    {
        headerName: TK.totalPrice,
        minWidth: 120,
        field: 'totalPrice',
        cellStyle: { marginTop: '9px' },
        hide: true,
        valueGetter: (row) => (parseNumber(row.data.exwNetPriceEuro) || 0) * (parseNumber(row.data.unitQuant) || 0),
        cellRenderer: (row) =>
            `${(parseNumber(row.data.exwNetPriceEuro) || 0) * (parseNumber(row.data.unitQuant) || 0)} €`,
    },

    {
        headerName: TK.contacts,
        minWidth: 300,
        field: 'contacts',
        hide: true,
    },
    {
        headerName: TK.rfqNr,
        minWidth: 120,
        field: 'rfqNr',
        hide: true,
    },

    {
        headerName: TK.activeSubstances,
        minWidth: 120,
        field: 'activeSubstances',
        hide: true,
    },

    {
        headerName: TK.id,
        minWidth: 65,
        field: 'id',
        hide: true,
    },
    {
        headerName: TK.createdBy,
        minWidth: 120,
        field: 'createdBy',
        hide: true,

        valueGetter: (p) => (p.data.createdBy?.startsWith('supplier') ? 'Supplier' : p.data.createdBy),
    },
];
