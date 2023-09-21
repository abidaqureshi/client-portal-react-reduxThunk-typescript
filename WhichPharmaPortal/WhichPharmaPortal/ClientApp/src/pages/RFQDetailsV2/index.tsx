import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { v4 as uuidv4 } from 'uuid';

import { useParams } from 'react-router';
import Page from '../../components/Page';

import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { useSelector, useDispatch } from 'react-redux';
import { getRFQSummaries, getRFQDetails, isLoadingRFQs } from '../../store/RFQs/selectors';
import Loading from '../../components/Loading';
import {
    fetchRFQDetails,
    fetchRFQs,
    changeRFQAssignment,
    changeRFQQuotesData,
    updateRFQQuotesCardsData,
} from '../../store/RFQs/actions';
import { Typography, Box, Paper, Snackbar, Button, LinearProgress } from '@material-ui/core';
import { RFQEntryState } from '../../models/RFQEntryState';

import { goToRFQsList } from '../../store/Router/actions';
import UserSelector from '../../components/UserSelector';
import { PageActionPanel } from '../../components/Page/styled';
import { Alert, ToggleButton } from '@material-ui/lab';
import { getMyUser } from '../../store/Users/selectors';

//import Table, { TableSettings } from '../../components/Table';
import Table from '../../components/AGTable';
import { columns } from './columns';

import { Item } from '../../components/Table/types';
import { MapOf } from '../../utils/Types';
import { UserRole } from '../../models/UserRole';
import { RFQQuoteInfo } from '../../models/RFQQuoteInfo';
import {
    CheckboxSelectionCallbackParams,
    ColDef,
    ColGroupDef,
    HeaderCheckboxSelectionCallbackParams,
    RowSelectedEvent,
} from 'ag-grid-community';
import { ProductCard } from '../../components/ProductCard';
import { getMaxMinAndMeanByField, parseEuDecimalToDecimal, parseNumber, reorder } from '../../utils/utils';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';
import RFQAuditReport from './RFQAuditReport';

export interface RFQQuoteTableItem extends RFQQuoteInfo {
    threadId: string;
    country: { name: string; code: string };
    supplier: string;
    supplierId: string;
    contacts: string;
}

