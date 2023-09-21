import * as React from 'react';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import Loading from '../../components/Loading';
import { useLocation } from 'react-router';
import { Button, Dialog, Typography } from '@material-ui/core';
import {
    getExternalRFQsSupplierDataAsync,
    getExternalSupplierCollaboratorsAsync,
    getExternalSupplierRFQsResposiblesAsync,
    putExternalSupplierRFQsDataAsync,
} from '../../fetch/requests';
import { RFQSupplierDetails } from '../../models/RFQSupplierDetails';
import { alertGenericError, doRequestAccessLink } from '../../store/Session/actions';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import ReactCountryFlag from 'react-country-flag';
import {
    QuoteColumnTitle,
    QuotesColumn,
    ColumnsPanel,
    WhiteTypography,
    QuotesBoxesContainer,
    WhiteButton,
} from './styled';
import { RFQQuote } from '../../models/RFQQuote';
import { RFQQuoteState } from '../../models/RFQQuoteState';
import EditQuoteForm from './EditQuoteForm';
import NewQuoteForm from './NewQuoteForm';
import { RFQQuoteInfo } from '../../models/RFQQuoteInfo';
import moment from 'moment';
import QuoteBox from './QuoteBox';
import { replyFormBackgroundCSS } from './background';
import RBPharmaIcon from '../../components/RBPharmaLogo';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { onlyUnique, reorder } from '../../utils/utils';
import { push } from 'react-router-redux';
import { PanelButtonsContainer } from '../../components/Panel';
import { MapOf } from '../../utils/Types';
import { usersUpdated } from '../../store/Users/actions';
import { isLoggingIn } from '../../store/Session/selectors';
import { Spinner } from 'reactstrap';
import FormDialog from '../../components/FormDialog';
import { useMemo } from 'react';

const uuidv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const adaptReceivedQuote = (quote: RFQQuoteInfo): RFQQuoteInfo => ({
    ...quote,
    currency: quote.currency || 'EURO',
    state: quote.endingDate && moment(quote.endingDate).isBefore() ? RFQQuoteState.Closed : quote.state,
});

