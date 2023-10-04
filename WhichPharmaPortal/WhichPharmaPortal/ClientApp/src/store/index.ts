import * as Products from './Products';
import * as ProductsV2 from './Products';
import * as Shortages from './Shortages';
import * as Suppliers from './Suppliers';
import * as Sets from './Sets';
import * as SetsV2 from './SetsV2';
import * as Translations from './Translations';
import * as Session from './Session';
import * as Users from './Users';
import * as RFQs from './RFQs';
import * as Platform from './Platform';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AnyAction, Reducer, Action } from 'redux';
import { RouterState } from 'connected-react-router';

export type Reconciler<S> = (state: S) => S;

export interface ApplicationState {
    router: RouterState;
    session: Session.State;
    translations: Translations.State;
    products: Products.State;
    productsV2: ProductsV2.State;
    shortages: Shortages.State;
    suppliers: Suppliers.State;
    sets: Sets.State;
    setsV2: SetsV2.State;
    users: Users.State;
    rfqs: RFQs.State;
    platform: Platform.State;
}

export interface ApplicationReducer {
    router: Reducer<RouterState>;
    session: Reducer<Session.State>;
    translations: Reducer<Translations.State>;
    products: Reducer<Products.State>;
    productsV2: Reducer<ProductsV2.State>;
    shortages: Reducer<Shortages.State>;
    suppliers: Reducer<Suppliers.State>;
    sets: Reducer<Sets.State>;
    setsV2: Reducer<SetsV2.State>;
    users: Reducer<Users.State>;
    rfqs: Reducer<RFQs.State>;
    platform: Reducer<Platform.State>;
}

export interface ApplicationReconciler {
    router: Reconciler<RouterState>;
    session: Reconciler<Session.State>;
    translations: Reconciler<Translations.State>;
    products: Reconciler<Products.State>;
    productsV2: Reconciler<ProductsV2.State>;
    shortages: Reconciler<Shortages.State>;
    suppliers: Reconciler<Suppliers.State>;
    sets: Reconciler<Sets.State>;
    setsV2: Reconciler<SetsV2.State>;
    users: Reconciler<Users.State>;
    rfqs: Reconciler<RFQs.State>;
    platform: Reconciler<Platform.State>;
    [key: string]: Reconciler<any> | undefined;
}

export const emptyReducer: <S>() => Reducer<S> = <S>() => (state: S | undefined, _: Action): S => state as S;
export const emptyReconciler: <S>() => Reconciler<S> = <S>() => (state: S): S => state as S;

export const reducers: ApplicationReducer = {
    router: emptyReducer<RouterState>(),
    session: Session.reducer,
    translations: Translations.reducer,
    products: Products.reducer,
    productsV2: ProductsV2.reducer,
    shortages: Shortages.reducer,
    suppliers: Suppliers.reducer,
    sets: Sets.reducer,
    setsV2: SetsV2.reducer,
    users: Users.reducer,
    rfqs: RFQs.reducer,
    platform: Platform.reducer,
};

export const applicationStateRehydrateReconcilers: ApplicationReconciler = {
    router: emptyReconciler<RouterState>(),
    session: Session.reconciler,
    translations: Translations.reconciler,
    products: Products.reconciler,
    productsV2: ProductsV2.reconciler,
    shortages: Shortages.reconciler,
    suppliers: Suppliers.reconciler,
    sets: Sets.reconciler,
    setsV2: SetsV2.reconciler,
    users: Users.reconciler,
    rfqs: RFQs.reconciler,
    platform: Platform.reconciler,
};

export const applicationStatePersistReconcilers: ApplicationReconciler = {
    router: emptyReconciler<RouterState>(),
    session: Session.persistor,
    translations: Translations.persistor,
    products: Products.persistor,
    productsV2: ProductsV2.persistor,
    shortages: Shortages.persistor,
    suppliers: Suppliers.persistor,
    sets: Sets.persistor,
    setsV2: SetsV2.persistor,
    users: Users.persistor,
    rfqs: RFQs.persistor,
    platform: Platform.persistor,
};

// Type helpers
export type AppThunkAction<R> = ThunkAction<R, ApplicationState, {}, AnyAction>;
export type AppThunkDispatch = ThunkDispatch<ApplicationState, {}, AnyAction>;
