import { Action } from 'redux';
import { Shortage } from '../../models/Shortage';
import { SearchResult } from '../../models/SearchResult';

export interface ShortagesLoadedAction extends Action {
    result: SearchResult<Shortage>;
}
