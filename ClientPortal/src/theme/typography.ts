import { rem } from 'polished';

export interface ThemeTypography {
    fontFamily: string;
    sizes: {
        base: string;
        xxs: string;
        xs: string;
        m: string;
        l: string;
        xl: string;
    },
    heights: {
        xxs: string;
        xs: string;
        m: string;
        l: string;
        xl: string;
    },
    weights: {
        light: number;
        regular: number;
        semiBold: number;
        bold: number;
    },
    fontSizeBase: string;
    fontXXS: string;
    lineHeightXXS: string;
    fontXS: string;
    lineHeightXS: string;
    fontM: string;
    lineHeightM: string;
    fontL: string;
    lineHeightL: string;
    fontXL: string;
    lineHeightXL: string;
    fontLight: number;
    fontRegular: number;
    fontSemiBold: number;
    fontBold: number;
}

const typography: ThemeTypography = {
    fontFamily: "'Lato', Arial, Helvetica, sans-serif",
    sizes: {
        base: rem('16px', '16px'),
        xxs: rem('12px'),
        xs: rem('14px'),
        m: rem('18px'),
        l: rem('32px'),
        xl: rem('48px'),
    },
    heights: {
        xxs: rem('16px'),
        xs: rem('18px'),
        m: rem('22px'),
        l: rem('38px'),
        xl: rem('62px'),
    },
    weights: {
        light: 300,
        regular: 400,
        semiBold: 500,
        bold: 700,
    },
    fontSizeBase: rem('16px', '16px'),
    fontXXS: rem('12px'),
    lineHeightXXS: rem('16px'),
    fontXS: rem('14px'),
    lineHeightXS: rem('18px'),
    fontM: rem('18px'),
    lineHeightM: rem('22px'),
    fontL: rem('32px'),
    lineHeightL: rem('38px'),
    fontXL: rem('48px'),
    lineHeightXL: rem('62px'),
    fontLight: 300,
    fontRegular: 400,
    fontSemiBold: 500,
    fontBold: 700,
};

export default typography;
