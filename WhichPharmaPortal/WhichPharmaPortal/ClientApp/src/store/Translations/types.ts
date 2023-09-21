import { Action } from 'redux';
import { MapOf } from '../../utils/Types';

export interface TranslationsUpdatedAction extends Action {
    locale: string;
    translations: MapOf<string>;
}
