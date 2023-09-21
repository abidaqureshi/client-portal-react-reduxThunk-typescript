import * as React from 'react';
import { TK } from '../../../store/Translations/translationKeys';
import { useTranslations } from '../../../store/Translations/hooks';
import Panel from '../../../components/Panel';
import { useSelector, useDispatch } from 'react-redux';
import { SendingToParagraph, ScrollableContainer } from './styled';
import ProductsEmailTable from './ProductsEmailTable';
import {
    getAllProducts as getAllProductsV2,
    getSelectedProducts as getSelectedProductsV2,
} from '../../../store/ProductsV2/selectors';
import {
    getAllProducts as getAllProductsV1,
    getSelectedProducts as getSelectedProductsV1,
} from '../../../store/Products/selectors';
import { ProductV1 } from '../../../models/ProductV1';
import List from '../../../components/List';
import { getSelectedSuppliers, getSelectedSuppliersEmails } from '../../../store/Suppliers/selectors';
import { Supplier } from '../../../models/Supplier';
import { Checkbox, Tooltip, TextField } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { RFQ, EmailData } from '../types';
import { MapOf } from '../../../utils/Types';
import ProductsFieldsSelection from './ProductsFieldsSelection';
import { getRFQTablesAutoFillFieldsSettings } from '../../../store/Session/selectors';
import { updateRFQTablesAutoFillFieldsSettings } from '../../../store/Session/actions';
import CountryFlag from '../../../components/CountryFlag';
import { RFQQuote } from '../../../models/RFQQuote';
import queryString from 'query-string';
import { ApplicationState } from '../../../store';
import { useLocation } from 'react-router-dom';
import { Filters } from '../../ProductsListV2/ProductsFilters/types';
export interface ProductsEmailTablesProps {
    rfqs: RFQ[];
    dataByCountry: MapOf<EmailData>;
    setDataByCountry: React.Dispatch<React.SetStateAction<MapOf<EmailData>>>;
    onVerifiedChanged: (areAllVerified: boolean) => void;
}

const generateDefaultSubject = (products: ProductV1[], rfqs: RFQ[]): string => {
    return `RFQ ${rfqs
        .filter((rfq) => products.some((p) => rfq.items.includes(p.id)))
        .map((rfq) => rfq.id + ' - ' + rfq.description)
        .join(', ')}`;
};

const findRFQ = (productId: string, rfqs: RFQ[]) => rfqs.find((rfq) => rfq.items.includes(productId));
var getSelectedProducts: (state: ApplicationState) => string[];
var getAllProducts: (state: ApplicationState) => { [id: string]: any };

