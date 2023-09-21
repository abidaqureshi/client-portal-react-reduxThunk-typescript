import styled from 'styled-components';

interface ButtonProps {
    variant?: 'text' | 'rounded';
    size?: string;
}

interface IButtonWrapper {
    align: string;
}

export const ButtonWrapper = styled.div<IButtonWrapper>`
    display: flex;
    justify-content: ${(props) => props.align};
`;

const Button = styled.button<ButtonProps>`
    text-align: center;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
    font-size: ${({ theme }) => theme.typography.fontM};
    ${(props) => {
        const variant = props.variant;
        const theme = props.theme;
        switch (variant) {
            case 'text':
                return `
                    color: ${theme.colors.darkGreen};
                    background: ${theme.colors.transparent};
                    font-size: ${theme.typography.fontXXS};
                    text-decoration: underline;
                    &:hover {
                        color: ${theme.colors.RBGreen};
                        text-decoration: none;
                    };
                    &:disabled {
                        color: ${theme.colors.lightGrey};
                        pointer-events: none;
                        opacity: 33%;
                    }
                `;
            case 'rounded':
                return `
                    
                    color: ${theme.colors.white};
                    border-radius: ${theme.metrics.border.radius};
                    padding: 0.4rem 1rem;
                    background: ${theme.colors.RBGreen};
                    &:hover {
                        background: ${theme.colors.darkGreen};
                    }
                    &:disabled {
                        background: ${theme.colors.lightRBGreen};
                        color: ${theme.colors.darkGrey};
                        pointer-events: none;
                        opacity: 33%;
                    }
                `;

            default:
                return `
                    color: ${theme.colors.white};
                    border-radius: ${theme.metrics.border.radius};
                    padding: 0.4rem 1rem;
                    background: ${theme.colors.grey};
                    &:hover {
                        background: ${theme.colors.darkGreen};
                    }
                    &:disabled {
                        background: ${theme.colors.lightRBGreen};
                        color: ${theme.colors.darkGrey};
                        pointer-events: none;
                        opacity: 33%;
                    }
                `;
        }
    }};
`;

export default Button;
