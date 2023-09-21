import * as React from 'react';
import { TK } from '../../../../store/Translations/translationKeys';
import { ProductV1 } from '../../../../models/ProductV1';
import { useTranslations } from '../../../../store/Translations/hooks';
import ContentEditable from 'react-contenteditable';
import { MapOf } from '../../../../utils/Types';
import CopyToClipboard from 'react-copy-to-clipboard';
import CheckIcon from '@material-ui/icons/Check';
import { CopyNotification } from './styled';
import { RFQQuote } from '../../../../models/RFQQuote';
import { RFQQuoteState } from '../../../../models/RFQQuoteState';
import { ProductV2 } from '../../../../models/ProductV2';

export interface EmailTableColumn {
    name: TK;
    headerStyle?: React.CSSProperties;
    cellStyle?: React.CSSProperties;
    canEdit?: boolean;
    isMetadata?: boolean;
    getValue?: (product: ProductV1) => string;
}

export interface ProductsEmailTableProps {
    products: ProductV2[];
    data: RFQQuote[];
    autoFillFields: string[];
    setData: React.Dispatch<React.SetStateAction<RFQQuote[]>>;
}

const tableStyle: React.CSSProperties = {
    all: 'initial',
    borderCollapse: 'collapse',
    display: 'table',
};

const headerStyle: React.CSSProperties = {
    backgroundColor: 'yellow',
    minHeight: '1rem',
    padding: '0 5px',
    border: '1px solid black',
};

const cellStyle: React.CSSProperties = {
    minHeight: '1rem',
    padding: '0 5px',
    border: '1px solid black',
};

const unscapeHtml = (unsafe: string): string | undefined => {
    if (!unsafe?.length) return undefined;
    return unsafe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
};

const formatActiveSubstance = (p: ProductV2, autoFillFields: string[]) =>
    (autoFillFields.includes(TK.activeSubstances) ? p.activeSubstances?.join(', ') || '' : '') +
    (autoFillFields.includes(TK.activeSubstances) && autoFillFields.includes(TK.strength) && p.strength?.length
        ? ' - '
        : '') +
    (autoFillFields.includes(TK.strength) && p.strength?.length ? p.strength : '') +
    (autoFillFields.includes(TK.atc) && p.atc?.length ? ` (${p.atc})` : '');

