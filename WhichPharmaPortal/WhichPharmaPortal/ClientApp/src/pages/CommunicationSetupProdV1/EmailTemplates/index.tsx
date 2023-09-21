import * as React from 'react';
import { TK } from '../../../store/Translations/translationKeys';
import { useTranslations } from '../../../store/Translations/hooks';
import { AppBar, Tabs, Tab, } from '@material-ui/core';
import Panel from '../../../components/Panel';
import { getEmailTemplateSettings, getEmailTemplateDefaultSettings } from '../../../store/Session/selectors';
import { useSelector, useDispatch } from 'react-redux';
import SwipeableViews from 'react-swipeable-views';
import { MapOf } from '../../../utils/Types';
import EmailTemplate from './EmailTemplate';
import { updateEmailTemplateSettings } from '../../../store/Session/actions';
import { getAllProducts, getSelectedProducts } from '../../../store/ProductsV2/selectors';
import { TreeMenuOption } from '../../../components/TreeMenu';
import CountryFlag from '../../../components/CountryFlag';

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
  }
  
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && children}
      </div>
    );
}
  
const a11yProps = (index: any) =>  {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export interface EmailContentSetup {
    emailTemplates: MapOf<string>;
    setEmailTemplates: React.Dispatch<React.SetStateAction<MapOf<string>>>;
}

const EmailTemplates: React.FC<EmailContentSetup> = ({
    emailTemplates,
    setEmailTemplates,
}) => {
    const t = useTranslations();
    const dispatch = useDispatch();

    const defaultTemplates = useSelector(getEmailTemplateSettings);
    const selectedProductsIds = useSelector(getSelectedProducts);
    const products = useSelector(getAllProducts);

    const countriesNames = React.useMemo<MapOf<string>>(() => {
        const selectedProducts = selectedProductsIds.map(id => products[id]);
        return Array.from(new Set(selectedProducts.map(p => p.countryCode)))
            .map(countryCode => ({[countryCode]: selectedProducts.find(p => p.countryCode === countryCode)?.country || countryCode}))
            .reduce((prev, curr) => Object.assign(prev, curr), {});
    }, [selectedProductsIds, products]);

    const [tab, setTab] = React.useState(0);

    // DEFAULT VALUE
    React.useEffect(() => {
        setEmailTemplates(["default"].concat(Object.keys(countriesNames))
            .filter(countryId => defaultTemplates[countryId])
            .map(countryId => ({[countryId]: defaultTemplates[countryId]}))
            .reduce((prev, curr) => Object.assign(prev, curr), {}));
        // eslint-disable-next-line
    }, []);
    
    const saveTemplate = React.useCallback((countryId: string, template: string) => {
        dispatch(updateEmailTemplateSettings({...defaultTemplates, [countryId]: template}));
    }, [dispatch, defaultTemplates]);

    const removeSavedTemplate = React.useCallback((countryId: string) => {
        if(countryId === "default") {
            defaultTemplates[countryId] = ' ';
        }
        else {
            delete defaultTemplates[countryId];
        }
        dispatch(updateEmailTemplateSettings({...defaultTemplates}));
    }, [dispatch, defaultTemplates]);

    const handleEmailTemplateChange = React.useCallback((countryId: string, template: string) => {
        setEmailTemplates(prev => ({...prev, [countryId]: template}));
    }, [setEmailTemplates]);


    const options = React.useMemo<TreeMenuOption[]>(() => [
        {
            id: 'add',
            label: t(TK.add),
            disabled: Object.keys(countriesNames).length === (Object.keys(emailTemplates).length - 1),
            options: Object.keys(countriesNames)
                .filter(countryId => !emailTemplates[countryId])
                .map<TreeMenuOption>(countryId => ({
                    id: countryId,
                    label: <CountryFlag country={countriesNames[countryId]} countryCode={countryId}/>,
                    onClick: () => {
                        setEmailTemplates(prev => ({...prev, [countryId]: defaultTemplates[countryId] || defaultTemplates["default"]}));
                        setTab(0);
                    },
                })),
        }, {
            id: 'remove',
            label: t(TK.remove),
            disabled: Object.keys(emailTemplates).length <= 1,
            options: Object.keys(emailTemplates)
                .filter(countryId => countryId !== "default")
                .map<TreeMenuOption>(countryId => ({
                    id: countryId,
                    label: <CountryFlag country={countriesNames[countryId]} countryCode={countryId}/>,
                    onClick: () => {
                        setEmailTemplates(prev => {
                            delete prev[countryId];
                            return { ...prev };
                        });
                        setTab(0);
                    },
                })),
        }, {
            id: 'reset',
            label: t(TK.reset),
            onClick: () => {
                setEmailTemplates(getEmailTemplateDefaultSettings());
                dispatch(updateEmailTemplateSettings(getEmailTemplateDefaultSettings()));
                setTab(0);
            },
        }
    ] ,[setEmailTemplates, defaultTemplates, countriesNames, emailTemplates, dispatch, t]);

    return (
        <Panel 
            title={t(TK.emailContent)} 
            subtitle={t(TK.configureEmailContentMessage)}
            options={options}
        >
            { Object.keys(emailTemplates).length > 1 && 
                <AppBar position="static">
                    <Tabs 
                        value={tab} 
                        onChange={(_, tab) => setTab(tab)}
                        variant="fullWidth"
                    >
                        {Object.keys(emailTemplates).map((countryId, index) => 
                            <Tab 
                                key={countryId} 
                                label={countryId === "default" 
                                    ? t(TK.default) 
                                    : <CountryFlag country={countriesNames[countryId]} countryCode={countryId}/>} 
                                {...a11yProps(index)}
                            />)}
                    </Tabs>
                </AppBar>
            }

            <SwipeableViews axis="x" index={tab} onChangeIndex={setTab} >
                {Object.keys(emailTemplates).map((countryId, index) => 
                    <TabPanel key={countryId} value={tab} index={index}>
                        <EmailTemplate 
                            defaultTemplate={defaultTemplates[countryId]}
                            emailTemplate={emailTemplates[countryId]}
                            onEmailTemplateChanged={value => handleEmailTemplateChange(countryId, value)}
                            saveTemplate={value => saveTemplate(countryId, value)}
                            removeSavedTemplate={() => removeSavedTemplate(countryId)}
                        />
                    </TabPanel>
                )}
            </SwipeableViews>
        </Panel>
    );
};

export default EmailTemplates;
