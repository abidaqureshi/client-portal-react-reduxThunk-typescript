import * as React from 'react';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import Panel, { PanelButtonsContainer } from '../../../components/Panel';
import { AppBar, Tabs, Tab, Button, Typography, Grid, Checkbox } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import { useCountriesSet, useOriginsSet } from '../../../store/Sets/hooks';
import { useBackupSet } from '../../../store/SetsV2/hooks';
import SingleSelectInput from '../../../components/inputs/SingleSelectInput';
import { AdministrationForm } from '../../../models/AdministrationForm';
import { PharmaUnits } from '../../../models/PharmaUnits';
import { DrugForm } from '../../../models/DrugForm';
import { getPlatformPformProcessingSettings, getPlatformProcessingSettings, isLoadingPlatformData } from '../../../store/Platform/selectors';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchPformPlatformProcessingSettings,
    fetchPlatformProcessingSettings,
    savePlatformProcessingSettings,
    sendReprocessRequest,
    sendRestoreFromBackup,
} from '../../../store/Platform/actions';
import { ProcessingSettings } from '../../../models/ProcessingSettings';
import { MapOf } from '../../../utils/Types';
import MappingTable from './MappingTable';
import PFormMappingTable from './PFormMappingTable';
import MultipleSelectInput from '../../../components/inputs/MultipleSelectInput';
import { MappingTableContainer } from './MappingTable/styled';
import { removeEmptyArrayFields } from '../../../utils/utils';
import TextInput from '../../../components/inputs/TextInput';
import FormDialog from '../../../components/FormDialog';
import { requestServer } from '../../../store/Session/actions';
import { getPlatformProcessingSettingsAsync, getPlatformTermsTranslationsAsync } from '../../../fetch/requests';
import { AppThunkDispatch } from '../../../store';
import { Search } from 'history';
import { SearchResult } from '../../../models/SearchResult';
import { ProcessingPformsSettings } from '../../../models/ProcessingPformsSettings';
import CountryFlag from '../../../components/CountryFlag';
import { Country } from '../../../models/Country';
import CatsMappingTable from './CatsMappingTable';
import ATCMappingTable from './ATCMappingTable';

const StandardTermsOriginValue = 'Standard Terms';

const getMappings = (values?: ProcessingSettings): ProcessingSettings => ({
    administrationFormsMap: Object.keys(AdministrationForm)
        .filter((v) => typeof v === 'string' && v !== 'None')
        .map((key) => ({ [key]: values?.administrationFormsMap[key] || [] }))
        .reduce((prev, curr) => Object.assign(prev, curr), {}),
    drugFormsMap: Object.keys(DrugForm)
        .filter((v) => typeof v === 'string' && v !== 'None')
        .map((key) => ({ [key]: values?.drugFormsMap[key] || [] }))
        .reduce((prev, curr) => Object.assign(prev, curr), {}),
    pharmaUnitsMap: Object.keys(PharmaUnits)
        .filter((v) => typeof v === 'string' && v !== 'None')
        .map((key) => ({ [key]: values?.pharmaUnitsMap[key] || [] }))
        .reduce((prev, curr) => Object.assign(prev, curr), {}),
    administrationFormPresenceFields: values?.administrationFormPresenceFields || [],
    drugFormPresenceFields: values?.drugFormPresenceFields || [],
    packagePresenceFields: values?.packagePresenceFields || [],
    catsMap: {},
    atcMap: {},
    drugFormsMap2: {},
    dciMap: {},
    strengthPresenceFields: values?.strengthPresenceFields || [],
    culture: values?.culture || '',
    decimalSeparator: values?.decimalSeparator || '',
    numberGroupSeparator: values?.numberGroupSeparator || '',
});

const productFields = ['name', 'package', 'strength', 'drugForm', 'administrationForm', 'notes'];