const ProductsEmailTable: React.FC<ProductsEmailTableProps> = ({ products, data, autoFillFields, setData }) => {
    const t = useTranslations();

    const [autoFilledFields, setAutoFilledFields] = React.useState(autoFillFields);
    const [copiedNotification, setCopiedNotification] = React.useState(false);

    const handleRowChange = (index: number, row: RFQQuote) =>
        setData((prev) => prev.map((r, i) => (i === index ? row : r)));

    // DEFAULT VALUE
    React.useEffect(() => {
        setData(
            products.map((p) => ({
                id: p.id,
                rfqNr: '',
                state: RFQQuoteState.Open,
                name: autoFillFields.includes(TK.name) ? p.name : '',
                activeSubstances: autoFillFields.includes(TK.activeSubstances)
                    ? formatActiveSubstance(p, autoFillFields)
                    : '',
                productCode: autoFillFields.includes(TK.productCode) ? p.productCode : '',
                packSize: autoFillFields.includes(TK.packSize) ? p.package : '',
                countryOfOrigin: autoFillFields.includes(TK.countryOfOrigin) ? p.country : '',
                maHolder: autoFillFields.includes(TK.maHolder) ? p.maHolder : '',
            })),
        );
        // eslint-disable-next-line
    }, []);

    const checkAutoFill = React.useCallback(
        (columns: TK[], value: string | undefined, getAutoFillValue: () => string | undefined) => {
            const autoFill = columns.map((c) => autoFillFields.includes(c));
            const autoFilled = columns.map((c) => autoFilledFields.includes(c));

            if (autoFill === autoFilled) return value || undefined;
            if (autoFill.some((v) => v)) return getAutoFillValue();
            return undefined;
        },
        [autoFillFields, autoFilledFields],
    );

    React.useEffect(() => {
        setData((prev) =>
            prev.map<RFQQuote>((row, index) => ({
                ...row,
                name: checkAutoFill([TK.name], row.name, () => products[index].name) || '',
                activeSubstances: checkAutoFill([TK.activeSubstances, TK.atc, TK.strength], row.activeSubstances, () =>
                    formatActiveSubstance(products[index], autoFillFields),
                ),
                productCode: checkAutoFill([TK.productCode], row.productCode, () => products[index].productCode),
                packSize: checkAutoFill([TK.packSize], row.packSize, () => products[index].package),
                countryOfOrigin: checkAutoFill(
                    [TK.countryOfOrigin],
                    row.countryOfOrigin,
                    () => products[index].country,
                ),
                maHolder: checkAutoFill([TK.maHolder], row.maHolder, () => products[index].maHolder),
            })),
        );
        setAutoFilledFields(autoFillFields);
        // eslint-disable-next-line
    }, [autoFillFields]);

    const tableToCopy = React.useMemo(
        () =>
            `<table style="border-collapse: collapse">
    <tr>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.rfqNr)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.name)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.activeSubstances)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.productCode)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.packSize)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.totalUnits)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.numberOfPacks)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.exwNetPriceEuro)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.availabilityPacks)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.leadTimeToDeliver)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.expDate)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.countryOfOrigin)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.maHolder)}
        </th>
        <th style="background-color: yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black; ">
            ${t(TK.comments)}
        </th>
    </tr>
    ${data
        ?.map((row) => (row as any) as MapOf<string>)
        .map(
            (row) => `
        <tr>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.rfqNr?.length ? row.rfqNr : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.name?.length ? row.name : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.activeSubstances?.length ? row.activeSubstances : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.productCode?.length ? row.productCode : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.packSize?.length ? row.packSize : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.unitQuant?.length ? row.unitQuant : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.numOfPacks?.length ? row.numOfPacks : ''}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.exwNetPriceEuro?.length ? row.exwNetPriceEuro : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.availabilityPacks?.length ? row.availabilityPacks : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.leadTimeToDeliver?.length ? row.leadTimeToDeliver : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.expDate?.length ? row.expDate : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.countryOfOrigin?.length ? row.countryOfOrigin : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.maHolder?.length ? row.maHolder : '&nbsp;'}
            </td>
            <td style="yellow; min-height: 1rem; padding: 0 5px; border: 1px solid black;">
                ${row.comments?.length ? row.comments : '&nbsp;'}
            </td>
        </tr>
    `,
        )
        .join('')}
</table>`,
        [data, t],
    );

    const onTableCopy = React.useCallback(() => {
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 1000);
    }, [setCopiedNotification]);

    return (
        <div style={tableStyle}>
            {copiedNotification && (
                <CopyNotification icon={<CheckIcon fontSize="inherit" />} severity="success">
                    {t(TK.copied)}!
                </CopyNotification>
            )}
            <CopyToClipboard
                options={{ format: 'text/html', message: t(TK.copied) }}
                text={tableToCopy}
                onCopy={onTableCopy}
            >
                <tr>
                    <th style={headerStyle}>{t(TK.rfqNr)}</th>
                    <th style={headerStyle}>{t(TK.name)}</th>
                    <th style={headerStyle}>{t(TK.activeSubstances)}</th>
                    <th style={headerStyle}>{t(TK.productCode)}</th>
                    <th style={headerStyle}>{t(TK.packSize)}</th>
                    <th style={headerStyle}>{t(TK.totalUnits)}</th>
                    <th style={headerStyle}>{t(TK.numberOfPacks)}</th>
                    <th style={headerStyle}>{t(TK.exwNetPriceEuro)}</th>
                    <th style={headerStyle}>{t(TK.availabilityPacks)}</th>
                    <th style={headerStyle}>{t(TK.leadTimeToDeliver)}</th>
                    <th style={headerStyle}>{t(TK.expDate)}</th>
                    <th style={headerStyle}>{t(TK.countryOfOrigin)}</th>
                    <th style={headerStyle}>{t(TK.maHolder)}</th>
                    <th style={headerStyle}>{t(TK.comments)}</th>
                </tr>
            </CopyToClipboard>
            {data?.map((row, index) => (
                <tr key={row.id}>
                    <td style={cellStyle}>
                        <span>{row.rfqNr}</span>
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.name || '&nbsp;'}
                            onChange={(e) =>
                                handleRowChange(index, { ...row, name: unscapeHtml(e.target.value) || '' })
                            }
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.activeSubstances || '&nbsp;'}
                            onChange={(e) =>
                                handleRowChange(index, { ...row, activeSubstances: unscapeHtml(e.target.value) })
                            }
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.productCode || '&nbsp;'}
                            onChange={(e) =>
                                handleRowChange(index, { ...row, productCode: unscapeHtml(e.target.value) })
                            }
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.packSize || '&nbsp;'}
                            onChange={(e) => handleRowChange(index, { ...row, packSize: unscapeHtml(e.target.value) })}
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.unitQuant || '&nbsp;'}
                            onChange={(e) => handleRowChange(index, { ...row, unitQuant: unscapeHtml(e.target.value) })}
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable tagName="span" html={row.numOfPacks || '&nbsp;'} onChange={(e) => {}} />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.exwNetPriceEuro || '&nbsp;'}
                            onChange={(e) =>
                                handleRowChange(index, { ...row, exwNetPriceEuro: unscapeHtml(e.target.value) })
                            }
                        />
                    </td>
                    <td style={cellStyle} />
                    <td style={cellStyle} />
                    <td style={cellStyle} />
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.countryOfOrigin || '&nbsp;'}
                            onChange={(e) =>
                                handleRowChange(index, { ...row, countryOfOrigin: unscapeHtml(e.target.value) })
                            }
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.maHolder || '&nbsp;'}
                            onChange={(e) => handleRowChange(index, { ...row, maHolder: unscapeHtml(e.target.value) })}
                        />
                    </td>
                    <td style={cellStyle}>
                        <ContentEditable
                            tagName="span"
                            html={row.comments || '&nbsp;'}
                            onChange={(e) => handleRowChange(index, { ...row, comments: unscapeHtml(e.target.value) })}
                        />
                    </td>
                </tr>
            ))}
        </div>
    );
};

export default ProductsEmailTable;
