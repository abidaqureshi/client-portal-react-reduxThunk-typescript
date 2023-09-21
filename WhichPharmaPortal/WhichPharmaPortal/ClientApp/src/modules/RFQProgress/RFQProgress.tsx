import * as React from 'react';
import { useTranslations } from '../../store/Translations/hooks';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';

import { Stepper, Step, StepLabel } from '@material-ui/core';
import { TK } from '../../store/Translations/translationKeys';
import {
    getAllProducts as getAllProductsV2,
    getSelectedProducts as getSelectedProductsV2,
} from '../../store/ProductsV2/selectors';
import {
    getAllProducts as getAllProductsV1,
    getSelectedProducts as getSelectedProductsV1,
} from '../../store/Products/selectors';

import { useSelector, useDispatch } from 'react-redux';
import { getSelectedSuppliersEmails } from '../../store/Suppliers/selectors';
import { push } from 'connected-react-router';
import Panel from '../../components/Panel';
import { ApplicationState } from '../../store';
import { Filters } from '../../pages/ProductsListV1/ProductsFilters/types';
import { routes } from '../../store/Router/routes';

var getSelectedProducts: (state: ApplicationState) => string[];
var getAllProducts: (state: ApplicationState) => { [id: string]: any };

export enum RFQStep {
    SelectProducts = 0,
    SelectSuppliers,
    CommunicationSetup,
    EmailsSent,
}

export interface RFQProgress {
    activeStep: RFQStep;
}

const RFQProgress: React.FC<RFQProgress> = ({ activeStep }) => {
    const t = useTranslations();
    const dispatch = useDispatch();
    const location = useLocation();
    const h = useHistory();

    const query2 = queryString.parse(location.search) as Filters;

    const version = query2.Version;

    if (query2.Version === 'V2' || !query2.Version) {
        getSelectedProducts = getSelectedProductsV2;
        getAllProducts = getAllProductsV2;
    } else if (query2.Version === 'V1') {
        getSelectedProducts = getSelectedProductsV1;
        getAllProducts = getAllProductsV1;
    }

    const selectedProducts = useSelector(getSelectedProducts);
    const selectedEmails = useSelector(getSelectedSuppliersEmails);

    const stepsLabel: string[] = [
        t(TK.productsSelection) + (activeStep > RFQStep.SelectProducts ? ` (${selectedProducts.length})` : ''),
        t(TK.suppliersSelection) + (activeStep > RFQStep.SelectSuppliers ? ` (${selectedEmails.length})` : ''),
        t(TK.emailConfiguration),
        t(TK.emailsSending),
    ];

    const isStepFailed = (step: RFQStep): boolean => {
        if (activeStep <= step) return false;
        switch (step) {
            case RFQStep.SelectProducts:
                return selectedProducts.length === 0;
            case RFQStep.SelectSuppliers:
                return selectedEmails.length === 0;
            default:
                return false;
        }
    };

    const handleStepClick = (step: RFQStep): void => {
        if (activeStep > step) {
            switch (step) {
                case RFQStep.SelectProducts:
                    let productsListPath = '';
                    if (location.pathname.includes('V3') || location.pathname.includes('commconfigV2')) {
                        productsListPath = '/products-V3/' + window?.localStorage.getItem('queryString');
                    } else if (location.pathname.includes('V2')) {
                        productsListPath = '/products-V2/' + window?.localStorage.getItem('queryString');
                    } else if (location.pathname.includes('V1')) {
                        productsListPath = '/products-V1/' + window?.localStorage.getItem('queryString');
                    } else if (location.pathname.includes('prodv1')) {
                        productsListPath = '/products-prodv1/' + window?.localStorage.getItem('queryString');
                    } else {
                        productsListPath = '/products/' + window?.localStorage.getItem('queryString');
                    }

                    // dispatch(push({ pathname: productsListPath }));
                    // console.log(productsListPath);
                    h.push(productsListPath);
                    break;
                case RFQStep.SelectSuppliers:
                    if (location.pathname.includes('commconfigV2')) {
                        dispatch(push({ pathname: routes.suppliersV3Selecion() }));
                    } else if (location.pathname.includes('commconfigProdV1')) {
                        dispatch(push({ pathname: routes.suppliersSelecionProdV1() }));
                    } else {
                        dispatch(push({ pathname: '/suppliers' }));
                    }

                    break;
            }
        }
    };

    return (
        <Panel>
            <Stepper activeStep={activeStep} alternativeLabel>
                {stepsLabel.map((label, idx) => (
                    <Step key={label} style={{ cursor: 'pointer' }} onClick={() => handleStepClick(idx)}>
                        <StepLabel error={isStepFailed(idx)}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Panel>
    );
};

export default RFQProgress;
