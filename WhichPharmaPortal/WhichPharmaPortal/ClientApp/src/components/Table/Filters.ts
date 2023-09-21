import moment from "moment";
import { DateTimeFormat, DateFormat } from "./DataTypeFormatter";
import { ColumnTypeTemplate } from "./types";

export interface FilterPredicates {
    contains?: (value: any, filterValue: string) => boolean;
    notContains?: (value: any, filterValue: string) => boolean;
    startsWith?: (value: any, filterValue: string) => boolean;
    endsWith?: (value: any, filterValue: string) => boolean;
    equal?: (value: any, filterValue: string) => boolean;
    notEqual?: (value: any, filterValue: string) => boolean;
    greaterThan?: (value: any, filterValue: string) => boolean;
    greaterThanOrEqual?: (value: any, filterValue: string) => boolean;
    lessThan?: (value: any, filterValue: string) => boolean;
    lessThanOrEqual?: (value: any, filterValue: string) => boolean;
    [filterType: string]: undefined | ((value: any, filterValue: string) => boolean);
};

export const FiltersAvailableMap: { [key: string]: undefined | string[] } = {
    [ColumnTypeTemplate.Unspecified]: [
        'contains',
        'notContains',
        'startsWith',
        'endsWith',
        'equal',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
    ],
    [ColumnTypeTemplate.DateTime]: [
        'equal',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
    ],
    [ColumnTypeTemplate.Date]: [
        'equal',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
    ],
    [ColumnTypeTemplate.Bool]: [
        'equal',
    ],
}
export const FilterPredicatesMap: { [key: string]: undefined | FilterPredicates } = {

    [ColumnTypeTemplate.DateTime]: {
        equal: (date, filter) => moment(date).startOf('second').isSame(moment(filter, DateTimeFormat).startOf('second')),
        notEqual: (date, filter) => !moment(date).startOf('second').isSame(moment(filter, DateTimeFormat).startOf('second')),
        greaterThan: (date, filter) => moment(date).startOf('second').isAfter(moment(filter, DateTimeFormat).startOf('second')),
        lessThan: (date, filter) => moment(date).startOf('second').isBefore(moment(filter, DateTimeFormat).startOf('second')),
        greaterThanOrEqual: (date, filter) => moment(date).startOf('second').isSameOrAfter(moment(filter, DateTimeFormat).startOf('second')),
        lessThanOrEqual: (date, filter) => moment(date).startOf('second').isSameOrBefore(moment(filter, DateTimeFormat).startOf('second')),
    } as FilterPredicates,

    [ColumnTypeTemplate.Date]: {
        equal: (date, filter) => moment(date).startOf('day').isSame(moment(filter, DateFormat).startOf('day')),
        notEqual: (date, filter) => !moment(date).startOf('day').isSame(moment(filter, DateFormat).startOf('day')),
        greaterThan: (date, filter) => moment(date).startOf('day').isAfter(moment(filter, DateFormat).startOf('day')),
        lessThan: (date, filter) => moment(date).startOf('day').isBefore(moment(filter, DateFormat).startOf('day')),
        greaterThanOrEqual: (date, filter) => moment(date).startOf('day').isSameOrAfter(moment(filter, DateFormat).startOf('day')),
        lessThanOrEqual: (date, filter) => moment(date).startOf('day').isSameOrBefore(moment(filter, DateFormat).startOf('day')),
    } as FilterPredicates,

    [ColumnTypeTemplate.Bool]: {
        equal: (bool, filter) => bool ? filter && filter.toLowerCase().startsWith('y') : filter && filter.toLowerCase().startsWith('n'),
    } as FilterPredicates,
}
