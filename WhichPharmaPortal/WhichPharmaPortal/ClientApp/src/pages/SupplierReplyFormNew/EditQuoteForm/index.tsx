import { Button, CardContent, CardHeader, Grid, Link } from '@material-ui/core';
import * as React from 'react';
import { RFQQuote } from '../../../models/RFQQuote';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import moment from 'moment';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import { CheckboxParagraph, MyCheckbox, QuoteBoxCard, TopRigthPanel, MyTooltip, UseStyle } from './styled';
import OurInfoForm from '../OurInfoForm';
import SupplierInfoForm from '../SupplierInfoForm';
import { RFQQuoteAvatar } from '../../../components/RFQQuoteAvatar';
import TermsAndConditionsDialog from '../TermsAndConditionsDialog';
import UserAvatar from '../../../components/UserAvatar';
import FormDialog from '../../../components/FormDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';

export interface QuoteBoxProps {
    quote: RFQQuote;
    responsible?: string;
    receiveEmail?: boolean;
    loading?: boolean;

    onChange: (quote: RFQQuote) => void;
    onChangeReceiveEmail: (expanded: boolean) => void;
    onAddAlternative: () => void;
}

const EditQuoteForm: React.FC<QuoteBoxProps> = ({
    quote,
    loading,
    responsible,
    onChange,
    onChangeReceiveEmail,
    onAddAlternative,
}) => {
    const t = useTranslations();
    const [value, setValue] = React.useState(quote);
    const [acceptTerms, setAcceptTerms] = React.useState(false);
    const [errors, setErrors] = React.useState<string[]>([]);
    const [termsAndConditionsOpen, setTermsAndConditionsOpen] = React.useState(false);
    const [skipping, setSkipping] = React.useState(false);
    const [isAction, setIsAction] = React.useState('');
    const [showAlert, setShowAlert] = React.useState(false);
    const [isAlternativePress, setIsAlternativePress] = React.useState(false);

    React.useEffect(() => setValue(quote), [setValue, quote]);

    const handleSubmitOffer = React.useCallback(() => {
        var errors = [
            value.exwNetPriceEuro?.length ? '' : TK.netPriceEuro,
            value.availabilityPacks ? '' : TK.availabilityPacks,
            value.leadTimeToDeliver?.length ? '' : TK.leadTimeToDeliver,
        ].filter((v) => v.length);

        if (errors.length) {
            setErrors(errors);
        } else {
            setIsAction('editSubmitOffer');
            if (value.isAlternative) {
                setShowAlert(true);
            } else {
                onChangeReceiveEmail(true);
                onChange({ ...value, state: RFQQuoteState.Quoted });
            }
        }
    }, [value, setErrors, onChange, onChangeReceiveEmail]);

    const handleInterest = () => {
        onChange({ ...value, state: RFQQuoteState.Open });
    };

    const handleSkip = () => {
        setIsAction('skipped');
        if (value.isAlternative) {
            setShowAlert(true);
        } else {
            setSkipping(true);
        }
    };

    const handleSkipped = (skipFormResult: { reason: string; duration: string; comments: string }) => {
        const { reason, duration, comments } = skipFormResult;
        const useCommentsAsReason = reason.startsWith('Other');
        let newComments = `Skip reason: ${useCommentsAsReason ? comments : reason}.`;
        if (duration?.length) newComments += ` Duration: ${duration}.`;
        if (!useCommentsAsReason) newComments += ` Comments: ${comments}.`;
        onChange({ ...value, state: RFQQuoteState.Declined, comments: newComments });
        if (isAlternativePress) {
            onAddAlternative();
            setIsAlternativePress(false);
        }
    };

    const handleOfferAlternative = () => {
        onAddAlternative();
    };

    const handleClickNoFunction = () => {
        if (isAction === 'skipped') {
            setSkipping(true);
        }

        if (isAction === 'editSubmitOffer') {
            onChangeReceiveEmail(true);
            onChange({ ...value, state: RFQQuoteState.Quoted });
        }
        setShowAlert(false);
    };

    const handleClickYesFunction = () => {
        if (isAction === 'skipped') {
            //handleSkipped({ reason: 'Suggested alternative', duration: '', comments: '' });
            setSkipping(true);
            setIsAlternativePress(true);
            //onAddAlternative();
        }

        if (isAction === 'editSubmitOffer') {
            onChangeReceiveEmail(true);
            onChange({ ...value, state: RFQQuoteState.Quoted });
            onAddAlternative();
        }

        setShowAlert(false);
    };

    const classes = UseStyle();

    return (
        <>
            <QuoteBoxCard variant="outlined">
                {(value.state === RFQQuoteState.Open || value.state === RFQQuoteState.InProgress) && (
                    <TopRigthPanel>
                        {quote.isAlternative && (
                            <MyTooltip title={t(TK.offerAlternative)}>
                                <Button
                                    className={classes.alternativeButton}
                                    disabled={loading}
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    onClick={handleOfferAlternative}
                                >
                                    <svg className="MuiSvgIcon-root" viewBox="0 0 100 100" width="30">
                                        <g>
                                            <g>
                                                <path d="M31.9,61.2h6.8L27.9,50.5L17.1,61.2h6.8c1,12.3,11.4,22,23.9,22v-7.9C39.7,75.3,32.9,69.1,31.9,61.2z" />
                                                <path d="M65.2,38.2h-6.7L69.2,49L80,38.2h-6.8c-1-12.3-11.4-22-24-22v7.9C57.3,24.2,64.1,30.3,65.2,38.2z" />
                                                <path d="M6,8.2v35.6h35.6V8.2H6z M23.8,37.3c-6.2,0-11.2-5-11.2-11.2s5-11.2,11.2-11.2S35,19.8,35,26C35,32.3,30,37.3,23.8,37.3z" />
                                            </g>
                                            <g>
                                                <g>
                                                    <path d="M31.9,61.2h6.8L27.9,50.5L17.1,61.2h6.8c1,12.3,11.4,22,23.9,22v-7.9C39.7,75.3,32.9,69.1,31.9,61.2z" />
                                                    <path d="M65.2,38.2h-6.7L69.2,49L80,38.2h-6.8c-1-12.3-11.4-22-24-22v7.9C57.3,24.2,64.1,30.3,65.2,38.2z" />
                                                    <path d="M6,8.2v35.6h35.6V8.2H6z M23.8,37.3c-6.2,0-11.2-5-11.2-11.2s5-11.2,11.2-11.2S35,19.8,35,26C35,32.3,30,37.3,23.8,37.3z" />
                                                </g>
                                                <g>
                                                    <path d="M58.4,56.3V92H94V56.3H58.4z M64.8,82.7l11.4-18.7l11.3,18.7H64.8z" />
                                                </g>
                                            </g>
                                        </g>
                                    </svg>
                                </Button>
                            </MyTooltip>
                        )}
                        <MyTooltip title={t(TK.decline)}>
                            <Button
                                className={classes.declineButton}
                                disabled={loading}
                                fullWidth
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={handleSkip}
                            >
                                <svg
                                    className="MuiSvgIcon-root"
                                    viewBox="0 -10 512 512"
                                    x="0"
                                    y="0"
                                    width="30"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g>
                                        <path d="m424 64h-88v-16c0-26.51-21.49-48-48-48h-64c-26.51 0-48 21.49-48 48v16h-88c-22.091 0-40 17.909-40 40v32c0 8.837 7.163 16 16 16h384c8.837 0 16-7.163 16-16v-32c0-22.091-17.909-40-40-40zm-216-16c0-8.82 7.18-16 16-16h64c8.82 0 16 7.18 16 16v16h-96z" />
                                        <path d="m78.364 184c-2.855 0-5.13 2.386-4.994 5.238l13.2 277.042c1.22 25.64 22.28 45.72 47.94 45.72h242.98c25.66 0 46.72-20.08 47.94-45.72l13.2-277.042c.136-2.852-2.139-5.238-4.994-5.238zm241.636 40c0-8.84 7.16-16 16-16s16 7.16 16 16v208c0 8.84-7.16 16-16 16s-16-7.16-16-16zm-80 0c0-8.84 7.16-16 16-16s16 7.16 16 16v208c0 8.84-7.16 16-16 16s-16-7.16-16-16zm-80 0c0-8.84 7.16-16 16-16s16 7.16 16 16v208c0 8.84-7.16 16-16 16s-16-7.16-16-16z" />
                                    </g>
                                </svg>
                            </Button>
                        </MyTooltip>
                    </TopRigthPanel>
                )}

                <CardHeader
                    avatar={responsible && <UserAvatar size="large" username={responsible} />}
                    title={
                        <b>
                            {t(TK.rfqNr)} {value.rfqNr} <RFQQuoteAvatar state={value.state} size="small" />
                        </b>
                    }
                    subheader={
                        value.state !== RFQQuoteState.Closed &&
                        value.endingDate && (
                            <u>
                                {t(TK.expires)} {moment(value.endingDate).fromNow()} (
                                {moment(value.endingDate).format('DD/MM/yyyy')})
                            </u>
                        )
                    }
                    titleTypographyProps={{ variant: 'h6' }}
                    subheaderTypographyProps={{ variant: 'subtitle2' }}
                />

                <CardContent>
                    <OurInfoForm readOnly value={value} setValue={setValue} fieldsWithError={errors} />

                    {value.state !== RFQQuoteState.Declined && (
                        <>
                            <hr />
                            <SupplierInfoForm
                                readOnly={
                                    value.state !== RFQQuoteState.Open && value.state !== RFQQuoteState.InProgress
                                }
                                value={value}
                                setValue={setValue}
                                fieldsWithError={errors}
                            />
                        </>
                    )}

                    {(value.state === RFQQuoteState.Open || value.state === RFQQuoteState.InProgress) && (
                        <>
                            <hr />
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <CheckboxParagraph>
                                        <MyCheckbox
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                        />
                                        {t(TK.accept)}{' '}
                                        <Link onClick={() => setTermsAndConditionsOpen(true)}>
                                            {t(TK.termsAndConditions)}
                                        </Link>
                                    </CheckboxParagraph>
                                </Grid>
                                <Grid item xs={12} className={classes.centerBox}>
                                    <Button
                                        className={classes.submitButton}
                                        disabled={loading || !acceptTerms}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        onClick={handleSubmitOffer}
                                    >
                                        {t(TK.submitOffer)}&emsp;
                                        <svg
                                            className="MuiSvgIcon-root"
                                            viewBox="0 0 24 24"
                                            width="30"
                                            aria-hidden="true"
                                        >
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                                        </svg>
                                    </Button>
                                </Grid>
                                <Grid item xs={6}></Grid>
                            </Grid>
                        </>
                    )}
                    {value.state === RFQQuoteState.Declined && (
                        <>
                            <hr />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Button
                                        disabled={loading}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        onClick={handleInterest}
                                    >
                                        {t(TK.iveChangedMyMindAndImInterested)}
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    )}
                    {value.state === RFQQuoteState.Quoted && (
                        <>
                            <hr />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Button
                                        disabled={loading}
                                        fullWidth
                                        variant="outlined"
                                        size="large"
                                        color="secondary"
                                        onClick={handleInterest}
                                    >
                                        {t(TK.changeQuote)}
                                    </Button>
                                </Grid>
                                {/* {value.isAlternative && (
                                    <Grid item xs={6}>
                                        <Button
                                            disabled={loading}
                                            fullWidth
                                            variant="outlined"
                                            size="large"
                                            color="secondary"
                                            onClick={handleOfferAlternative}
                                        >
                                            {t(TK.offerAlternative)}
                                        </Button>
                                    </Grid>
                                )} */}
                            </Grid>
                        </>
                    )}
                </CardContent>

                <TermsAndConditionsDialog
                    open={termsAndConditionsOpen}
                    onClose={() => setTermsAndConditionsOpen(false)}
                />

                <FormDialog
                    open={skipping}
                    onClose={() => setSkipping(false)}
                    onSubmit={(value) => handleSkipped(value as any)}
                    title={t(TK.decline)}
                    fields={[
                        {
                            key: 'reason',
                            label: t(TK.why),
                            options: [
                                t(TK.quoteLater),
                                t(TK.notInOurRange),
                                t(TK.onShortage),
                                t(TK.notCommercialized),
                                t(TK.authorizationCeased),
                                t(TK.exportBan),
                                t(TK.otherPleaseIndicate),
                            ],
                            validate: (value) => (value ? undefined : t(TK.mandatoryFields)),
                        },
                        {
                            key: 'duration',
                            label: `${t(TK.duration)} (${t(TK.ifApplicable)})`,
                            placeholder: `${t(TK.days)}`,
                        },
                        {
                            key: 'comments',
                            label: t(TK.comments),
                        },
                    ]}
                />
            </QuoteBoxCard>
            <ConfirmDialog
                title={t(TK.offerAlternative)}
                showAlert={showAlert}
                onClickNoFunction={handleClickNoFunction}
                onClickYesFunction={handleClickYesFunction}
            />
        </>
    );
};

export default EditQuoteForm;