const RFQDetailsPage: React.FC = () => {
    const { rfqNrEncoded } = useParams<{ rfqNrEncoded: string }>();
    const dispatch = useDispatch();
    const t = useTranslations();
    const count = React.useRef(0);

    const { setHeaderName } = React.useContext(AppContext) as AppContextType;

    const rfqSummaries = useSelector(getRFQSummaries) || {};
    const rfqsDetails = useSelector(getRFQDetails);
    const myUser = useSelector(getMyUser);
    const isLoading = useSelector(isLoadingRFQs);

    const [onlyOpen, setOnlyOpen] = React.useState(false);
    const [isAuditOpen, setIsAuditOpen] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const [isNotSaved, setIsNotSaved] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [selectedQuotes, setSelectedQuotes] = React.useState<RFQQuoteTableItem[]>([]);

    const rfqNr = React.useMemo(() => decodeURIComponent(rfqNrEncoded), [rfqNrEncoded]);
    const rfqSummary = React.useMemo(() => rfqSummaries[rfqNr], [rfqSummaries, rfqNr]);
    const rfqDetails = React.useMemo(() => rfqsDetails[rfqNr], [rfqsDetails, rfqNr]);

    const [rfqDate, setRfqDate] = React.useState(new Date());

    const [isDeSelectItem, setIsDeSelectItem] = React.useState('');

    const getSearhColumns = () => {
        const searchColumns: string[] = [];
        columns.forEach((item) => {
            searchColumns.push(item.field || '');
        });

        return searchColumns;
    };

    const defaultColDef = React.useMemo(
        () => ({
            sortable: true,
            wrapHeaderText: true,
            resizable: true,
            autoHeaderHeight: true,
            suppressMovable: true,
            editable: false,
        }),
        [],
    );

    React.useEffect(() => {
        if (!rfqSummary) dispatch(fetchRFQs(false, rfqNr));
        else dispatch(fetchRFQDetails(rfqNr));
        // eslint-disable-next-line
    }, [rfqNr]);

    React.useEffect(() => {
        if (selectedQuotes.length > 0 && count.current == 0) {
            setIsNotSaved(false);
        }
    }, []);

    React.useEffect(() => {
        if (selectedQuotes.length > 0 && count.current == 1) {
            setIsNotSaved(true);
        }
    }, [selectedQuotes]);

    React.useEffect(() => {
        if (rfqDetails) {
            setSelectedQuotes(rfqDetails.cards ? rfqDetails.cards : []);
        }
    }, [rfqDetails]);

    React.useEffect(() => {
        if (rfqSummary) {
            setHeaderName(rfqSummary.title);
        }
    }, [rfqSummary, setHeaderName]);

    const saveRFQCards = () => {
        if (selectedQuotes.length > 0) {
            setIsNotSaved(false);
            count.current = 0;
            dispatch(updateRFQQuotesCardsData(rfqNr, selectedQuotes));
        }
    };
    const detailsItems = React.useMemo(
        () =>
            rfqDetails?.suppliersDetails
                .filter((details) => !onlyOpen || details.state !== RFQEntryState.Closed)
                .map((details) => ({ ...details, id: details.supplierContactEmail })) || [],
        [rfqDetails, onlyOpen],
    );

    let quotesTableData = React.useMemo<RFQQuoteTableItem[]>(
        () =>
            detailsItems.flatMap((details) =>
                !details.dataTable
                    ? []
                    : details.dataTable
                          .filter((row) => row.rfqNr === rfqSummary.number)
                          .map<RFQQuoteTableItem>((row) => ({
                              ...row,
                              threadId: details.threadId,
                              country: { name: details.country, code: details.countryCode },
                              supplier: details.supplierName,
                              supplierId: details.supplierId,
                              type: details.supplierType,
                              supplierReplyForm: details.externalAccessLink,
                              contacts: `${details.supplierContactName} (${details.supplierContactEmail})`,
                          })),
            ),
        [detailsItems, rfqSummary],
    );

    React.useEffect(() => {
        if (quotesTableData) {
            setRfqDate(new Date(quotesTableData[0]?.endingDate || ''));
        }
    }, [quotesTableData, setRfqDate]);

    //const unitPriceRngObj = getMaxMinAndMeanByField(quotesTableData, 'exwNetPriceEuro');
    const unitPriceRngObj = getMaxMinAndMeanByField(quotesTableData, 'priceCurrencyToEuro');
    const leadTimeRngObj = getMaxMinAndMeanByField(quotesTableData, 'leadTimeToDeliver');

    quotesTableData = quotesTableData.map((item) => {
        return {
            ...item,
            maxUnitPrice: unitPriceRngObj.max,
            minUnitPrice: unitPriceRngObj.min,
            averageUnitPrice: unitPriceRngObj.mean,
            maxLeadTime: leadTimeRngObj.max,
            minLeadTime: leadTimeRngObj.min,
            averageLeadTime: leadTimeRngObj.mean,
        };
    });

    const changeAssign = React.useCallback((username?: string) => dispatch(changeRFQAssignment(rfqNr, username)), [
        rfqNr,
        dispatch,
    ]);

    const handleItemSelectionChange = React.useCallback(
        (data, selectedNodes, selected: boolean) => {
            if (selected) {
                const index = selectedQuotes.findIndex(
                    (item) => item.id == data.id && item.supplierId === data.supplierId,
                );
                if (index >= 0) return;
                count.current = 1;
                data.availabilityPacsForCard = data.availabilityPacks;
                const dateObj = new Date();
                const month = dateObj.getMonth() + 1;
                const formatMonth = month < 10 ? '0' + month : month;
                const formatHour = dateObj.getHours() < 10 ? `0${dateObj.getHours()}` : dateObj.getHours();
                const formatMinutes = dateObj.getMinutes() < 10 ? `0${dateObj.getMinutes()}` : dateObj.getMinutes();
                data.cardDate = `${dateObj.getDate()}.${formatMonth}.${dateObj.getFullYear()} ${formatHour}:${formatMinutes}`;

                setSelectedQuotes([...selectedQuotes, { ...data }]);
            } else {
                if (selectedNodes.length === 0) {
                    //If user has unchecked the header checkbox to deselect all items at once
                    setSelectedQuotes([]);
                    return;
                }
                count.current = 1;
                const quotes = selectedQuotes;
                const updateQuotes = quotes.filter((item) => {
                    if (item.id === data.id && item.supplierId === data.supplierId) {
                        return false;
                    }
                    return true;
                });
                setSelectedQuotes([...updateQuotes]);
            }
        },
        [selectedQuotes, setSelectedQuotes, quotesTableData, setIsNotSaved],
    );

    const handleCopyCard = React.useCallback(
        (itemId, supplierId) => {
            const quote = selectedQuotes.find((item) => item.id == itemId && item.supplierId == supplierId);
            if (quote) {
                const dateObj = new Date();
                const month = dateObj.getMonth() + 1;
                const formatMonth = month < 10 ? '0' + month : month;
                const formatHour = dateObj.getHours() < 10 ? `0${dateObj.getHours()}` : dateObj.getHours();
                const formatMinutes = dateObj.getMinutes() < 10 ? `0${dateObj.getMinutes()}` : dateObj.getMinutes();
                const cardDate = `${dateObj.getDate()}.${formatMonth}.${dateObj.getFullYear()} ${formatHour}:${formatMinutes}`;

                //Creating new array to avoid copy reference
                const additionalCostsList = quote?.additionalCostList?.map((item) => ({
                    label: item.label,
                    value: item.value,
                })) || [{ label: '', value: 0 }];

                selectedQuotes.push({
                    ...quote,
                    id: uuidv4(),
                    additionalCostList: [...additionalCostsList],
                    isCopy: true,
                    cardDate: cardDate,
                });
                setSelectedQuotes([...selectedQuotes]);
                count.current = 1;
            }
        },
        [selectedQuotes, setSelectedQuotes, setIsNotSaved],
    );

    const removeCard = React.useCallback(
        (itemId: string, supplierId: string) => {
            count.current = 1;
            const quotes = selectedQuotes;
            const updatedQuotes = quotes.filter((item) => {
                if (item.id === itemId && item.supplierId === supplierId) {
                    return false;
                }
                return true;
            });
            setSelectedQuotes([...updatedQuotes]);
            setIsDeSelectItem(itemId + '_' + supplierId);
            saveRFQCards();
        },
        [selectedQuotes, setSelectedQuotes, setIsDeSelectItem, isDeSelectItem, setIsNotSaved],
    );

    const getAdditionalCost = React.useCallback(
        (additionalCostObject) => {
            selectedQuotes.map((item) => {
                if (item.id === additionalCostObject.id && item.supplierId === additionalCostObject.supplierId) {
                    item.additionalCostList = [...additionalCostObject.costList];
                    if (additionalCostObject.additionalCost > 0) {
                        let sum: any =
                            (item?.availabilityPacks ? +item.availabilityPacks : 0) *
                                (parseEuDecimalToDecimal(item.exwNetPriceEuro) || 0) +
                            additionalCostObject.additionalCost;
                        item.weightedPrice = sum / (item.availabilityPacks ? +item.availabilityPacks : 1);
                        item.additionalCost = additionalCostObject.additionalCost;
                    } else {
                        item.weightedPrice = 0;
                        item.additionalCost = 0;
                    }
                }
            });
            setSelectedQuotes([...selectedQuotes]);
        },
        [selectedQuotes, setSelectedQuotes],
    );

    const handleDataChange = React.useCallback(
        (data: Item) => {
            let dataArray = [];
            if (data?.expDate && data.expDate.length > 0) {
                const dateChunks = data.expDate.split('/');
                const dateObject = new Date();
                if (dateChunks[0] > 12) {
                    setIsError(true);
                    setErrorMessage(TK.errorMessageInvalidDate);
                    return;
                } else if (dateChunks[1] < dateObject.getFullYear()) {
                    setErrorMessage(TK.errorMessageInvalidYear);
                    setIsError(true);

                    return;
                }
            }

            dataArray.push(data);
            const dataOnlyStrings = dataArray.map((row) =>
                Object.keys(row).reduce(
                    (prev, column) => (typeof row[column] === 'string' ? { ...prev, [column]: row[column] } : prev),
                    {} as RFQQuoteTableItem,
                ),
            );

            const dataByThreadId = dataOnlyStrings.reduce(
                (prev, row) => ({
                    ...prev,
                    [row.threadId]: [...(prev[row.threadId] || []), row],
                }),
                {} as MapOf<RFQQuoteInfo[]>,
            );

            dispatch(changeRFQQuotesData(rfqNr, dataByThreadId));
        },
        [dispatch, rfqNr, setIsError, setErrorMessage],
    );

    const onPackSizeChangeHndle = React.useCallback(
        (e, itemId, supplierId) => {
            selectedQuotes.map((item) => {
                if (item.id === itemId && item.supplierId === supplierId) {
                    item.availabilityPacks = e.target.value >= 0 ? e.target.value : '';
                    let additionalCost = item.additionalCost || 0;
                    let sum =
                        (item.availabilityPacks ? +item.availabilityPacks : 0) *
                            (parseEuDecimalToDecimal(item.exwNetPriceEuro) || 0) +
                        additionalCost;
                    if (item.availabilityPacks && additionalCost > 0) {
                        item.weightedPrice = sum / (item.availabilityPacks ? +item.availabilityPacks : 1);
                    }
                }
            });
            count.current = 1;
            setSelectedQuotes([...selectedQuotes]);
        },
        [setSelectedQuotes, selectedQuotes],
    );

    const getNamesForColumns = () =>
        columns.map((item) => {
            item.headerName = t(item.headerName as TK);

            return item;
        });

    const handleDateChange = React.useCallback(
        (date: Date | null) => {
            setRfqDate(date || new Date());
        },
        [setRfqDate, rfqDate],
    );

    const onDragEnd = React.useCallback(
        (result: DropResult) => {
            // dropped outside the list
            if (!result.destination) {
                return;
            }

            const items = reorder(selectedQuotes, result.source.index, result.destination.index);
            count.current = count.current + 1;
            setSelectedQuotes([...items]);

            // this.setState({
            //   items
            // });
        },
        [selectedQuotes, setSelectedQuotes, setIsNotSaved],
    );

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsError(false);
    };

    const onCloseAuditReport = () => {
        setIsAuditOpen(false);
    };

    const onOpenAuditReport = () => {
        setIsAuditOpen(true);
    };

    return (
        <Page
            title={rfqSummary?.title || `${t(TK.loading)}...`}
            goBack={() => dispatch(goToRFQsList())}
            actionPanel={
                <PageActionPanel>
                    <ToggleButton size="small" value={onlyOpen} onChange={() => setOnlyOpen(!onlyOpen)}>
                        {onlyOpen === true ? t(TK.onlyOpen) : t(TK.viewAll)}
                    </ToggleButton>
                    <UserSelector
                        seletedUsername={rfqSummary?.assigneeUsername || ''}
                        disabled={
                            !myUser?.roles?.includes(UserRole.Administrator) &&
                            rfqSummary?.assigneeUsername !== myUser?.username
                        }
                        onChange={changeAssign}
                    />
                </PageActionPanel>
            }
        >
            <Snackbar open={isError} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" style={{ fontSize: '20px' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Loading isLoading={isLoading} />

            <Box display="flex" width="100%" justifyContent="right" bgcolor="white">
                <Box marginRight={1}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            margin="normal"
                            id="date-picker-dialog"
                            label="Closing date"
                            format="dd/MM/yyyy"
                            value={rfqDate}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Box>
                {/* <Box marginTop={3} marginRight={1}>
                    <Button color="primary" variant="contained" onClick={onOpenAuditReport}>
                        Audit report
                    </Button>
                </Box> */}
            </Box>
            {isLoading ? (
                <LinearProgress color="primary" />
            ) : (
                <Table
                    rowSelection="multiple"
                    pageSize={1000}
                    captionAnalytics={TK.TotalQuotes}
                    enablePagination={false}
                    isExportable={true}
                    total={quotesTableData.length}
                    stopEditingWhenCellsLoseFocus={false}
                    columnsDefinition={getNamesForColumns() as ColDef[] | ColGroupDef[]}
                    searchColumns={getSearhColumns()}
                    suppressClickEdit={true}
                    deselectRow={isDeSelectItem}
                    onChangeData={handleDataChange}
                    selectedQuotes={selectedQuotes}
                    suppressRowClickSelection={true}
                    defaultColDef={defaultColDef}
                    rowHeight={40}
                    data={quotesTableData}
                    onRowSelected={(event: RowSelectedEvent) => {
                        const {
                            node: { data },
                        } = event;
                        console.log('event  = ', event);
                        handleItemSelectionChange(data, event.api.getSelectedNodes(), !!event.node.isSelected());
                    }}
                />
            )}

            {selectedQuotes.length > 0 && (
                <Paper elevation={16}>
                    <Box marginLeft={2} marginRight={2} paddingTop={2} display="flex" justifyContent="space-between">
                        <Typography variant="h4">{t(TK.comparison)}</Typography>
                        <Button variant="contained" color="primary" onClick={() => saveRFQCards()}>
                            Save
                        </Button>
                    </Box>
                    <hr />
                    {isNotSaved && (
                        <Box padding={1}>
                            <Alert severity="info">{TK.unSavedChanges}</Alert>
                        </Box>
                    )}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable" direction="horizontal">
                            {(provided, snapshot) => (
                                <Box display="flex" flexDirection="row" width="100%" flexWrap="wrap">
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {selectedQuotes.map((item, index) => (
                                            <Draggable
                                                key={`${item.id}_${item.supplierId}`}
                                                draggableId={`${item.id}_${item.supplierId}`}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <ProductCard
                                                            title={item.supplier}
                                                            key={`${item.id}_${item.supplierId}`}
                                                            cardInfo={item}
                                                            removeCard={removeCard}
                                                            handleCopyCard={handleCopyCard}
                                                            onPackSizeChangeHndle={onPackSizeChangeHndle}
                                                            getAdditionalCost={getAdditionalCost}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Paper>
            )}
            {rfqNr && (
                <RFQAuditReport title="Audit report" rfqNr={rfqNr} open={isAuditOpen} onClose={onCloseAuditReport} />
            )}
        </Page>
    );
};

export default RFQDetailsPage;
