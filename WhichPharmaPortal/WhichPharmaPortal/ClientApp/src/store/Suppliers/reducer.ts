import { SuppliersState } from './state';
import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { Actions as SessionActions } from '../Session/actions';
import {
    SuppliersLoadedAction,
    SupplierAction,
    SupplierContactAction,
    SupplierContactSelectedAction,
    SupplierByProductAction,
    SupplierActionV3,
    SupplierContactSelectedActionV3,
    SupplierContactActionV3,
} from './types';

const unloadedState: SuppliersState = {
    items: {},
    searchResult: [],
    selectedItems: [],
    selectedItemsByProductId: {},
    selectedProductSuppliers: {},
    selectedProductSupplierEmails: {},
    selectedEmails: [],
    searchTotal: 0,
    isLoading: false,
};

export const persistor = (state: SuppliersState): SuppliersState => ({
    ...state,
    // Only save the selected products otherwise we'll reach the maximum localStorage size (10MB)
    items: !state?.items
        ? {}
        : Object.keys(state.items)
              .filter((supplierId) => state.selectedItems.includes(supplierId))
              .reduce((result, supplierId) => Object.assign(result, { [supplierId]: state.items[supplierId] }), {}),
    searchResult: [],
    searchTotal: 0,
    isLoading: false,
});

export const reconciler = (stored: SuppliersState): SuppliersState => ({
    ...stored,
    isLoading: false,
});

export const reducer: Reducer<SuppliersState> = (
    state: SuppliersState = unloadedState,
    action: Action,
): SuppliersState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return unloadedState;
        case Actions.suppliersLoading:
            return handleSuppliersLoading(state);
        case Actions.suppliersLoadError:
            return handleSuppliersLoadError(state);
        case Actions.suppliersLoaded:
            return handleSuppliersLoaded(state, action as SuppliersLoadedAction);
        case Actions.supplierSelectedV3:
            return handleSupplierSelectedV3(state, action as SupplierActionV3);
        case Actions.supplierDeselectedV3:
            return handleSupplierDeselectedV3(state, action as SupplierActionV3);
        case Actions.supplierContactSelectedV3:
            return handleSupplierContactSelectedV3(state, action as SupplierContactSelectedActionV3);
        case Actions.supplierContactDeselectedV3:
            return handleSupplierContactDeselectedV3(state, action as SupplierContactActionV3);
        case Actions.supplierSelected:
            return handleSupplierSelected(state, action as SupplierAction);
        case Actions.supplierDeselected:
            return handleSupplierDeselected(state, action as SupplierAction);

        case Actions.supplierContactSelected:
            return handleSupplierContactSelected(state, action as SupplierContactSelectedAction);

        case Actions.supplierContactDeselected:
            return handleSupplierContactDeselected(state, action as SupplierContactAction);
        case Actions.suppliersDeselectAll:
            return handleSuppliersDeselectAll(state);
        default:
            return state;
    }
};

const handleSuppliersLoading = (state: SuppliersState): SuppliersState => ({
    ...state,
    isLoading: true,
});

const handleSuppliersLoadError = (state: SuppliersState): SuppliersState => ({
    ...state,
    isLoading: false,
});

const handleSuppliersLoaded = (state: SuppliersState, action: SuppliersLoadedAction): SuppliersState => ({
    ...state,
    isLoading: false,
    items: Object.assign({ ...state.items }, ...action.result.items.map((p) => ({ [p.id]: p }))),
    searchResult: action.result.items.map((p) => p.id),
    searchTotal: action.result.total,
});

const handleSupplierSelected = (state: SuppliersState, action: SupplierAction): SuppliersState => ({
    ...state,
    selectedItems: [...new Set([...state.selectedItems, action.supplierId])],
    selectedEmails: [
        ...new Set([
            ...state.selectedEmails,
            ...state.items[action.supplierId].contacts.filter((c) => c.isStared).map((c) => ({ value: c.email })),
        ]),
    ],
});

const handleSupplierSelectedV3 = (state: SuppliersState, action: SupplierActionV3): SuppliersState => {
    const productId = action.productId;
    let selectedProductSuppliers = {
        ...state.selectedProductSuppliers,
        [productId]: state.selectedProductSuppliers[productId]
            ? [...new Set([...state.selectedProductSuppliers[productId], action.supplierId])]
            : [...new Set([action.supplierId])],
    };

    let selectedProductSupplierEmails = {
        ...state.selectedProductSupplierEmails,
        [productId]: state.selectedProductSupplierEmails[productId]
            ? [
                  ...new Set([
                      ...state.selectedProductSupplierEmails[productId],
                      ...state.items[action.supplierId].contacts
                          .filter((c) => c.isStared)
                          .map((c) => ({ value: c.email })),
                  ]),
              ]
            : [
                  ...new Set([
                      ...state.items[action.supplierId].contacts
                          .filter((c) => c.isStared)
                          .map((c) => ({ value: c.email })),
                  ]),
              ],
    };

    return {
        ...state,
        selectedItems: [...new Set([...state.selectedItems, action.supplierId])],
        selectedEmails: [
            ...new Set([
                ...state.selectedEmails,
                ...state.items[action.supplierId].contacts.filter((c) => c.isStared).map((c) => ({ value: c.email })),
            ]),
        ],
        selectedProductSuppliers,
        selectedProductSupplierEmails,
    };
};

