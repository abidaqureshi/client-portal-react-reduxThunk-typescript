import metrics, { ThemeMetrics } from './metrics';
import typography, { ThemeTypography } from './typography';
import colors, { ThemeColors } from './colors';
import { DefaultTheme } from "styled-components";

export interface Theme {
    metrics: ThemeMetrics;
    typography: ThemeTypography;
    colors: ThemeColors;
}

declare module "styled-components" {
  export interface DefaultTheme extends Theme {
  }
}

const theme: DefaultTheme = {
    metrics: metrics,
    typography: typography,
    colors: colors,
};

export default theme;
