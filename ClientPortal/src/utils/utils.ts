import appSettings from '../appSettings';
import { currencies } from './currencies';

export const moneyConvert = async (
    value: number,
    originCurrency: string,
    targetCurrency: string = 'EUR',
): Promise<string> => {
    const apiKey = 'WtKFnftyJQbwodQbNFHMjKuRqNIbJv2q';

    const locale =
        targetCurrency === 'EUR'
            ? 'pt-PT'
            : targetCurrency === 'USD'
            ? 'en-US'
            : currencies
                  .filter((country) => country.currency.ISO === targetCurrency)
                  .reduce((_index, item) => {
                      return item.locale;
                  }, '');
    if (originCurrency === targetCurrency) {
        return Promise.resolve(
            new Intl.NumberFormat('pt-PT', { style: 'currency', currency: targetCurrency }).format(value),
        );
    }
    return await fetch(`https://api.exchangeratesapi.io/latest?symbols=${targetCurrency}&base=${originCurrency}`)
        .then((res) => res.json())
        .then((res) => {
            const rate = res.rates[targetCurrency];
            const convertedValue = Number((value * rate).toFixed(2));
            return new Intl.NumberFormat(locale ? locale : 'pt-PT', {
                style: 'currency',
                currency: targetCurrency,
            }).format(convertedValue);
        });
};

export const ifEnter = (keyCode: number, action: () => void) => {
    if (keyCode === 13) action();
};

export const assignDefined = <T>(target: T, ...sources: any): T => {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const val = source[key];
            if (val !== undefined) {
                (target as any)[key] = val;
            }
        }
    }
    return target;
};

export const onlyUnique = <T>(value: T, index: number, self: T[]) => self.indexOf(value) === index;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const ofDefault = (array: any[], defaultValue: any) => (array.length ? array : [defaultValue]);

export const removeEmptyArrayFields = (obj: any): any =>
    Object.keys(obj)
        .filter((key) => obj[key]?.length)
        .reduce((prev, key) => Object.assign(prev, { [key]: obj[key] }), {});

export const parseNumber = (str?: string): number | undefined => {
    var match = str?.match(/\d+/);
    return match?.length ? parseInt(match[0]) : undefined;
};

export const parseEuDecimalToDecimal = (str?: string): number => {
    if (str) {
        return parseFloat(str.replace(',', '.'));
    }
    return 0;
};

export const groupBy = <T>(data: T[], field: string): { [group: string]: T[] } => {
    return data.reduce((acc: any, d: any) => {
        if (Object.keys(acc).includes(d[field])) return acc;

        acc[d[field]] = data.filter((g: any) => g[field] === d[field]);
        return acc;
    }, {});
};

export const reorder = <T extends unknown>(list: T[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const tryGetNameFromOriginal = (originalName: string) => {
    var match = /^[^,;_1234567890]+/.exec(originalName);
    return match?.length ? match[0].trim() : originalName;
};

export const excerptText = (limit: number, text: string) => {
    return text.substr(0, limit);
};

export const getMaxMinAndMeanByField = (quotesTableData: any[], fieldName: string) => {
    let numberArrays: number[] = [];
    let sum = 0;
    switch (fieldName) {
        case 'exwNetPriceEuro':
            quotesTableData.forEach((item) =>
                numberArrays.push(
                    item.exwNetPriceEuro
                        ? (parseEuDecimalToDecimal(item.exwNetPriceEuro) || 0) /
                              (parseNumber(item.packSize || item.package) || 1)
                        : 0,
                ),
            );
            break;
        case 'priceCurrencyToEuro':
            quotesTableData.forEach((item) =>
                numberArrays.push(
                    item.priceCurrencyToEuro
                        ? (parseEuDecimalToDecimal(item.priceCurrencyToEuro) || 0) /
                              (parseNumber(item.packSize || item.package) || 1)
                        : 0,
                ),
            );
            break;
        case 'leadTimeToDeliver':
            quotesTableData.forEach((item) => {
                if (item.leadTimeToDeliver && parseInt(item.leadTimeToDeliver) != 0) {
                    numberArrays.push(parseInt(item.leadTimeToDeliver));
                }
            });
            break;
    }

    let maxNumber = Math.max(...numberArrays);
    let minNumber = Math.min(...numberArrays.filter((i) => i != 0));

    for (let j = 0; j < numberArrays.length; j++) {
        sum += numberArrays[j];
    }

    let meanNumber = sum / numberArrays.length;

    return { min: minNumber, max: maxNumber, mean: meanNumber };
};

export const isDevelopment = (locationUrl: string) => {
    if (
        locationUrl &&
        (locationUrl.includes(appSettings.developmentUrl) || locationUrl.includes(appSettings.localDevelopmentUrl))
    ) {
        return true;
    }
    return false;
};

export const convertUTCDatetoDate = (utcDate: string, format = 'dd-mm-yyyy hh:mm') => {
    let dateObj = new Date(utcDate);
    if (format === 'yyyy-mm-dd h:m') {
        return (
            dateObj.getUTCFullYear() +
            '-' +
            (dateObj.getUTCMonth() + 1) +
            '-' +
            dateObj.getUTCDate() +
            ' ' +
            dateObj.getUTCHours() +
            ':' +
            dateObj.getUTCMinutes()
        );
    }
    return (
        dateObj.getUTCDate() +
        '-' +
        (dateObj.getUTCMonth() + 1) +
        '-' +
        dateObj.getUTCFullYear() +
        ' ' +
        dateObj.getUTCHours() +
        ':' +
        dateObj.getUTCMinutes()
    );
};