const handleSupplierSelectionByProductId = (state: SuppliersState, action: SupplierByProductAction): SuppliersState => {
    const productId = action.productId;
    const supplierId = action.supplierId;

    let selectedItemsByProductId = { ...state.selectedItemsByProductId };

    selectedItemsByProductId[productId] = selectedItemsByProductId[productId]
        ? [...selectedItemsByProductId[productId], supplierId]
        : [supplierId];

    return {
        ...state,
        selectedItemsByProductId,
    };
};
const handleSupplierDeselected = (state: SuppliersState, action: SupplierAction): SuppliersState => ({
    ...state,
    selectedItems: state.selectedItems.filter((id) => id !== action.supplierId),
    selectedEmails: state.selectedEmails.filter(
        (email) => !state.items[action.supplierId].contacts.map((c) => c.email).includes(email.value),
    ),
});

const handleSupplierDeselectedV3 = (state: SuppliersState, action: SupplierActionV3): SuppliersState => {
    const productId = action.productId;
    let selectedProductSuppliers = {
        ...state.selectedProductSuppliers,
        [productId]: state.selectedProductSuppliers[productId].filter((id) => id !== action.supplierId),
    };

    let selectedProductSupplierEmails = {
        ...state.selectedProductSupplierEmails,
        [productId]: state.selectedProductSupplierEmails[productId].filter(
            (email) => !state.items[action.supplierId].contacts.map((c) => c.email).includes(email.value),
        ),
    };

    return {
        ...state,
        selectedItems: state.selectedItems.filter((id) => id !== action.supplierId),
        selectedEmails: state.selectedEmails.filter(
            (email) => !state.items[action.supplierId].contacts.map((c) => c.email).includes(email.value),
        ),
        selectedProductSuppliers,
        selectedProductSupplierEmails,
    };
};

const handleSupplierContactSelected = (
    state: SuppliersState,
    action: SupplierContactSelectedAction,
): SuppliersState => {
    return {
        ...state,
        selectedEmails: state.selectedEmails.find((e) => e.value === action.email)
            ? state.selectedEmails.map((e) => (e.value !== action.email ? e : { ...e, isCC: action.isCC }))
            : [...state.selectedEmails, { value: action.email, isCC: action.isCC }],
    };
};

const handleSupplierContactSelectedV3 = (
    state: SuppliersState,
    action: SupplierContactSelectedActionV3,
): SuppliersState => {
    const productId = action.productId;
    let selectedProductSupplierEmails = {
        ...state.selectedProductSupplierEmails,
        [productId]: state.selectedProductSupplierEmails[productId].find((e) => e.value === action.email)
            ? state.selectedProductSupplierEmails[productId].map((e) =>
                  e.value !== action.email ? e : { ...e, isCC: action.isCC },
              )
            : [...state.selectedProductSupplierEmails[productId], { value: action.email, isCC: action.isCC }],
    };
    return {
        ...state,
        selectedEmails: state.selectedEmails.find((e) => e.value === action.email)
            ? state.selectedEmails.map((e) => (e.value !== action.email ? e : { ...e, isCC: action.isCC }))
            : [...state.selectedEmails, { value: action.email, isCC: action.isCC }],
        selectedProductSupplierEmails,
    };
};

const handleSupplierContactDeselectedV3 = (state: SuppliersState, action: SupplierContactActionV3): SuppliersState => {
    const productId = action.productId;

    let selectedProductSupplierEmails = {
        ...state.selectedProductSupplierEmails,
        [productId]: state.selectedProductSupplierEmails[productId].filter((email) => email.value !== action.email),
    };

    return {
        ...state,
        selectedEmails: state.selectedEmails.filter((email) => email.value !== action.email),
        selectedProductSupplierEmails,
    };
};

const handleSupplierContactDeselected = (state: SuppliersState, action: SupplierContactAction): SuppliersState => ({
    ...state,
    selectedEmails: state.selectedEmails.filter((email) => email.value !== action.email),
});

const handleSuppliersDeselectAll = (state: SuppliersState): SuppliersState => ({
    ...state,
    selectedItemsByProductId: {},
    selectedProductSuppliers: {},
    selectedProductSupplierEmails: {},
    selectedItems: [],
    selectedEmails: [],
});
