import { Action } from 'redux';
import { SetName } from './state';

export interface SetAction extends Action {
    setName: SetName;
}

export interface SetUpdatedAction extends SetAction {
    values: any[];
}
