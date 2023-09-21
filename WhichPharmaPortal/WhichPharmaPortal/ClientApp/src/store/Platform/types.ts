import { Action } from 'redux';
import { ProcessingPformsSettings } from '../../models/ProcessingPformsSettings';
import { ProcessingSettings } from '../../models/ProcessingSettings';
import { SearchResult } from '../../models/SearchResult';

export interface PlatformProcessingSettingsLoadedAction extends Action {
    country: string;
    mappings: ProcessingSettings;
}
export interface PlatformProcessingPformSettingsLoadedAction extends Action {
    country: string;
    mappings: SearchResult<ProcessingPformsSettings>;
}