const ProcessingSettingsPanel: React.FC = () => {
    const t = useTranslations();
    const dispatch = useDispatch();

    const mappingsFromServer = useSelector(getPlatformProcessingSettings);
    const mappingsFromServerPf = useSelector(getPlatformPformProcessingSettings);
    const loading = useSelector(isLoadingPlatformData);
    const origins = useOriginsSet();
    const backups = useBackupSet();
    const countries = Object.fromEntries( useCountriesSet().map(I => [I.alpha2Code, I.name]));
    const [origin, setOrigin] = React.useState<string | undefined>(undefined);
    const [country, setCountry] = React.useState<Country>();
    const [changed, setChanged] = React.useState<boolean>(false);
    const [tab, setTab] = React.useState(0);
    const [values, setValues] = React.useState<ProcessingSettings>(getMappings());
    const [valuesPforms, setPformsValues] = React.useState<SearchResult<ProcessingPformsSettings>>({ items: [], total: 0 });
    const [valuesPforms2, setPformsValues2] = React.useState<MapOf<ProcessingPformsSettings>>({});
    const [processProductsDialog, setProcessProductsDialog] = React.useState(false);
    const [copyDialog, setCopyDialog] = React.useState(false);

    const handleMappingValueChange = React.useCallback(
        (propertyName: string) => (newValues: MapOf<string[]>) => {
            setChanged(true);
            setValues((prev) => ({
                ...prev,
                [propertyName]: newValues,
            }));
        },
        [setChanged, setValues],
    );
    const handleMappingValueChange2 = React.useCallback(
        (propertyName: string) => (newValues: SearchResult<ProcessingPformsSettings>) => {
            setChanged(true);
            setPformsValues((prev) => ({
                ...prev,
                [propertyName]: newValues,
            }));
        },
        [setChanged, setPformsValues],
    );
    const handleMappingValueChange3 = React.useCallback(
        (propertyName: string) => (newValues: MapOf<ProcessingPformsSettings>) => {
            setChanged(true);
            setPformsValues2(newValues);
            values.drugFormsMap2 = newValues;
            setValues(values);
        },
        [setChanged, setPformsValues2, setValues, values],
    );

    const handleFieldsValueChange = React.useCallback(
        (propertyName: string) => (newValues: any) => {
            setChanged(true);
            setValues((prev) => ({
                ...prev,
                [propertyName]: newValues,
            }));
        },
        [setChanged, setValues],
    );

    const handleReset = React.useCallback(() => {
        setValues(getMappings((origin && (mappingsFromServer[origin] as ProcessingSettings)) || undefined));
        setChanged(false);
    }, [setChanged, setValues, origin, mappingsFromServer]);

    const handleSave = React.useCallback(() => {
        origin &&
            dispatch(
                savePlatformProcessingSettings(origin, {
                    ...values,
                    drugFormsMap: removeEmptyArrayFields(values.drugFormsMap),
                    administrationFormsMap: removeEmptyArrayFields(values.administrationFormsMap),
                    pharmaUnitsMap: removeEmptyArrayFields(values.pharmaUnitsMap),
                }),
            );
    }, [dispatch, origin, values]);

    const handleOriginChange = React.useCallback(
        (origin: string) => {
            setValues(getMappings());
            origin && dispatch(fetchPformPlatformProcessingSettings(origin));
            setOrigin(origin);
            //setValues(fetcheddata);
        },
        [setOrigin, dispatch],
    );

    React.useEffect(() => {
        origin && mappingsFromServer[origin] && setValues(mappingsFromServer[origin] as ProcessingSettings);
        
        //origin && mappingsFromServerPf[origin] && setPformsValues(mappingsFromServerPf[origin] as SearchResult<ProcessingPformsSettings>);
        if (origin != undefined) {
            var pf = mappingsFromServerPf[origin] as ProcessingSettings;
            //setPformsValues(new { items: pf.drugFormsMap2, total: Object.keys(pf.drugFormsMap2).length } as SearchResult<ProcessingPformsSettings>)
            setPformsValues2(pf.drugFormsMap2);
        }
        setChanged(false);
        // eslint-disable-next-line
    }, [setChanged, mappingsFromServer, setPformsValues, setPformsValues2, setValues]);

    const openProcessProductsDialog = React.useCallback(
        () => setProcessProductsDialog(true),
        [setProcessProductsDialog],
    );
    const closeProcessProductsDialog = React.useCallback(
        () => setProcessProductsDialog(false),
        [setProcessProductsDialog],
    );
    const openCopyDialog = React.useCallback(() => setTab(4), [setTab]);
    const closeCopyDialog = React.useCallback(() => setCopyDialog(false), [setCopyDialog]);
    const openCopyDialog2 = React.useCallback(() => setCopyDialog(true), [setCopyDialog]);

    const handleInitiateBackup = React.useCallback(
        (values: MapOf<string>) => {
            closeProcessProductsDialog();
            if (origin) {
                dispatch(sendReprocessRequest(origin, [values['name']]));
            }
        },
        [closeProcessProductsDialog, dispatch, origin],
    );

    const handleCopyFromOther = React.useCallback(
        ({ origin: copyFromOrigin }) => {
            closeCopyDialog();
            if (origin && copyFromOrigin) {
                dispatch(sendRestoreFromBackup(origin, [copyFromOrigin]))
            }
            //const thunkDispatch = dispatch as AppThunkDispatch;


        },
        [dispatch, closeCopyDialog, values, origin],
    );

    return (
        <Panel title={t(TK.processingSettings)}>
            <Grid container spacing={1}>
                <Grid item xs={12} md={4} lg={6}>
                    <SingleSelectInput
                        label={t(TK.scrapingOrigin)}
                        value={origin}
                        options={origins}
                        isLoading={!origins?.length}
                        onChange={handleOriginChange}
                        
                        renderOption={(option: string): React.ReactNode => (
                            <React.Fragment>
{/*                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                />*/}
                                <CountryFlag
                                    countryCode={option}
                                    showCode={false}
                                    country={`${countries[option]} (${option})`}
                                />
                            </React.Fragment>
                        )}

                    />
                </Grid>
                <Grid item xs={12} md={4} lg={2}>
                    <Button disabled={!origin} onClick={openCopyDialog} fullWidth variant="contained">
                        {t(TK.fullList)}
                    </Button>
                </Grid>
                <Grid item xs={12} md={4} lg={2}>
                    <Button disabled={!origin} onClick={openProcessProductsDialog} fullWidth variant="contained">
                        {t(TK.backupPlatform)}
                    </Button>
                </Grid>
                <Grid item xs={12} md={4} lg={2}>
                    <Button disabled={!origin} onClick={openCopyDialog2} fullWidth variant="contained">
                        {t(TK.backupRestorePlatform)}
                    </Button>
                </Grid>
            </Grid>

            <FormDialog
                open={processProductsDialog}
                onClose={closeProcessProductsDialog}
                onSubmit={handleInitiateBackup}
                title={t(TK.backupPlatform)}
                fields={[
                    {
                        key: 'name',
                        label: t(TK.name),
                        placeholder: 'e.g. BEBEGEL',
                        freeSolo: true,
                        options: backups,
                        validate: (value) => (!value || value.length < 2 ? t(TK.minimumCharacters, 2) : undefined),
                    },
                ]}
            />

            <FormDialog
                open={copyDialog}
                onClose={closeCopyDialog}
                onSubmit={handleCopyFromOther}
                title={t(TK.backupRestorePlatform
                )}
                fields={[
                    {
                        key: 'origin',
                        label: t(TK.scrapingOrigin),
                        options: backups,
                    },
                ]}
            />

            {origin && (
                <>
                    <AppBar position="static">
                        <Tabs value={tab} onChange={(_, tab) => setTab(tab)} variant="fullWidth">
                            <Tab label={t(TK.general)} />
                            <Tab label={t(TK.drugForm)} />
                            <Tab label={t(TK.activeSubstances)} />
                            <Tab label={t(TK.atc)} />
                        </Tabs>
                    </AppBar>
                    <SwipeableViews animateHeight axis="x" index={tab} onChangeIndex={setTab}>
                        <MappingTableContainer>
                            <TextInput
                                label={t(TK.culture)}
                                value={values.culture}
                                placeholder={'Example: en-GB'}
                                onChange={handleFieldsValueChange('culture')}
                            />
                            <TextInput
                                label={t(TK.decimalSeparator)}
                                value={values.decimalSeparator}
                                placeholder={'Example: .        (like 1,000.50)'}
                                onChange={handleFieldsValueChange('decimalSeparator')}
                            />
                            <TextInput
                                label={t(TK.numberGroupSeparator)}
                                value={values.numberGroupSeparator}
                                placeholder={'Example: ,        (like 1,000.50)'}
                                onChange={handleFieldsValueChange('numberGroupSeparator')}
                            />
                            <Typography variant="h5">{t(TK.fields)}</Typography>
                            <Typography variant="caption">
                                * {t(TK.specifyProductFieldsWhereInfoCanBeFound)}.
                            </Typography>
                            <MultipleSelectInput
                                limitTags={10}
                                allowAdd
                                label={t(TK.drugForm)}
                                values={values.drugFormPresenceFields}
                                options={productFields}
                                onChange={handleFieldsValueChange('drugFormPresenceFields')}
                            />
                            <MultipleSelectInput
                                limitTags={10}
                                allowAdd
                                label={t(TK.administrationForm)}
                                values={values.administrationFormPresenceFields}
                                options={productFields}
                                onChange={handleFieldsValueChange('administrationFormPresenceFields')}
                            />
                            <MultipleSelectInput
                                limitTags={10}
                                allowAdd
                                label={t(TK.package)}
                                values={values.packagePresenceFields}
                                options={productFields}
                                onChange={handleFieldsValueChange('packagePresenceFields')}
                            />
                            <MultipleSelectInput
                                limitTags={10}
                                allowAdd
                                label={t(TK.strength)}
                                values={values.strengthPresenceFields}
                                options={productFields}
                                onChange={handleFieldsValueChange('strengthPresenceFields')}
                            />
                        </MappingTableContainer>
                        {valuesPforms2 && <PFormMappingTable
                            values={values.drugFormsMap2}
                            values2={valuesPforms}
                            onChange={handleMappingValueChange3('drugFormsMap')}
                            onChange2={handleMappingValueChange2('drugFormsMap')}
                        />}
                        {values.dciMap && < PFormMappingTable
                            values={values.dciMap}
                            values2={{ items: [], total: 0 }}
                            onChange={(v) => { }}
                            onChange2={(v) => { }}
                        />}
                        {values.atcMap && < ATCMappingTable
                            values={values.atcMap}
                            onChange={(v) => { }}
                        />}
                        <CatsMappingTable
                            values={values.catsMap}
                            values2={{ items: [], total: 0 }}
                            onChange={(v) => {}}
                            onChange2={(v) => {}}
                            //onChange={ha}

                        />

                    </SwipeableViews>

                    <PanelButtonsContainer>
                        <Button onClick={handleReset} disabled={loading || !changed}>
                            {t(TK.reset)}
                        </Button>
                        <Button onClick={handleSave} disabled={loading || !changed} variant="contained" color="primary">
                            {t(TK.save)}
                        </Button>
                    </PanelButtonsContainer>
                </>
            )}
        </Panel>
    );
};

export default ProcessingSettingsPanel;
