import { Search } from 'history';
import { ProcessingPformsSettings } from '../../models/ProcessingPformsSettings';
import { ProcessingSettings } from '../../models/ProcessingSettings';
import { SearchResult } from '../../models/SearchResult';

export interface PlatformState {
    processingSettings: { [country: string]: ProcessingSettings | SearchResult<ProcessingPformsSettings> }; // 1st key is Country, 2nd key is MappingType
    isLoading: boolean;
}
export interface PlatformPformState {
    processingSettings: { [country: string]: SearchResult<ProcessingPformsSettings> }; // 1st key is Country, 2nd key is MappingType
    isLoading: boolean;
}
