import { Search } from 'history';
import { ApplicationState } from '..';
import { ProcessingPformsSettings } from '../../models/ProcessingPformsSettings';
import { ProcessingSettings } from '../../models/ProcessingSettings';
import { SearchResult } from '../../models/SearchResult';

export const isLoadingPlatformData = (state: ApplicationState): boolean => state.platform.isLoading;
export const getPlatformProcessingSettings = (state: ApplicationState): { [country: string]: ProcessingSettings | SearchResult<ProcessingPformsSettings>} => state.platform.processingSettings ;
export const getPlatformPformProcessingSettings = (state: ApplicationState): { [country: string]: ProcessingSettings | SearchResult<ProcessingPformsSettings> } => state.platform.processingSettings ;
