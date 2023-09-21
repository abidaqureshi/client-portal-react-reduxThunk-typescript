import { Card, CardProps, Checkbox, CheckboxProps, Collapse, CollapseProps, Typography, TypographyProps, Button, ButtonProps, Tooltip, TooltipProps, makeStyles } from "@material-ui/core";
import styled from "styled-components";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface CommonProps extends React.HTMLProps<HTMLDivElement> {
    $isOpen?: boolean;
}

export const QuoteBoxCard = styled(Card) <CardProps>`
   `;

export const ExpandIcon = styled(ExpandMoreIcon) <CommonProps>`
    ${(props): string => {
        const openValue = props.$isOpen ? '180deg' : '0';
        return `transform: rotate(${openValue});`;
    }};
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`;

export const ExpandButtonContainer = styled.div`
    display: block;
    width: 100%;
    text-align: center;
`;

export const CollapseContainer = styled(Collapse) <CollapseProps>`
    margin-top: ${({ theme }) => theme.metrics.space.s};
`;

export const MyCheckbox = styled(Checkbox) <CheckboxProps>`
    margin: 0;
    padding: ${({ theme }) => theme.metrics.space.xxs};
    padding-left: 0;
`;

export const CheckboxParagraph = styled(Typography) <TypographyProps>`
`;

export const TopRigthPanel = styled.div`
    position: absolute;
   
    top: 0;
    right: 0;
    margin: ${({ theme }) => theme.metrics.space.s};

    > * + * {
        margin-top: ${({ theme }) => theme.metrics.space.xs};
    }
`;

export const SubmitButton = styled(Button) <ButtonProps>`
    display: "flex";
    align-items: "center";
    color: white;
`;

export const MyTooltip = styled(Tooltip) <TooltipProps>`
   font-size: 1.125rem;
`;

export const UseStyle = makeStyles({
    declineButton: {
        backgroundColor: '#ff8080',
        width: '45px',
        height: '45px',
        margin: '5px',
        minWidth: '45px',
        borderRadius: '50%',
        color: '#FFFFFF',
        '&:hover': {
            backgroundColor: '#ff0000',
            color: '#FFFFFF',
        }
    },
    alternativeButton: {
        backgroundColor: '#00e6c7',
        width: '45px',
        height: '45px',
        margin: '5px',
        minWidth: '45px',
        borderRadius: '50%',
        color: '#FFFFFF',
        '&:hover': {
            backgroundColor: '#09b39c',
            color: '#FFFFFF',
        }
    },
    submitButton: {
        alignItems: 'center',
        color: '#fff'
    },
    centerBox: {
        justifyContent: "flex-end",
        alignItems: "flex-end"
    }
});