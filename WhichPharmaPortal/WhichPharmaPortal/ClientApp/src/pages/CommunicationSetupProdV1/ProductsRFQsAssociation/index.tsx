import * as React from 'react';
import { Grid, Button, Typography, TextField, Tooltip, ButtonGroup } from '@material-ui/core';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import Panel from '../../../components/Panel';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import DragAndDrop, { DragAndDropItemProps } from './DragAndDrop';
import queryString from 'query-string';
import {
    getAllProducts as getAllProductsV2,
    getSelectedProducts as getSelectedProductsV2,
} from '../../../store/ProductsV2/selectors';
import {
    getAllProducts as getAllProductsV1,
    getSelectedProducts as getSelectedProductsV1,
} from '../../../store/Products/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { ProductV1 } from '../../../models/ProductV1';
import { RFQ } from '../types';
import { MapOf } from '../../../utils/Types';
import { productDeselected } from '../../../store/Products/actions';
import FormDialog from '../../../components/FormDialog';
import { RFQHeader, StikyDiv } from './styled';
import CountryFlag from '../../../components/CountryFlag';
import AutoFillFields from './AutoFillFields';
import { reorder, tryGetNameFromOriginal } from '../../../utils/utils';
import moment from 'moment-business-days';
import { updateNextRFQNumber } from '../../../store/RFQs/actions';
import { getNextRfqNumber } from '../../../store/RFQs/selectors';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import ToggleIconButton from '../../../components/ToggleIconButton';
import { fileURLToPath } from 'url';
import { ApplicationState } from '../../../store';
import { Filters } from '../../ProductsListV2/ProductsFilters/types';
import { useLocation } from 'react-router-dom';

const toAssociateDropableId = 'toAssociate';

var getSelectedProducts: (state: ApplicationState) => string[];
var getAllProducts: (state: ApplicationState) => { [id: string]: any };

const countriesPreferenceOrder = ['AT', 'GB', 'CA', 'CZ'];

const itemQualityScore = (item: ProductV1): number => {
    const fieldsCount =
        (item.activeSubstances?.length ? 1 : 0) +
        (item.name?.length ? 1 : 0) +
        (item.strength?.length ? 1 : 0) +
        (item.drugForm?.length ? 1 : 0) +
        (item.atc?.length ? 1 : 0);
    const countryIndex = countriesPreferenceOrder.indexOf(item.countryCode);
    const countryScore = countryIndex < 0 ? 0 : countriesPreferenceOrder.length - countryIndex;
    return fieldsCount * 100 + countryScore;
};

const getDefaultRFQDescription = (items: ProductV1[] = []): string => {
    const p = items.sort((a, b) => itemQualityScore(a) - itemQualityScore(b)).reverse()[0];
    const name = tryGetNameFromOriginal(p.name);
    const includeName = !items.some((i) => i.name.toLowerCase().indexOf(name.toLowerCase()) === -1);
    return includeName
        ? `${p.activeSubstances?.join(', ') ?? ''} (${name}) ${p.strength ?? ''} ${p.drugForm ?? ''} (${p.atc ?? ''})`
        : `${p.activeSubstances?.join(', ') ?? ''} ${p.strength ?? ''} ${p.drugForm ?? ''} (${p.atc ?? ''})`;
};

const getDefaultRFQ = (rid?: string, items: ProductV1[] = []): RFQ => ({
    id: rid != null ? rid : '',
    autoId: '',
    useExistingRfq: false,
    description: items.length ? getDefaultRFQDescription(items) : '',
    dueDate: moment().businessAdd(3).utc().format(),
    items: items.map((i) => i.id),
});

const getProductClusterId = (p: ProductV1): string => `${p.atc || ''}`;

const getFollowingRfqNumber = (currRfqNumber: string): string => {
    const year = new Date().getFullYear().toString().substr(2, 2);
    const regex = `^(?<number>\\d+)\\/${year}$`;
    const groups = currRfqNumber.match(new RegExp(regex))?.groups;

    if (groups) {
        return `${parseInt(groups.number) + 1}/${year}`;
    } else {
        return '';
    }
};

const createProductsClusters = (products: ProductV1[]): RFQ[] => {
    var clusters = products
        .filter((p) => p.atc?.length)
        .reduce(
            (map: { [clusterId: string]: ProductV1[] }, p) => ({
                ...map,
                [getProductClusterId(p)]: [...(map[getProductClusterId(p)] || []), p],
            }),
            {},
        );

    return Object.values(clusters).map((items) => getDefaultRFQ('', items));
};

export interface ProductsRFQsAssociationProps {
    rfqs: RFQ[];
    setRfqs: React.Dispatch<React.SetStateAction<RFQ[]>>;
    onAllProductsAssociatedChanged: (complete: boolean) => void;
    onAutoFillField: (rfqId: string, fieldName: string, value: string) => void;
}

