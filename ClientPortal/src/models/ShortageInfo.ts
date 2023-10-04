
import { ShortageType } from './ShortageType';

export interface ShortageInfo { 
    start: string;
    end?: string;
    isActive: boolean;
    type: ShortageType;
    additionalNotes: string;
    lastUpdate: string;
    reason?: string;
}