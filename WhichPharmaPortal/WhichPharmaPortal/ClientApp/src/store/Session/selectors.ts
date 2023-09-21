import { ApplicationState } from '..';
import { AuthenticatedUser } from '../../models/AuthenticatedUser';
import { AlertItem } from '../../components/AlertBar/AlertBar';
import { TableSettings } from '../../components/Table';
import {
    ProductsTableSettingKey,
    ShortagesTableSettingKey,
    SuppliersTableSettingKey,
    EmailTemplateSettingKey,
    RFQTablesAutoFillFieldsSettingKey,
    RFQDetailsTableSettingKey,
    ProductsV2TableSettingKey,
} from './customSettingsKeys';
import { MapOf } from '../../utils/Types';
import { TK } from '../Translations/translationKeys';
import jwt from 'jsonwebtoken';
import { GoogleLoginResponseOffline } from 'react-google-login';

export const isLoggingIn = (state: ApplicationState): boolean => state.session.loggingIn;
export const isManuallyLoggedOut = (state: ApplicationState): boolean => !!state.session.manuallyLoggedOut;
export const getLoggedUser = (state: ApplicationState): AuthenticatedUser | undefined => state.session.user;
export const getAccessToken = (state: ApplicationState): string | undefined => state.session.user?.accessToken;
export const getAlerts = (state: ApplicationState): AlertItem[] => state.session.alerts;
export const getGoogleLogin = (state: ApplicationState): GoogleLoginResponseOffline | undefined =>
    state.session.googleLogin;

export const isLoggedOutOrSessionExpired = (state: ApplicationState): boolean => {
    if (!state.session.user) return true;
    var token = jwt.decode(state.session.user.accessToken);
    return !token || Date.now() >= (((token as any).exp as number) || 0) * 1000;
};

export const getProductsTableDefaultSettings = (): TableSettings => ({
    fixedColumns: ['country'],
    hiddenColumnNames: [
        'productCode',
        'scrapingOriginId',
        'maNumber',
        'retailPrice',
        'reimbursementPrice',
        'wholesalePrice',
        'factoryPrice',
        'exFactoryPrice',
        'scrapingOrigin',
        'lastUpdate',
        'manufacturer',
        'drugFormCategories',
        'administrationFormCategories',
        'maHolder',
    ],
    pageSize: 1000,
});

export const getProductsV2TableDefaultSettings = (): TableSettings => ({
    fixedColumns: ['country', 'name', 'availability'],
    columnOrder: [
        'country',
        'availability',
        'name',

        'strengthDetailed',
        'pharmaceuticalFormCategories',
        'packageDetailed',
        'activeSubstances',
        'atc',
        'prices',
        'documentsUrls',
    ],
    hiddenColumnNames: [
        'scrapingOriginId',
        'codes',
        'otherFields',
        'scrapingOrigin',
        'lastUpdate',
        'productCode',
        'shortage',
        'isAuthorised',
        'isMarketed',
        'statusNotes',
        'administrationCategories',
        'isGeneric',
        'isPsychotropic',
        'scrapingOriginIdentifier',
        'maHolder',
        'manufacturer',
        'isBiological',
        'isAdditionalMonitoring',
        'isParallelImport',
        'isPrescription',
        'isHospitalar',
        'precautionsForStorage',
    ],
    pageSize: 1000,
});

export const getShortagesTableDefaultSettings = (): TableSettings => ({
    fixedColumns: [],
    hiddenColumnNames: [
        'lastUpdate',
        'scrapingOrigin',
        'activeSubstances',
        'atc',
        'drugForm',
        'strength',
        'package',
        'manufacturer',
        'maNumber',
        'productNotes',
    ],
    pageSize: 1000,
});

export const getSuppliersTableDefaultSettings = (): TableSettings => ({
    fixedColumns: ['country'],
    hiddenColumnNames: ['id', 'expirationDate', 'lastVerification', 'creationDate'],
    pageSize: 1000,
});

