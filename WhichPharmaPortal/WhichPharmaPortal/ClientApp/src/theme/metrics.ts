
export interface ThemeMetrics {
    fontSize: number;
    space: {
        xxs: string;
        xs: string;
        s: string;
        m: string;
        l: string;
        xl: string;
    },
    border: {
        radius: string;
        rounded: string;
    },
    breakpoints: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    },
}

const metrics: ThemeMetrics = {
    fontSize: 16,
    space: {
        xxs: '0.2rem',
        xs: '0.4rem',
        s: '1rem',
        m: '2rem',
        l: '4rem',
        xl: '7rem',
    },
    border: {
        radius: '0.5rem',
        rounded: '0.2rem',
    },
    breakpoints: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
    },
};

export default metrics;
