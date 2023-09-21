import * as React from 'react';
import { useParams, useLocation } from 'react-router';

import Page from '../../components/Page';
import queryString from 'query-string';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { useSelector, useDispatch } from 'react-redux';
import { getRFQSummaries, getRFQDetails, isLoadingRFQs } from '../../store/RFQs/selectors';
import Loading from '../../components/Loading';
import { fetchRFQDetails, fetchRFQs, changeRFQAssignment, changeRFQData } from '../../store/RFQs/actions';
import { Typography, Badge, Tooltip, IconButton } from '@material-ui/core';
import { RFQEntryState } from '../../models/RFQEntryState';
import MailIcon from '@material-ui/icons/Mail';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import { RFQSupplierDetails } from '../../models/RFQSupplierDetails';
import { RFQItemActionsPanel, StateLabel } from './styled';
import List from '../../components/List';
import { goToRFQDetails, goToRFQsList } from '../../store/Router/actions';
import UserSelector from '../../components/UserSelector';
import { PageActionPanel } from '../../components/Page/styled';
import { ToggleButton } from '@material-ui/lab';
import { getMyUser } from '../../store/Users/selectors';
import moment from 'moment';
import Table, { TableSettings } from '../../components/Table';
import { columns } from './columns';
import { getRFQDetailsTableSettings, getRFQDetailsTableDefaultSettings } from '../../store/Session/selectors';
import { updateRFQDetailsTableSettings } from '../../store/Session/actions';
import { Item } from '../../components/Table/types';
import { MapOf } from '../../utils/Types';
import { UserRole } from '../../models/UserRole';
import HttpIcon from '@material-ui/icons/Http';
import { RFQQuoteInfo } from '../../models/RFQQuoteInfo';

const getStateTK = (state: RFQEntryState): TK =>
    state === RFQEntryState.Open
        ? TK.open
        : state === RFQEntryState.Closed
        ? TK.closed
        : state === RFQEntryState.SupplierWaitingReply
        ? TK.supplierWaitingReply
        : state === RFQEntryState.Declined
        ? TK.declined
        : TK.unknown;

const RFQEntryLeftPanel: React.FC<{ entryDetails: RFQSupplierDetails }> = ({ entryDetails }) => {
    return (
        <div>
            <Typography>
                <b>{entryDetails.supplierName}</b> - {entryDetails.supplierContactName} (
                {entryDetails.supplierContactEmail})
            </Typography>
        </div>
    );
};

interface RFQQuoteTableItem extends RFQQuoteInfo {
    threadId: string;
    country: { name: string; code: string };
    supplier: string;
    contacts: string;
}

const RFQEntryRightPanel: React.FC<{ entryDetails: RFQSupplierDetails }> = ({ entryDetails }) => {
    const t = useTranslations();
    const rfqUrl = entryDetails.externalAccessLink?.split('&')[0] as string;
    return (
        <RFQItemActionsPanel>
            <Typography>
                <b>Ending Date: </b> {moment(entryDetails.dataTable[0].endingDate).format('DD/MM/YYYY')}
            </Typography>

            {entryDetails.externalAccessLink && (
                <Tooltip title={t(TK.externalLinkForSupplierReplyForm)}>
                    <IconButton href={rfqUrl} target="blank">
                        <HttpIcon />
                    </IconButton>
                </Tooltip>
            )}
            {!!entryDetails.unreadMessages && (
                <Tooltip title={t(TK.unviewedReplies)}>
                    <Badge badgeContent={entryDetails.unreadMessages} color="error">
                        <MailIcon />
                    </Badge>
                </Tooltip>
            )}
            {entryDetails.state === RFQEntryState.SupplierWaitingReply && (
                <Tooltip title={t(TK.supplierWaitingReply)}>
                    <HourglassFullIcon />
                </Tooltip>
            )}
            <Typography>
                <StateLabel $rfqEntryState={entryDetails.state}>{t(getStateTK(entryDetails.state))}</StateLabel>
            </Typography>
        </RFQItemActionsPanel>
    );
};