export const getRFQDetailsTableDefaultSettings = (): TableSettings => ({
    pageSize: 1000,
    fixedColumns: [
        'state',
        'country',
        'supplier',
    ],
    columnOrder: [
        'rfqNr',
        'country',
        'supplier',
        'activeSubstances',
        'name',
        'productCode',
        'packSize',
        'unitQuant',
        'exwNetPriceEuro',
        'availabilityPacks',
        'leadTimeToDeliver',
        'expDate',
        'countryOfOrigin',
        'comments',
        'packsTotal',
        'unitPrice',
        'totalPrice',
        'id',
        'state',
        'contacts',
        
        'maHolder',
        'package',
        
        'updatedBy',
        'createdBy',
        'creationDate',
        'lastUpdateDate',
    ],
    hiddenColumnNames: [
        'id',
        'rfqNr',
        'contacts',
        'productCode',
        'maHolder',
        'package',
        'activeSubstances',
        'updatedBy',
        'createdBy',
        'creationDate',
        'lastUpdateDate',
    ],
});

export const getEmailTemplateDefaultSettings = (): MapOf<string> => ({
    default: `<h3><span style="font-family: &quot;Trebuchet MS&quot;;">Dear {supplier.first-name},</span></h3>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">Hope this e-mail finds you well.</span></p>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">We have an new enquiry and we would like to receive your offer until&nbsp;{rfq.dueDate}.</span></p>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">Please click on the link below to check the details and submit your offer:&nbsp;</span></p>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">{reply-form-url}&nbsp;&nbsp;</span></p>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">If you experience any difficulties in submitting your offer please do not hesitate to contact us.</span></p>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">Thank you for your continued support.&nbsp;</span><span style="font-family: &quot;Trebuchet MS&quot;;">Looking forward to hearing from you.</span></p>
    <p><span style="font-family: &quot;Trebuchet MS&quot;;">Kind Regards,</span></p>
<table class="se-table-size-auto" style="font-family: &quot;Trebuchet MS&quot;;">
    <tbody>
        <tr>
            <td>
                <div class="se-component se-image-container __se__float-none" contenteditable="false">
                    <figure style="margin: 0px;">
                        <img src="https://rbpharma.pt/wordpress/wp-content/uploads/2020/04/cropped-AF_RBpharma_verso-01.png" alt="" data-rotate="" data-proportion="true" data-rotatex="" data-rotatey="" data-size="241px,114px" data-align="none" data-file-name="cropped-AF_RBpharma_verso-01.png" data-file-size="0" data-origin="," style="width: 241px; height: 114px;" origin-size="169,80" data-index="0">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </figure>
</div>
            </td>
            <td>
                <div style="border-left: 1px solid rgb(27, 213, 163); height: 114px;margin-right:15px;margin-left:10px">&nbsp;</div>
            </td>
            <td>
                <h3 style="margin-bottom:4px">{user.first-name}&nbsp;{user.last-name}</h3>
                <p>{user.title}</p>
                <div><strong><span style="color: rgb(27, 213, 163);">e:&nbsp;</span></strong><a href="mailto:{user.email}" target="_blank">{user.email}</a><br>
<strong><span style="color: rgb(27, 213, 163);">w:&nbsp;</span></strong><a href="/www.rbpharma.pt" target="_blank">www.rbpharma.pt</a><br>
<strong><span style="color: rgb(27, 213, 163);">t:&nbsp;</span></strong><a href="tel:+351216092994">+351 216 092 994</a></div>
            </td>
        </tr>
    </tbody>
</table>
`,

    PT: `<h3><span style="font-family: &quot;Trebuchet MS&quot;;">Exmos. Senhores,</span></h3>

<p><span style="font-family: &quot;Trebuchet MS&quot;;">Temos um novo pedido de cotação para o qual solicitamos a vossa proposta. 
Clique por favor no seguinte <a href="{reply-form-url}">link</a> para verificar os detalhes do pedido e enviar a sua proposta:</span></p>
<p><span style="font-family: &quot;Trebuchet MS&quot;;">{reply-form-url}</span></p>
<p><span style="font-family: &quot;Trebuchet MS&quot;;">Em caso de dúvida ou dificuldade técnica na abertura do link 
ou preenchimento da proposta por favor não hesite em nos contactar.</span></p>
<p><span style="font-family: &quot;Trebuchet MS&quot;;"><br>
</span></p>
<p><span style="font-family: &quot;Trebuchet MS&quot;;">Muito obrigado pela atenção.</span></p>
<p><span style="font-family: &quot;Trebuchet MS&quot;;">Com os melhores cumprimentos,</span></p>
<table class="se-table-size-auto" style="font-family: &quot;Trebuchet MS&quot;;">
    <tbody>
        <tr>
            <td>
                <div class="se-component se-image-container __se__float-none" contenteditable="false">
                    <figure style="margin: 0px;">
                        <img src="https://rbpharma.pt/wordpress/wp-content/uploads/2020/04/cropped-AF_RBpharma_verso-01.png" alt="" data-rotate="" data-proportion="true" data-rotatex="" data-rotatey="" data-size="241px,114px" data-align="none" data-file-name="cropped-AF_RBpharma_verso-01.png" data-file-size="0" data-origin="," style="width: 241px; height: 114px;" origin-size="169,80" data-index="0">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </figure>
</div>
            </td>
            <td>
                <div style="border-left: 1px solid rgb(27, 213, 163); height: 114px;margin-right:15px;margin-left:10px">&nbsp;</div>
            </td>
            <td>
                <h3 style="margin-bottom:4px">{user.first-name}&nbsp;{user.last-name}</h3>
                <p>{user.title}</p>
                <div><strong><span style="color: rgb(27, 213, 163);">e:&nbsp;</span></strong><a href="mailto:{user.email}" target="_blank">{user.email}</a><br>
<strong><span style="color: rgb(27, 213, 163);">w:&nbsp;</span></strong><a href="/www.rbpharma.pt" target="_blank">www.rbpharma.pt</a><br>
<strong><span style="color: rgb(27, 213, 163);">t:&nbsp;</span></strong><a href="tel:+351216092994">+351 216 092 994</a></div>
            </td>
        </tr>
    </tbody>
</table>`,
});

