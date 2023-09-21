import styled from 'styled-components';
import { TextField, Typography, TypographyProps } from '@material-ui/core';
import SingleSelectInput, { SingleSelectInputProps } from '../../components/inputs/SingleSelectInput';

interface ButtonProps {
    rounded?: boolean;
    variant?: string;
    size?: string;
}

export const WellcomeTitle = styled(Typography)<TypographyProps>`
    text-align: center;
    text-transform: uppercase;
    margin-bottom: var(--spacer-M);
`;

export const InnerContent = styled('div')`
    margin: ${({theme}) => theme.metrics.space.m};
    text-align: center;
    justify-content: center;
    align-items: center;
    max-width: 420px;
`;

export const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    > * + * {
        margin-top: 2rem;
    }
`;

export const StrechDiv = styled.div`
    width: 100%;
    display: flex;
    flex: 1 1 0;
    justify-content: space-between;
`;

export const Input = styled(TextField)`
    border-radius: ${({theme}) => theme.metrics.border.radius};
    background-color: #fff;
    border: 1px solid #ddd;
    > input {
        background-color: transparent;
        border: none;
        &:-webkit-autofill {
            background-color: transparent;
        }
    }
`;

export const Button = styled.button<ButtonProps>`
    text-align: center;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
    ${(props) => {
        const textButton = props.variant === 'text';
        const theme = props.theme;
        if (textButton) {
            return `
            color: ${theme.colors.darkGreen};
            background: ${theme.colors.transparent};
            font-size: ${theme.typography.fontXXS};
            text-decoration: underline;
            &:hover {
                color: ${theme.colors.RBGreen};
                text-decoration: none;
            };
        `;
        } else {
            return `
            font-size: ${theme.typography.fontM};
            color: ${theme.colors.white};
            border-radius: ${theme.metrics.border.radius};
            padding: 0.4rem 1rem;
            background: ${theme.colors.RBGreen};
            &:hover {
                background: ${theme.colors.darkGreen};
            }
        `;
        }
    }};
    &:disabled {
        background: ${({theme}) => theme.colors.lightRBGreen};
        color: ${({theme}) => theme.colors.darkGrey};
        pointer-events: none;
        opacity: 33%;
    }
`;

export const OrTitle = styled.h4`
    width: 100%;
    text-align: center;
    border-bottom: 1px solid #000;
    line-height: 0.1em;
    margin: ${({theme})=>theme.metrics.space.m} 0 ${({theme})=>theme.metrics.space.m};

    > * {
        padding: 0 calc(${({theme})=>theme.metrics.space.m}/2);
        background: whitesmoke;
    }
`;

export const GoogleContainer = styled.div`
    display: flex;
    flex-direction: column;

    > * {
        margin: auto;
    }
`;

export const LanguageInput = styled(SingleSelectInput)<SingleSelectInputProps<any>>`
    width: 8rem !important;
    position: fixed;
    top: ${({theme}) => theme.metrics.space.m};
    right: ${({theme}) => theme.metrics.space.m};
`;