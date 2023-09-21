import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { ApplicationState, reducers, applicationStateRehydrateReconcilers, applicationStatePersistReconcilers, ApplicationReconciler } from './';
import { persistStore, persistReducer, PersistConfig, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const safeCallReconciler = <S>(state:S, key: string, reconcilers: ApplicationReconciler):S => {
    const reconciler = reconcilers[key];
    return reconciler ? reconciler(state) : undefined;
}

export default function configureStore(history: History, initialState?: ApplicationState) {
    const middleware = [thunk, routerMiddleware(history)];

    const rootReducer = combineReducers({
        ...reducers,
        router: connectRouter(history),
    });

    const transform = createTransform<any, any>(
        (stateFromReduxStore, key) => safeCallReconciler(stateFromReduxStore, key as string, applicationStatePersistReconcilers),
        (stateFromLocalStorage, key) => safeCallReconciler(stateFromLocalStorage, key as string, applicationStateRehydrateReconcilers));
        
    const persistOptions: PersistConfig<ApplicationState> = {
        key: 'whichpharma-state',
        storage,
        transforms: [transform],
    };
    
    const persistedReducer = persistReducer(persistOptions, rootReducer);

    const enhancers = [];
    const windowIfDefined = typeof window === 'undefined' ? null : (window as any);
    if (windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancers.push(windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__());
    }

    const store = createStore(
        persistedReducer,
        initialState,
        compose(applyMiddleware(...middleware), ...enhancers),
    ) as Store<ApplicationState>;

    const persistor = persistStore(store);

    return { store, persistor };
}