const ProductsEmailTables: React.FC<ProductsEmailTablesProps> = ({
    rfqs,
    dataByCountry,
    setDataByCountry,
    onVerifiedChanged,
}) => {
    const t = useTranslations();
    const dispatch = useDispatch();
    const location = useLocation();
    const query2 = queryString.parse(location.search) as Filters;

    if (query2.Version === 'V2') {
        getSelectedProducts = getSelectedProductsV2;
        getAllProducts = getAllProductsV2;
    } else {
        getSelectedProducts = getSelectedProductsV1;
        getAllProducts = getAllProductsV1;
    }
    const selectedProductsIds = useSelector(getSelectedProducts);
    const products = useSelector(getAllProducts);
    const selectedSuppliers = useSelector(getSelectedSuppliers) || [];
    const selectedSuppliersEmails = useSelector(getSelectedSuppliersEmails) || [];
    const autoFillFields = useSelector(getRFQTablesAutoFillFieldsSettings);

    const productsByCountry = React.useMemo<MapOf<ProductV1[]>>(() => {
        const selectedProducts = selectedProductsIds.map((id) => products[id]);
        return Array.from(new Set(selectedProducts.map((p) => p.countryCode)))
            .map((countryCode) => ({ [countryCode]: selectedProducts.filter((p) => p.countryCode === countryCode) }))
            .reduce((prev, curr) => Object.assign(prev, curr), {});
    }, [selectedProductsIds, products]);

    const suppliersByCountry = React.useMemo<MapOf<Supplier[]>>(() => {
        return Array.from(new Set(selectedSuppliers.map((s) => s.countryCode)))
            .map((countryCode) => ({ [countryCode]: selectedSuppliers.filter((s) => s.countryCode === countryCode) }))
            .reduce((prev, curr) => Object.assign(prev, curr), {});
    }, [selectedSuppliers]);

    const [verified, setVerified] = React.useState<string[]>([]);
    const [expanded, setExpanded] = React.useState<string[]>(Object.keys(productsByCountry));

    const setAutoFillFields = React.useCallback(
        (getNew: React.SetStateAction<string[]>) => {
            dispatch(
                updateRFQTablesAutoFillFieldsSettings(typeof getNew === 'function' ? getNew(autoFillFields) : getNew),
            );
        },
        [dispatch, autoFillFields],
    );

    const handleVerifyChange = React.useCallback(
        (countryId: string, checked: boolean) => {
            const newVerified = checked ? [...verified, countryId] : verified.filter((i) => i !== countryId);

            setVerified(newVerified);

            if (newVerified.length === Object.keys(productsByCountry).length) {
                onVerifiedChanged(true);
            } else {
                onVerifiedChanged(false);
            }
            setExpanded(checked ? expanded.filter((i) => i !== countryId) : [...expanded, countryId]);
        },
        [onVerifiedChanged, setVerified, setExpanded, verified, productsByCountry, expanded],
    );

    const handleSubjectChanged = React.useCallback(
        (countryId: string, subject: string) => {
            setDataByCountry((prev) => ({
                ...prev,
                [countryId]: {
                    ...prev[countryId],
                    subject,
                },
            }));
        },
        [setDataByCountry],
    );

    const handleTableContentChanged = React.useCallback(
        (countryId: string, tableUpdater: React.SetStateAction<RFQQuote[]>) => {
            setDataByCountry((prev) => ({
                ...prev,
                [countryId]: {
                    ...prev[countryId],
                    table:
                        typeof tableUpdater === 'function' ? tableUpdater(prev[countryId]?.table || []) : tableUpdater,
                },
            }));
        },
        [setDataByCountry],
    );

    React.useEffect(() => {
        setDataByCountry((prev) =>
            Object.keys(prev)
                .map((country) => ({
                    [country]: {
                        ...prev[country],
                        subject: generateDefaultSubject(productsByCountry[country] || [], rfqs),
                        table: prev[country]?.table
                            .filter(
                                (row) =>
                                    productsByCountry[country] &&
                                    productsByCountry[country].findIndex((p) => p.id === row['id']) >= 0,
                            )
                            .map<RFQQuote>((row) => {
                                const rfq = findRFQ(row['id'], rfqs);
                                return {
                                    ...row,
                                    [TK.rfqNr]: rfq?.id || '',
                                    rfqDescription: rfq?.description || '',
                                    endingDate: rfq?.dueDate,
                                };
                            }),
                    },
                }))
                .reduce((prev, curr) => Object.assign(prev, curr), {}),
        );
        // eslint-disable-next-line
    }, [productsByCountry, rfqs]);

    return (
        <Panel title={t(TK.productsTables)} subtitle={t(TK.seeAndConfigureTheTablesInEmails)}>
            <ProductsFieldsSelection selected={autoFillFields} setSelected={setAutoFillFields} />
            <List
                multiple
                defaultExpanded={expanded}
                onExpandedChanged={(expanded) => setExpanded(expanded as string[])}
                items={Object.keys(productsByCountry).map((countryCode) => ({ id: countryCode }))}
                renderName={(item) => (
                    <CountryFlag
                        country={productsByCountry[item.id][0].country}
                        countryCode={productsByCountry[item.id][0].countryCode}
                    />
                )}
                renderActions={(item) => (
                    <Tooltip title={t(TK.markAsValidated)}>
                        <Checkbox
                            checked={verified.includes(item.id)}
                            onChange={(_, checked) => handleVerifyChange(item.id, checked)}
                            key={item.id}
                            icon={<CheckCircleOutlineIcon style={{ fill: 'red' }} />}
                            checkedIcon={<CheckCircleIcon style={{ fill: 'green' }} />}
                            name={`checked-${item.id}`}
                        />
                    </Tooltip>
                )}
                renderDetails={(item) => (
                    <>
                        <SendingToParagraph>
                            <b>{t(TK.sendingTo)}:</b>&nbsp;
                            {suppliersByCountry[item.id]
                                ?.flatMap((s) =>
                                    selectedSuppliersEmails.filter((c) =>
                                        s.contacts.find((sc) => sc.email === c.value),
                                    ),
                                )
                                .map((email) => (
                                    <li key={email.value}>
                                        {email?.isCC ? `${email.value} (CC)` : email?.value || ''}
                                    </li>
                                ))}
                            <b>{t(TK.subject)}:</b>&nbsp;
                            <TextField
                                style={{ width: '100%' }}
                                size="small"
                                variant="outlined"
                                value={dataByCountry[item.id]?.subject || ''}
                                onChange={(event) => handleSubjectChanged(item.id, event.target.value)}
                            />
                        </SendingToParagraph>
                        <ScrollableContainer>
                            <ProductsEmailTable
                                data={dataByCountry[item.id]?.table}
                                products={productsByCountry[item.id]}
                                autoFillFields={autoFillFields}
                                setData={(updater) => handleTableContentChanged(item.id, updater)}
                            />
                        </ScrollableContainer>
                    </>
                )}
            />
        </Panel>
    );
};

export default ProductsEmailTables;
