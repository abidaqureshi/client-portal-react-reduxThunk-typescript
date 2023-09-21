import * as React from 'react';
import moment from 'moment';
import { Chip } from '@material-ui/core';
import { Link } from 'react-router-dom';

import { TK } from '../../store/Translations/translationKeys';
import { ColumnDefinition } from '../../components/AGTable/types';
import { Product } from '../../models/Product';
import ShortageInfo from '../../components/Shortage';
import { ShortageType } from '../../models/ShortageType';
import CountryFlag from '../../components/CountryFlag';
import { DateTimeFormat } from '../../components/AGTable/DataTypeFormater';

import {
    DocCell,
    Administration,
    YesNo,
    PharmaCell,
    PriceCell,
    Cell,
    AdditionalInformation,
    NameCell,
    ActiveSubtanceCell,
} from '../../components/AGTable/CellFormatter';
import { excerptText } from '../../utils/utils';

export const columnsArray: ColumnDefinition<Product>[] = [
    {
        field: 'country',
        headerName: TK.country,
        headerClass: 'agrid-column-country-pr',
        initialWidth: 120,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        cellStyle: { paddingRight: '20px', justifyContent: 'center' },
        wrapText: true,

        autoHeight: true,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        filter: 'agSetColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },

        valueGetter: (p) => p.data.countryName,
        cellRenderer: (p) => (
            <CountryFlag country={p.data.countryName} showCode={true} countryCode={p.data.countryCode} />
        ),
    },
    // {
    //     headerName: '',
    //     colId: 'availability',
    //     width: 30,
    //     pinned: 'left',

    //     cellRenderer: (p) => (
    //         <AvailabilityCell
    //             authorised={p.data.isAuthorised}
    //             marketed={p.data.isMarketed}
    //             shortage={p.data.shortageInfo}
    //         />
    //     ),
    // },
    {
        headerName: TK.name,
        colId: 'name',
        filter: 'agTextColumnFilter',
        sort: 'asc',
        initialWidth: 210,
        cellStyle: { paddingLeft: '2px' },
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        wrapText: true,
        autoHeight: true,
        headerClass: 'agrid-column-name_pl',
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
        valueGetter: (p) => p.data.name,
        cellRenderer: (p) => <NameCell rowData={p} />,
    },

    {
        headerName: TK.strength,
        colId: 'strength&strengthDetailed',
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        initialWidth: 120,
        wrapText: true,
        autoHeight: true,
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
        valueGetter: (p) => p.data.strength + ' ' + p.data.strengthDetailed,
        cellRenderer: (p) => {
            const { strength, id } = p.data;
            let { strengthDetailed } = p.data;
            let showMore = false;
            if (strengthDetailed && strengthDetailed.length > 10) {
                showMore = true;
                strengthDetailed = excerptText(10, strengthDetailed);
            }
            return (
                <Cell subValue={strength} lineHeight="1.2rem" marginTop="0.7rem">
                    {strengthDetailed || '-'}
                    {showMore && <Link to={(location) => ({ ...location, hash: '#' + id })}>...</Link>}
                </Cell>
            );
        },
    },
    {
        headerName: TK.pharmaceuticalForm,
        colId: 'pharmaceuticalForm&pharmaceuticalFormCategories',
        filter: 'agTextColumnFilter',
        headerTooltip: TK.pharmaceuticalForm,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],

        initialWidth: 160,
        wrapText: true,
        autoHeight: true,
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
        valueGetter: (p) =>
            p.data.pharmaceuticalFormCategories?.join('') + '' + p.data.pharmaceuticalForm ||
            p.data.pharmaceuticalForm ||
            '',
        cellRenderer: (p) => <PharmaCell rowData={p} />,
    },
    {
        headerName: TK.package,
        colId: 'package&packageDetailed',
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        initialWidth: 140,
        wrapText: true,
        autoHeight: true,
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
            return valueA - valueB;
        },
        valueGetter: (p) => p.data.packageDetailed + '' + p.data.package || 0,
        cellRenderer: (p) => (
            <Cell lineHeight="1.6rem" subValue={p.data.package}>
                {p.data.packageDetailed || '-'}
            </Cell>
        ),
    },
    {
        headerName: TK.activeSubstances,
        colId: 'activeSubstances',
        filter: 'agTextColumnFilter',
        headerTooltip: TK.activeSubstances,
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        initialWidth: 140,
        wrapText: true,
        autoHeight: true,
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
        valueGetter: (p) => (p.data.activeSubstances?.length && p.data.activeSubstances.join('')) || '',
        cellRenderer: (p) => <ActiveSubtanceCell limit={2} rowData={p} />,
    },
    {
        headerName: TK.atc,
        colId: 'atc',
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        initialWidth: 90,
        wrapText: true,
        autoHeight: true,
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
        valueGetter: (p) => p.data.atc,
        cellRenderer: (p) => {
            const { atc } = p.data;
            if (atc === null || atc === undefined) {
                return (<></>);
            }
            const atcs = atc.split('\n');
            return (<>
                <Cell lineHeight="1.2rem" marginTop="0.5rem">
                    {(atcs?.length &&
                        atcs.map((a) => {
                            return (

                                <Chip size="small" key={a} label={a} />

                            );
                        }
                        )) || ''}
                </Cell>
            </>);


        },
    },
    {
        headerName: TK.prices,
        colId: 'prices',
        initialWidth: 120,
        wrapText: true,
        autoHeight: true,
        menuTabs: [],
        cellRenderer: (p) => <PriceCell rowData={p} />,
    },
    /*     {
        headerName: 'Additional Information',
        colId:
            'isGeneric&isHospitalar&&isBiological&isParallelImport&isPrescription&isPsychotropic&isAdditionalMonitoring',
        initialWidth: 140,
        headerTooltip: 'Additional Information',
        menuTabs: [],
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) =>
            [
                p.data.isAdditionalMonitoring && 'Additional Monitoring',
                p.data.isGeneric && 'Generic',
                p.data.isPrescription && 'Prescription',
                p.data.isBiological && 'Biological',
                p.data.isParallelImport && 'Parallel import',
                p.data.isPsychotropic && 'Psychotropic',
                p.data.isHospitalar && 'Hospitlar',
                p.data.precautionsForStorage && 'Precautions For storage',
            ].join(''),
        cellRenderer: (p) => <AdditionalInformation rowData={p} />,
    }, */
    {
        headerName: TK.maHolder,
        colId: 'maHolder',
        menuTabs: ['filterMenuTab', 'generalMenuTab'],
        initialWidth: 120,
        wrapText: true,
        autoHeight: true,
        filter: 'agTextColumnFilter',
        filterParams: {
            buttons: ['reset'],
            closeOnApply: true,
        },
        cellRenderer: (p) => (
            <Cell lineHeight="1.2rem" marginTop="0.67rem">
                {' '}
                {p.data.maHolder}
            </Cell>
        ),
        valueGetter: (p) => p.data.maHolder || '',
    },
    {
        headerName: TK.documents,
        colId: 'documentsUrls',
        initialWidth: 130,
        wrapText: true,
        autoHeight: true,
        menuTabs: [],
        cellRenderer: (p) => <DocCell rowData={p} />,
    },
    {
        field: TK.statusNotes,
        hide: true,
        filter: true,
    },
    {
        field: '',
        width: 20,
        hide: true,
        autoHeight: true,
        wrapText: true,
        cellRenderer: (p) => {
            const { shortageInfo } = p.data;

            return shortageInfo ? (
                <ShortageInfo
                    start={shortageInfo?.start || ''}
                    end={shortageInfo?.end || ''}
                    isActive={shortageInfo.isActive}
                    type={ShortageType[shortageInfo?.type || ShortageType.Temporary]}
                    additionalNotes={shortageInfo?.additionalNotes || ''}
                    lastUpdate={shortageInfo?.lastUpdate || ''}
                />
            ) : (
                <></>
            );
        },
    },
    /*  
   Not required but may be required later
   {                                
        headerName: TK.authorised,
        colId: 'isAuthorised',
        filter: true,
        valueGetter: (p) => (p.data.isAuthorised === undefined ? 'Unknown' : p.data.isAuthorised ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isAuthorised} />,
    },
    {
        headerName: TK.marketed,
        colId: 'isMarketed',
        filter: true,
        valueGetter: (p) => (p.data.isMarketed === undefined ? 'Unknown' : p.data.isMarketed ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isMarketed} />,
    }, */
    {
        headerName: TK.administration,
        colId: 'administrationCategories',
        hide: true,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (p) => <Administration rowData={p} />,
    },
    {
        headerName: TK.manufacturer,
        colId: 'manufacturer',
        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => p.data.manufacturer || '',
    },

    {
        headerName: TK.codes,
        colId: 'codes',

        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) =>
            (p.data.codes &&
                Object.keys(p.data.codes)
                    .map((code) => p.data.codes && `${code}: ${p.data.codes[code]}`)
                    .join(', ')) ||
            '',
    },
    {
        headerName: TK.notes,
        colId: 'otherFields',

        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) =>
            (p.data.otherFields &&
                Object.keys(p.data.otherFields)
                    .map((key) => p.data.otherFields && `${key}: ${p.data.otherFields[key]}`)
                    .join(', ')) ||
            '',
    },
    {
        headerName: TK.scrapingOrigin,
        colId: 'scrapingOrigin',

        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => p.data.scrapingOrigin,
    },
    {
        headerName: TK.scrapingOriginId,
        colId: 'scrapingOriginIdentifier',
        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => p.data.scrapingOriginIdentifier,
    },
    {
        headerName: TK.lastUpdate,
        colId: 'lastUpdate',
        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => moment(p.data.lastUpdate).format(DateTimeFormat),
    },
    {
        headerName: TK.generic,
        colId: 'isGeneric',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => (p.data.isGeneric === undefined ? 'Unknown' : p.data.isGeneric ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isGeneric} />,
    },
    {
        headerName: TK.psychotropic,
        colId: 'isPsychotropic',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => (p.data.isPsychotropic === undefined ? 'Unknown' : p.data.isPsychotropic ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isPsychotropic} />,
    },
    {
        headerName: TK.biological,
        colId: 'isBiological',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => (p.data.isBiological === undefined ? 'Unknown' : p.data.isBiological ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isBiological} />,
    },
    {
        headerName: TK.additionalMonitoring,
        colId: 'isAdditionalMonitoring',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) =>
            p.data.isAdditionalMonitoring === undefined ? 'Unknown' : p.data.isAdditionalMonitoring ? 'Yes' : 'No',
        cellRenderer: (p) => <YesNo value={p.data.isAdditionalMonitoring} />,
    },
    {
        headerName: TK.parallelimport,
        colId: 'isParallelImport',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) =>
            p.data.isParallelImport === undefined ? 'Unknown' : p.data.isParallelImport ? 'Yes' : 'No',
        cellRenderer: (p) => <YesNo value={p.data.isParallelImport} />,
    },
    {
        headerName: TK.prescription,
        colId: 'isPrescription',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => (p.data.isPrescription === undefined ? 'Unknown' : p.data.isPrescription ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isPrescription} />,
    },
    {
        headerName: TK.hospitalar,
        colId: 'isHospitalar',
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => (p.data.isHospitalar === undefined ? 'Unknown' : p.data.isHospitalar ? 'Yes' : 'No'),
        cellRenderer: (p) => <YesNo value={p.data.isHospitalar} />,
    },
    {
        headerName: TK.precautionsForStorage,
        colId: 'precautionsForStorage',
        filter: true,
        hide: true,
        wrapText: true,
        autoHeight: true,
        valueGetter: (p) => p.data.precautionsForStorage || '',
    },
];
