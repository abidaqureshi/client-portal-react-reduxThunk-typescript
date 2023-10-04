import { useSelector } from 'react-redux';
import { TK } from './translationKeys';
import { ApplicationState } from '..';

export interface ITranslate<KeyType> {
    (key: KeyType, ...injectables: any[]): string;
}

const strFormat = (source: string, params: any[]) =>
    params.reduce((prev, curr, idx) => prev.replace(new RegExp('\\{' + idx + '\\}', 'g'), curr), source);

export const useTranslations = (): ITranslate<TK> => {
    const translations = useSelector<ApplicationState, { [key: string]: string }>(
        (state) => state.translations.translations,
    );
    return (key: TK, ...injectables: any[]) =>
        injectables.length ? strFormat(translations[key] || key, injectables) : translations[key] || key;
};