interface Filters {
    [filterKey: string]: string | string[] | null | undefined;
}

const RFQDetailsPage: React.FC = () => {
    const { rfqNrEncoded } = useParams<{ rfqNrEncoded: string }>();
    const dispatch = useDispatch();
    const t = useTranslations();
    const location = useLocation();
    const rfqSummaries = useSelector(getRFQSummaries) || {};
    const rfqsDetails = useSelector(getRFQDetails);
    const myUser = useSelector(getMyUser);
    const isLoading = useSelector(isLoadingRFQs);
    const tableSettings = useSelector(getRFQDetailsTableSettings);

    const query = React.useMemo(() => {
        var query = queryString.parse(location.search);
        return query as Filters & { sortBy: string; sortType?: 'asc' | 'desc' };
        // eslint-disable-next-line
    }, [location.search]);

    const [onlyOpen, setOnlyOpen] = React.useState(false);

    const rfqNr = React.useMemo(() => decodeURIComponent(rfqNrEncoded), [rfqNrEncoded]);
    const rfqSummary = React.useMemo(() => rfqSummaries[rfqNr], [rfqSummaries, rfqNr]);
    const rfqDetails = React.useMemo(() => rfqsDetails[rfqNr], [rfqsDetails, rfqNr]);

    React.useEffect(() => {
        if (!rfqSummary) dispatch(fetchRFQs(false, rfqNr));
        else dispatch(fetchRFQDetails(rfqNr));
        // eslint-disable-next-line
    }, [rfqNr]);

    const detailsItems = React.useMemo(
        () =>
            rfqDetails?.suppliersDetails
                .filter((details) => !onlyOpen || details.state !== RFQEntryState.Closed)
                .map((details) => ({ ...details, id: details.supplierContactEmail })) || [],
        [rfqDetails, onlyOpen],
    );

    const quotesTableData = React.useMemo<RFQQuoteTableItem[]>(
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
                              contacts: `${details.supplierContactName} (${details.supplierContactEmail})`,
                          })),
            ),
        [detailsItems, rfqSummary],
    );

    const changeAssign = React.useCallback((username?: string) => dispatch(changeRFQAssignment(rfqNr, username)), [
        rfqNr,
        dispatch,
    ]);
    const handleSettingsChange = React.useCallback(
        (settings: TableSettings) => dispatch(updateRFQDetailsTableSettings(settings)),
        [dispatch],
    );
    const handleResetSettings = React.useCallback(
        () => dispatch(updateRFQDetailsTableSettings(getRFQDetailsTableDefaultSettings())),
        [dispatch],
    );

    const handleSortingChange = React.useCallback(
        (sortBy?: string, sortType?: 'asc' | 'desc') => dispatch(goToRFQDetails(rfqNr, { sortBy, sortType })),
        [dispatch],
    );


    const handleDataChange = React.useCallback(
        (data: Item[]) => {
            const dataOnlyStrings = data.map((row) =>
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

            dispatch(changeRFQData(rfqNr, dataByThreadId));
        },
        [dispatch, rfqNr],
    );

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
            <Loading isLoading={isLoading} />
            <Typography variant="h4">{t(TK.quotes)}</Typography>
            <Table
                settings={tableSettings}
                onChangeSettings={handleSettingsChange}
                onResetSettings={handleResetSettings}
                columnsDefinition={columns}
                onChangeData={handleDataChange}
                data={quotesTableData}
                sortBy={query.sortBy}
                sortDirection={query.sortType}
                onChangeSorting={handleSortingChange}
            />
            <hr />
            <Typography variant="h4">{t(TK.conversations)}</Typography>
            <List
                items={detailsItems}
                renderName={(details): React.ReactNode => <RFQEntryLeftPanel entryDetails={details} />}
                renderSummary={(details): React.ReactNode => moment(details.lastIteration).fromNow()}
                renderActions={(details): React.ReactNode => <RFQEntryRightPanel entryDetails={details} />}
            />
        </Page>
    );
};

export default RFQDetailsPage;