export const getRFQTablesAutoFillFieldsDefaultSettings = (): string[] => [
    TK.activeSubstances,
    TK.name,
    TK.packSize,
    TK.productCode,
    TK.strength,
    TK.atc,
    TK.countryOfOrigin,
    TK.maHolder,
];

export const getCustomSetting = <T>(state: ApplicationState, key: string): T =>
    state.session.customSettings && (state.session.customSettings[key] as T);
export const getProductsTableSettings = (state: ApplicationState): TableSettings =>
    getCustomSetting<TableSettings>(state, ProductsTableSettingKey) || getProductsTableDefaultSettings();
export const getProductsV2TableSettings = (state: ApplicationState): TableSettings =>
    getCustomSetting<TableSettings>(state, ProductsV2TableSettingKey) || getProductsV2TableDefaultSettings();
export const getShortagesTableSettings = (state: ApplicationState): TableSettings =>
    getCustomSetting<TableSettings>(state, ShortagesTableSettingKey) || getShortagesTableDefaultSettings();
export const getSuppliersTableSettings = (state: ApplicationState): TableSettings =>
    getCustomSetting<TableSettings>(state, SuppliersTableSettingKey) || getSuppliersTableDefaultSettings();
export const getEmailTemplateSettings = (state: ApplicationState): MapOf<string> =>
    getCustomSetting<MapOf<string>>(state, EmailTemplateSettingKey) || getEmailTemplateDefaultSettings();
export const getRFQTablesAutoFillFieldsSettings = (state: ApplicationState): string[] =>
    getCustomSetting<string[]>(state, RFQTablesAutoFillFieldsSettingKey) || getRFQTablesAutoFillFieldsDefaultSettings();
export const getRFQDetailsTableSettings = (state: ApplicationState): TableSettings =>
    getCustomSetting<TableSettings>(state, RFQDetailsTableSettingKey) || getRFQDetailsTableDefaultSettings();