const SupplierReplyForm: React.FC = () => {
    const location = useLocation();
    const t = useTranslations();
    const dispatch = useDispatch();

    const [loading, setLoading] = React.useState(true);
    const [showClosedColumn, setShowClosedColumn] = React.useState(false);
    const [details, setDetails] = React.useState<RFQSupplierDetails | undefined>(undefined);
    const [dataRows, setDataRows] = React.useState<RFQQuote[]>([]);
    const [responsibles, setResponsibles] = React.useState<MapOf<string>>({});
    const [opened, setOpened] = React.useState<string | undefined>(undefined);
    const [receiveEmail, setReceiveEmail] = React.useState<boolean>(true);
    const [addAlternative, setAddAlternative] = React.useState<RFQQuote | undefined>(undefined);
    const [requestAccessLink, setRequestAccessLink] = React.useState(false);
    const [isConfirm, setIsConfirm] = React.useState('');

    const loggingIn = useSelector(isLoggingIn);

    // eslint-disable-next-line
    const initialLocation = useMemo(() => location, []);

    const [rfqsNrs, token] = React.useMemo(() => {
        const query = queryString.parse(location.search);
        return [query.rfqsNrs && decodeURIComponent(query.rfqsNrs as string).split(','), query.token as string];
    }, [location]);

    React.useEffect(() => {
        getExternalSupplierCollaboratorsAsync(token).then((users) => dispatch(usersUpdated(users)));
    }, [dispatch, token]);

    React.useEffect(() => {
        if (!token) {
            setLoading(false);
        } else {
            getExternalRFQsSupplierDataAsync(rfqsNrs || undefined, token)
                .then((details) => {
                    var adaptedDetails: RFQSupplierDetails = {
                        ...details,
                        dataTable: details.dataTable.map(adaptReceivedQuote),
                    };

                    setDetails(adaptedDetails);
                    setDataRows(adaptedDetails?.dataTable || []);

                    var allRfqsNrs = details.dataTable.map((row) => row.rfqNr).filter(onlyUnique);

                    getExternalSupplierRFQsResposiblesAsync(allRfqsNrs, token).then(setResponsibles);
                })
                .finally(() => setLoading(false));
        }
    }, [rfqsNrs, token, setLoading, setDetails, setResponsibles]);

    const handleChange = React.useCallback(
        (quote: RFQQuote) => {
            const dataToRevert = dataRows;

            const prevState = dataRows.find((r) => r.id === quote.id)?.state;

            setDataRows((prev) => [quote, ...prev.filter((r) => r.id !== quote.id)]);

            if (prevState !== RFQQuoteState.Declined) {
                setOpened(undefined);
            }

            setLoading(true);

            putExternalSupplierRFQsDataAsync(
                { quotes: [quote], receiveEmailCopyWhenSubmitting: true /* receiveEmail*/ },
                token,
            )
                .catch(() => {
                    setDataRows(dataToRevert); // Revert
                    dispatch(alertGenericError());
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [dispatch, dataRows, token, receiveEmail],
    );

    const handleAddQuote = React.useCallback(
        (quote: RFQQuote) => {
            setLoading(true);

            putExternalSupplierRFQsDataAsync({ quotes: [quote] }, token)
                .then(() => {
                    setOpened(undefined);
                    setDataRows((prev) => [quote, ...prev]);
                    setAddAlternative(undefined);
                })
                .catch(() => {
                    dispatch(alertGenericError());
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [setDataRows, dispatch, token],
    );

    const handleQuoteBoxClick = React.useCallback(
        (quote: RFQQuote) => () => {
            setOpened(quote.id);
        },
        [setOpened],
    );

    const onDragEnd = React.useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            const dragFromState = result.source && RFQQuoteState[result.source.droppableId as RFQQuoteState];
            const dropToState = result.destination && RFQQuoteState[result.destination.droppableId as RFQQuoteState];

            if (!dragFromState || dragFromState === RFQQuoteState.Closed || dragFromState === RFQQuoteState.Quoted)
                return;
            if (!dropToState || dropToState === RFQQuoteState.Closed || dropToState === RFQQuoteState.Open) return;

            if (dropToState === RFQQuoteState.Quoted) {
                handleChange({ ...dataRows[result.source.index], state: RFQQuoteState.InProgress });
                setOpened(result.draggableId);
                return;
            }

            if (dropToState === dragFromState) {
                setDataRows((prev) => reorder(prev, result.source.index, result.destination?.index || 0));
            } else {
                handleChange({ ...dataRows[result.source.index], state: dropToState });
            }
        },
        [setDataRows, handleChange, dataRows],
    );

    const handleAddAlternative = React.useCallback(
        (forId: string) => () => {
            const forProduct = dataRows.find((row) => row.id === forId) as RFQQuote;
            setAddAlternative({
                id: uuidv4(),
                rfqNr: forProduct.rfqNr,
                endingDate: forProduct.endingDate,
                name: '',
                state: RFQQuoteState.InProgress,
            });
        },
        [dataRows],
    );

    const handleRequestAccessLink = React.useCallback(
        async (values: MapOf<string>) => {
            setRequestAccessLink(false);
            await dispatch(doRequestAccessLink(values.email));
        },
        [setRequestAccessLink, dispatch],
    );

    const handleSeeAllOrHide = React.useCallback(() => {
        if (!showClosedColumn) {
            setShowClosedColumn(true);
            dispatch(
                push({
                    ...location,
                    search: queryString.stringify({ token }),
                }),
            );
        } else {
            setShowClosedColumn(false);
            dispatch(push(initialLocation));
        }
    }, [dispatch, setShowClosedColumn, showClosedColumn, initialLocation, location, token]);

    return (
        <Page
            style={replyFormBackgroundCSS}
            title={
                <WhiteTypography variant="h4">
                    <RBPharmaIcon height="3rem" width="3rem" color="white" style={{ margin: '0 1rem' }} />|{' '}
                    {t(TK.requestsForQuote)}
                </WhiteTypography>
            }
            actionPanel={
                !loading &&
                details && (
                    <WhiteTypography variant="h5" align="right">
                        <b>{details.supplierName}</b> <ReactCountryFlag svg countryCode={details.countryCode} />
                        <Typography variant="subtitle2">
                            {details.supplierContactName} <i>({details.supplierContactEmail})</i>
                        </Typography>
                    </WhiteTypography>
                )
            }
        >
            <Loading isLoading={loading} />

            {loading && !details && <WhiteTypography>{t(TK.loading)}...</WhiteTypography>}
            {!loading && !details && (
                <>
                    <WhiteTypography>{t(TK.thisLinkIsNoLongerAvailable)}</WhiteTypography>

                    <Button
                        disabled={loggingIn}
                        variant="outlined"
                        size="large"
                        onClick={() => setRequestAccessLink(true)}
                    >
                        {loggingIn && <Spinner size="sm" />}
                        {t(TK.requestAnAccessLink)}
                    </Button>

                    <FormDialog
                        title={t(TK.requestAnAccessLink)}
                        fields={[{ key: 'email', label: t(TK.email) }]}
                        onClose={() => setRequestAccessLink(false)}
                        open={requestAccessLink}
                        onSubmit={handleRequestAccessLink}
                    />
                </>
            )}

            <PanelButtonsContainer>
                {!loading && details && (
                    <WhiteButton onClick={handleSeeAllOrHide} variant="outlined">
                        {t(showClosedColumn ? TK.viewOpen : TK.viewAll)}
                    </WhiteButton>
                )}
            </PanelButtonsContainer>

            {details && dataRows && (
                <DragDropContext onDragEnd={onDragEnd}>
                    <ColumnsPanel>
                        {[
                            { title: TK.new, states: [RFQQuoteState.Open] },
                            { title: TK.kanbanInterested, states: [RFQQuoteState.InProgress] },
                            { title: TK.skipped, states: [RFQQuoteState.Declined] },
                            { title: TK.quoted, states: [RFQQuoteState.Quoted, RFQQuoteState.Alternative] },
                            { title: TK.closed, states: [RFQQuoteState.Closed], hide: !showClosedColumn },
                        ]
                            .filter((i) => !i.hide)
                            .map(({ title, states }) => (
                                <Droppable key={states.join(',')} droppableId={RFQQuoteState[states[0]]}>
                                    {(provided, snapshot) => (
                                        <QuotesColumn widthPercentage={showClosedColumn ? 20 : 25}>
                                            <QuoteColumnTitle variant="h6">
                                                <b>{t(title)}</b>
                                            </QuoteColumnTitle>
                                            <QuotesBoxesContainer
                                                ref={provided.innerRef}
                                                $isDraggingOver={snapshot.isDraggingOver}
                                            >
                                                {dataRows.map(
                                                    (row, index) =>
                                                        states.includes(row.state) && (
                                                            <Draggable key={row.id} draggableId={row.id} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <QuoteBox
                                                                            quote={{
                                                                                ...row,
                                                                                username: responsibles[row.rfqNr],
                                                                            }}
                                                                            onClick={handleQuoteBoxClick(row)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ),
                                                )}
                                                {provided.placeholder}
                                            </QuotesBoxesContainer>
                                        </QuotesColumn>
                                    )}
                                </Droppable>
                            ))}
                    </ColumnsPanel>
                </DragDropContext>
            )}

            <Dialog maxWidth="sm" open={!!opened} onClose={() => setOpened(undefined)} scroll="body">
                {opened && (
                    <EditQuoteForm
                        loading={loading}
                        quote={dataRows.find((row) => row.id === opened) as RFQQuote}
                        responsible={responsibles[dataRows.find((row) => row.id === opened)?.rfqNr || '']}
                        receiveEmail={receiveEmail}
                        onChangeReceiveEmail={setReceiveEmail}
                        onChange={handleChange}
                        onAddAlternative={handleAddAlternative(opened)}
                    />
                )}
            </Dialog>

            <Dialog open={!!addAlternative} scroll="body">
                {addAlternative && (
                    <NewQuoteForm
                        token={token}
                        loading={loading}
                        defaultValue={addAlternative}
                        receiveEmail={receiveEmail}
                        onChangeReceiveEmail={setReceiveEmail}
                        onAdd={handleAddQuote}
                        onCancel={() => setAddAlternative(undefined)}
                    />
                )}
            </Dialog>
        </Page>
    );
};

export default SupplierReplyForm;