const ProductsRFQsAssociation: React.FC<ProductsRFQsAssociationProps> = ({
    rfqs,
    setRfqs,
    onAllProductsAssociatedChanged,
    onAutoFillField,
}) => {
    const t = useTranslations();
    const location = useLocation();
    const dispatch = useDispatch();

    const query2 = queryString.parse(location.search) as Filters;

    // if (query2.Version === 'V2') {
    getSelectedProducts = getSelectedProductsV2;
    getAllProducts = getAllProductsV2;
    //  } else {
    // getSelectedProducts = getSelectedProductsV1;
    // getAllProducts = getAllProductsV1;
    // }

    const products = useSelector(getAllProducts);
    const selectedProductsIds = useSelector(getSelectedProducts);
    const nextRfqNumber = useSelector(getNextRfqNumber);

    const [productToConfirmDeletion, setProductToConfirmDeletion] = React.useState<string | null>(null);

    // DEFAULT VALUE
    React.useEffect(() => {
        setRfqs((_) => createProductsClusters(selectedProductsIds.map((id) => products[id])));
        dispatch(updateNextRFQNumber());
        // eslint-disable-next-line
    }, []);

    React.useEffect(() => {
        if (!nextRfqNumber) return;
        let rfqNumber = nextRfqNumber as string;
        setRfqs((rfqs) =>
            rfqs.map((rfq) => {
                const currRfqNumber = rfqNumber;
                rfqNumber = getFollowingRfqNumber(rfqNumber);
                return {
                    ...rfq,
                    autoId: currRfqNumber,
                    id: rfq.useExistingRfq ? rfq.id : currRfqNumber,
                };
            }),
        );
        // eslint-disable-next-line
    }, [nextRfqNumber]);

    const itemsToAssociate = React.useMemo<string[]>(
        () => selectedProductsIds.filter((id) => !rfqs.some((rfq) => rfq.items.includes(id))),
        [selectedProductsIds, rfqs],
    );

    React.useEffect(() => onAllProductsAssociatedChanged(!itemsToAssociate.length), [
        onAllProductsAssociatedChanged,
        itemsToAssociate,
    ]);

    const onDragEnd = React.useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            setRfqs((prev) =>
                prev.map((rfq, index) => {
                    if (
                        index.toString() === result.source.droppableId &&
                        result.source.droppableId === result.destination?.droppableId
                    ) {
                        return { ...rfq, items: reorder(rfq.items, result.source.index, result.destination.index) };
                    } else if (index.toString() === result.source.droppableId) {
                        return { ...rfq, items: rfq.items.filter((id) => id !== result.draggableId) };
                    } else if (index.toString() === result.destination?.droppableId) {
                        return {
                            ...rfq,
                            items: reorder(
                                [...rfq.items, result.draggableId],
                                rfq.items.length,
                                result.destination.index,
                            ),
                        };
                    }
                    return rfq;
                }),
            );
        },
        [setRfqs],
    );

    const handleRFQIdChange = React.useCallback(
        (index: number, newId: string) => {
            newId = newId.replace(/\s|\n|\r|&nbsp;|<br>/g, '');
            setRfqs((prev) => prev.map((rfq, i) => (index !== i ? rfq : { ...rfq, id: newId })));
        },
        [setRfqs],
    );

    const handleRFQDescriptionChange = React.useCallback(
        (index: number, description: string) => {
            setRfqs((prev) => prev.map((rfq, i) => (index !== i ? rfq : { ...rfq, description })));
        },
        [setRfqs],
    );

    const handleDueDateChange = React.useCallback(
        (index: number, dueDate: string) => {
            setRfqs((prev) => prev.map((rfq, i) => (index !== i ? rfq : { ...rfq, dueDate })));
        },
        [setRfqs],
    );

    const handleToggleAssignToExistingRfq = React.useCallback(
        (index: number) => () => {
            setRfqs((prev) =>
                prev.map((rfq, i) =>
                    index !== i
                        ? rfq
                        : {
                              ...rfq,
                              id: !rfq.useExistingRfq ? rfq.id : rfq.autoId,
                              useExistingRfq: !rfq.useExistingRfq,
                          },
                ),
            );
        },
        [setRfqs],
    );

    const items = React.useMemo<MapOf<{ id: string; label: React.ReactNode }>>(() => {
        const vals = selectedProductsIds
            .map((id) => products[id])
            .map<MapOf<DragAndDropItemProps>>((p) => ({
                [p.id]: {
                    id: p.id,
                    onCloseClick: () => {
                        if (itemsToAssociate.includes(p.id)) {
                            setProductToConfirmDeletion(p.id);
                        } else {
                            onDragEnd({
                                draggableId: p.id,
                                mode: 'FLUID',
                                reason: 'DROP',
                                type: '',
                                source: {
                                    index: -1,
                                    droppableId: rfqs.findIndex((rfq) => rfq.items.includes(p.id)).toString(),
                                },
                                destination: { index: -1, droppableId: toAssociateDropableId },
                            });
                        }
                    },
                    label: (
                        <span>
                            <CountryFlag hideName country={p.country} countryCode={p.countryCode} />
                            {p.name} (
                            {[p.strength, p.drugForm, p.administrationForm, p.package].filter((x) => x).join(', ')})
                        </span>
                    ),
                },
            }));
        return vals.reduce((prev, curr) => Object.assign(prev, curr), {});
        // eslint-disable-next-line
    }, [products, selectedProductsIds, itemsToAssociate]);

    return (
        <Panel title={t(TK.rfqAssociation)} subtitle={t(TK.dragAndDropToAssignProductsToARFQ)}>
            <FormDialog
                open={productToConfirmDeletion !== null}
                title="Are you sure you want to remove this product from selected list?"
                onClose={() => setProductToConfirmDeletion(null)}
                onSubmit={() => {
                    if (productToConfirmDeletion) {
                        dispatch(productDeselected(productToConfirmDeletion));
                        setProductToConfirmDeletion(null);
                    }
                }}
            />
            <DragDropContext onDragEnd={onDragEnd}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <StikyDiv>
                            <DragAndDrop
                                id={toAssociateDropableId}
                                items={itemsToAssociate.map((id) => items[id]) as any}
                                title={
                                    <Typography>
                                        <b>{t(TK.productsToAssociate)}:</b>
                                    </Typography>
                                }
                                texts={{
                                    none: t(TK.allProductsAreAssociated),
                                }}
                            />
                        </StikyDiv>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {rfqs.map((rfq, index) => (
                            <DragAndDrop
                                key={index}
                                id={index.toString()}
                                items={rfq.items.map((id) => items[id]) as any}
                                onCloseClick={() => setRfqs((prev) => prev.filter((r) => r !== rfq))}
                                texts={{
                                    none: t(TK.none),
                                }}
                                title={
                                    <RFQHeader>
                                        <span style={{ display: 'flex' }}>
                                            <Typography color={(rfq.id?.length || 0) >= 4 ? 'initial' : 'error'}>
                                                <b>{t(TK.rfqNr)}:</b>&nbsp;
                                                <TextField
                                                    disabled={!rfq.useExistingRfq}
                                                    error={rfq.useExistingRfq && (rfq.id?.length || 0) < 4}
                                                    size="small"
                                                    style={{ width: 100 }}
                                                    value={rfq.id}
                                                    onChange={(event) => handleRFQIdChange(index, event.target.value)}
                                                />
                                            </Typography>
                                            <Tooltip title={t(TK.assignToExistingRfq)}>
                                                <ToggleIconButton
                                                    size="small"
                                                    onClick={handleToggleAssignToExistingRfq(index)}
                                                    selected={rfq.useExistingRfq}
                                                >
                                                    <OpenInBrowserIcon />
                                                </ToggleIconButton>
                                            </Tooltip>
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            <Typography color={rfq.dueDate?.length ? 'secondary' : 'error'}>
                                                <b>{t(TK.dueDate)}:</b>&nbsp;
                                                <TextField
                                                    size="small"
                                                    type="datetime-local"
                                                    placeholder={t(TK.dueDate)}
                                                    value={moment(rfq.dueDate).format().substr(0, 16)}
                                                    onChange={(event) =>
                                                        handleDueDateChange(
                                                            index,
                                                            new Date(event.target.value).toISOString(),
                                                        )
                                                    }
                                                />
                                            </Typography>
                                        </span>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={rfq.description}
                                            placeholder={t(TK.description)}
                                            onChange={(event) => handleRFQDescriptionChange(index, event.target.value)}
                                        />
                                        <AutoFillFields
                                            onAutoFillField={(field, value) => onAutoFillField(rfq.id, field, value)}
                                        />
                                    </RFQHeader>
                                }
                            />
                        ))}
                        <Button
                            variant="outlined"
                            style={{ width: '100%' }}
                            onClick={() => {
                                let lastRfqNumber = () => {
                                    let filterRfqs = rfqs.filter((rfq) => {
                                        return rfq.useExistingRfq === false;
                                    });
                                    if (filterRfqs.length > 0) {
                                        return getFollowingRfqNumber(filterRfqs[filterRfqs.length - 1].id);
                                    } else {
                                        return nextRfqNumber;
                                    }
                                };
                                setRfqs((prev) => prev.concat(getDefaultRFQ(lastRfqNumber())));
                            }}
                        >
                            {t(TK.addNew)}
                        </Button>
                    </Grid>
                </Grid>
            </DragDropContext>
        </Panel>
    );
};
export default ProductsRFQsAssociation;
