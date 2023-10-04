export interface ThemeColors {
    black: string;
    white: string;
    dark: string;
    transparent: string;
    //added only to dev enviroment.
    testGB: string;
    background: string;

    RBGreen: string;
    darkenRBGreen: string;
    lightRBGreen: string;

    darkGreen: string;
    grey: string;
    lightGrey: string;
    darkGrey: string;
    delicateRBGreen: string;
    textRBGreen: string;
    error: string;
    warning: string;
    brightGreen: string;
    vLightGrey: string;
}

const colors: ThemeColors = {
    black: '#000',
    white: '#FFF',
    dark: '#343a40',
    testGB: '#008060',
    transparent: 'transparent',
    background: 'rgba(0, 0, 0, 0.65)',

    RBGreen: '#00c4aa',
    darkenRBGreen: '#09b39c',
    lightRBGreen: '#10e6cd',
    delicateRBGreen: '#89C5A9',
    textRBGreen: '#479c75',
    brightGreen: '#cbeadb',

    darkGreen: '#033537',
    grey: '#6c757d',
    lightGrey: '#d7e0e0',
    darkGrey: '#343a40',
    vLightGrey: '#ececec',

    error: '#ff3300',
    warning: '#ebd834',
};

export default colors;
