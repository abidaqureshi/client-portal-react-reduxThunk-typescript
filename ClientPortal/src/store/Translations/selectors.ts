import { ApplicationState } from '..';
import { TK } from './translationKeys';

export const getLocale = (state: ApplicationState): string => state.translations.locale || 'en-US';
export const getTranslation = (state: ApplicationState, key: TK) => state.translations.translations[key] || `_${key}`;
export const getCurrentTranslation = (state: ApplicationState): any => state.translations || undefined;
