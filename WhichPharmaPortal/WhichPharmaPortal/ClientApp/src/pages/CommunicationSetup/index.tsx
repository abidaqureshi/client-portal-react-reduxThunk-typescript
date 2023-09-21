import * as React from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import RFQProgress from '../../modules/RFQProgress';
import { RFQStep } from '../../modules/RFQProgress/RFQProgress';
import Page from '../../components/Page';
import { Button, Typography, LinearProgress, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { PanelButtonsContainer } from '../../components/Panel';
import SendIcon from '@material-ui/icons/Send';
import { useDispatch, useSelector } from 'react-redux';
import ProductsEmailTables from './ProductsEmailTables';
import EmailTemplates from './EmailTemplates';
import ProductsRFQsAssociation from './ProductsRFQsAssociation';
import { RFQ, EmailData } from './types';
import { MapOf } from '../../utils/Types';
import { RFQRequest } from '../../models/RFQRequest';
import {
    getProductSelectedSuppliers,
    getProductSelectedSupplierSelectedEmails,
    getSelectedSuppliers,
    getSelectedSuppliersEmails,
} from '../../store/Suppliers/selectors';
import { Supplier } from '../../models/Supplier';
import { submitRFQs } from '../../store/RFQs/actions';
import { isSubmittingRFQs } from '../../store/RFQs/selectors';
import queryString from 'query-string';
import {
    getAllProducts as getAllProductsV2,
    getSelectedProducts as getSelectedProductsV2,
} from '../../store/ProductsV2/selectors';
import {
    getAllProducts as getAllProductsV1,
    getSelectedProducts as getSelectedProductsV1,
} from '../../store/Products/selectors';
import { RFQQuote } from '../../models/RFQQuote';
import { getGoogleLogin } from '../../store/Session/selectors';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import appSettings from '../../appSettings';
import { alertGenericError } from '../../store/Session/actions';
import { ApplicationState } from '../../store';
import { Filters } from '../ProductsListV1/ProductsFilters/types';
import { useLocation } from 'react-router-dom';
import { Email } from '../../store/Suppliers/state';

const validateRFQQuote = (quote: RFQQuote): string | undefined => {
    if (!quote.name?.length) return 'Product name is mandatory';
    if (!quote.activeSubstances?.length) return 'Active substances are mandatory';
    if (!quote.unitQuant?.length) return '"Req. Quant." information is mandatory';
    return undefined;
};

var getSelectedProducts: (state: ApplicationState) => string[];
var getAllProducts: (state: ApplicationState) => { [id: string]: any };

const CommunicationSetup: React.FC = () => {
    const dispatch = useDispatch();
    const t = useTranslations();
    const location = useLocation();
    var host = window.location.host;
    const query2 = queryString.parse(location.search) as Filters;

    getSelectedProducts = getSelectedProductsV2;
    getAllProducts = getAllProductsV2;

    const googleLogin = useSelector(getGoogleLogin);
    const isSubmitting = useSelector(isSubmittingRFQs);
    const selectedProducts = useSelector(getSelectedProducts) || [];
    const selectedSuppliers = useSelector(getSelectedSuppliers) || [];
    const selectedSuppliersEmails = useSelector(getSelectedSuppliersEmails) || [];
    const selectedProductSuppliers = useSelector(getProductSelectedSuppliers) || {};
    const selectedProductSuppliersEmails = useSelector(getProductSelectedSupplierSelectedEmails) || {};

    const [rfqsAssociations, setRfqsAssociations] = React.useState<RFQ[]>([]);
    const [dataByCountry, setDataByCountry] = React.useState<MapOf<EmailData>>({});
    const [emailTemplates, setEmailTemplates] = React.useState<MapOf<string>>({});

    const [allTablesVerified, setAllTablesVerified] = React.useState(false);
    const [allProductsAssociated, setAllProductsAssociated] = React.useState(false);

    const [submittionError, setSubmittinError] = React.useState<string | undefined>(undefined);

    const allRFQsHaveId = !rfqsAssociations.some((rfq) => (rfq?.id?.length || 0) < 4);

    const errorMessage = !selectedProducts.length
        ? t(TK.noProductsSelectedError)
        : !allProductsAssociated
        ? t(TK.pleaseAssociateAllProductsToAnRFQ)
        : !allRFQsHaveId
        ? t(TK.pleaseMakeSureAllRFQsHaveAValidNumber)
        : !allTablesVerified
        ? t(TK.pleaseMarkAllProductsTablesAsVerified)
        : !Object.keys(emailTemplates).length
        ? t(TK.theEmailBodyCannotBeEmpty)
        : submittionError;

    const handleSubmition = React.useCallback(
        async (email?: string, password?: string, accessCode?: string) => {
            setSubmittinError(undefined);
            const productEmails: Email[] = [];
            Object.keys(selectedProductSuppliersEmails).forEach((key) =>
                selectedProductSuppliersEmails[key].forEach((item) => {
                    //create array of unique contacts not the email ones
                    if (productEmails.findIndex((obj) => obj.value === item.value) < 0) {
                        productEmails.push({ value: item.value, isCC: item.isCC });
                    }
                }),
            );

            const request: RFQRequest = {
                senderEmail: email,
                senderPassword: password || '',
                senderGmailAccessCode: accessCode,
                rfqNumbersToAssignToExistingOnes: rfqsAssociations
                    .filter((rfq) => rfq.useExistingRfq)
                    .map((rfq) => rfq.id),
                emailsData: productEmails
                    .filter((e) => !e.isCC)
                    .map((productSpEmail) => {
                        const supplier = selectedSuppliers.find(
                            (s) => s.contacts.findIndex((c) => c.email === productSpEmail.value) >= 0,
                        ) as Supplier;
                        const contact = supplier.contacts.find((c) => c.email === productSpEmail.value);
                        const data = dataByCountry[supplier.countryCode];
                        const cc = supplier.contacts
                            .filter((c) => selectedSuppliersEmails.findIndex((e) => e.isCC && e.value === c.email) >= 0)
                            .map((c) => c.email);
                        return {
                            supplierId: supplier.id,
                            recipient: productSpEmail.value,
                            recipientName: `${contact?.name} (${supplier.name})`,
                            cc: cc,
                            subject: data.subject,
                            tableData: data.table,
                            emailTemplate: emailTemplates[supplier.countryCode] || emailTemplates['default'],
                        };
                    }),
            };

            var dataErrors = request.emailsData
                .map((data) => ({
                    data,
                    errors: data.tableData.map(validateRFQQuote).filter((error) => error?.length),
                }))
                .filter((data) => data.errors?.length);

            if (dataErrors.length) {
                setSubmittinError(
                    `Invalid data for "${dataErrors[0].data.recipientName}" - ${dataErrors[0].errors[0]}`,
                );
            } else {
                dispatch(submitRFQs(request));
            }
        },
        [
            dispatch,
            setSubmittinError,
            dataByCountry,
            emailTemplates,
            selectedSuppliers,
            selectedSuppliersEmails,
            selectedProducts,
            selectedProductSuppliers,
            selectedProductSuppliersEmails,
            rfqsAssociations,
        ],
    );

    React.useEffect(() => setSubmittinError(undefined), [setSubmittinError, dataByCountry]);

    const handleProceed = React.useCallback(() => {
        if (googleLogin) {
            handleSubmition(undefined, undefined, googleLogin.code);
        } else {
            dispatch(alertGenericError());
        }
    }, [googleLogin, dispatch, handleSubmition]);

    const handleGoogleLoginFailure = React.useCallback(() => {
        dispatch(alertGenericError());
    }, [dispatch]);

    const handleGoogleLoginSuccess = React.useCallback(
        (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
            var res = response as GoogleLoginResponseOffline;
            handleSubmition(undefined, undefined, res.code);
        },
        [handleSubmition],
    );

    const handleAutoFillField = React.useCallback(
        (rfqNr: string, field: string, value: string) => {
            setDataByCountry((prev) =>
                Object.keys(prev)
                    .map<MapOf<EmailData>>((country) => ({
                        [country]: {
                            ...prev[country],
                            table: prev[country].table.map<RFQQuote>((row) =>
                                row.rfqNr !== rfqNr
                                    ? row
                                    : {
                                          ...row,
                                          name: field === TK.name ? value : row.name,
                                          activeSubstances:
                                              field === TK.activeSubstances ? value : row.activeSubstances,
                                          productCode: field === TK.productCode ? value : row.productCode,
                                          packSize: field === TK.packSize ? value : row.packSize,
                                          unitQuant: field === TK.unitQuant ? value : row.unitQuant,
                                          countryOfOrigin: field === TK.countryOfOrigin ? value : row.countryOfOrigin,
                                          maHolder: field === TK.maHolder ? value : row.maHolder,
                                      },
                            ),
                        },
                    }))
                    .reduce((prev, curr) => Object.assign(prev, curr), {}),
            );
        },
        [setDataByCountry],
    );

    return (
        <Page title={t(TK.emailConfiguration)}>
            <Dialog open={isSubmitting}>
                <DialogTitle>{t(TK.creatingRFQsAndSendingEmails)}</DialogTitle>
                <DialogContent>
                    <LinearProgress />
                </DialogContent>
            </Dialog>

            <RFQProgress activeStep={RFQStep.CommunicationSetup} />

            <ProductsRFQsAssociation
                rfqs={rfqsAssociations}
                setRfqs={setRfqsAssociations}
                onAllProductsAssociatedChanged={setAllProductsAssociated}
                onAutoFillField={handleAutoFillField}
            />

            <ProductsEmailTables
                rfqs={rfqsAssociations}
                dataByCountry={dataByCountry}
                setDataByCountry={setDataByCountry}
                onVerifiedChanged={setAllTablesVerified}
            />

            <EmailTemplates emailTemplates={emailTemplates} setEmailTemplates={setEmailTemplates} />

            {/* <QuoteReplyFormSetup /> */}

            <PanelButtonsContainer>
                {errorMessage && <Typography color="error">{errorMessage}</Typography>}

                {googleLogin ? (
                    <>
                        <GoogleLogin
                            style={{ height: '20px' }}
                            theme="dark"
                            disabled={!!errorMessage}
                            clientId={appSettings.googleClientId}
                            render={(props) => (
                                <Button
                                    disabled={props.disabled}
                                    onClick={props.onClick}
                                    variant="contained"
                                    color="primary"
                                    endIcon={<SendIcon />}
                                >
                                    {t(TK.sendUsingOtherAccount)}
                                </Button>
                            )}
                            onSuccess={handleGoogleLoginSuccess}
                            onFailure={handleGoogleLoginFailure}
                            scope={appSettings.googleLoginScope}
                            prompt="consent" // get refresh token
                            responseType="code"
                            accessType="offline"
                        />
                        <Button
                            disabled={!!errorMessage}
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon />}
                            onClick={handleProceed}
                        >
                            {t(TK.send)}
                        </Button>
                    </>
                ) : (
                    <GoogleLogin
                        style={{ height: '20px' }}
                        theme="dark"
                        clientId={appSettings.googleClientId}
                        render={(props) => (
                            <Button
                                disabled={props.disabled && !!errorMessage}
                                onClick={props.onClick}
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                            >
                                {t(TK.createRfqAndSendTheEmails)}
                            </Button>
                        )}
                        onSuccess={handleGoogleLoginSuccess}
                        onFailure={handleGoogleLoginFailure}
                        scope={appSettings.googleLoginScope}
                        prompt="consent" // get refresh token
                        responseType="code"
                        accessType="offline"
                    />
                )}
            </PanelButtonsContainer>
        </Page>
    );
};

export default CommunicationSetup;
