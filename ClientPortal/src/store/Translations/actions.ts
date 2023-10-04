import { AppThunkAction } from "..";
import * as contentful from 'contentful';
import { TK } from "./translationKeys";
import { MapOf } from "../../utils/Types";
import { TranslationsUpdatedAction } from "./types";
import { getLocale } from "./selectors";

export const Actions = {
    updated: '@@whichpharma.translations.updated',
};

const translationsUpdated = (locale: string, translations: MapOf<string>): TranslationsUpdatedAction => ({
    type: Actions.updated,
    locale,
    translations,
});

interface TranslationContent {
    key: TK;
    translation: string;
}

export const fetchTranslations = (locale?: string): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState) => {
        const client = contentful.createClient({
            space: 'zuswacfnvw1d',
            //environment: 'master',
            accessToken: 'pJuwV99E_cLfoBoJIL1NPNuKhJsVBPtKnucnKPLFh9w'
        })
        
        const realLocale = locale || getLocale(getState());

        const response = await client.getEntries<TranslationContent>({
            locale: realLocale,
        });

        const translations = response.items
            .map(item => item.fields)
            .reduce<MapOf<string>>((prev, curr) => Object.assign({[curr.key]: curr.translation}, prev), {});

        dispatch(translationsUpdated(realLocale, translations));
    }
}