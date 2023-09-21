/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';
import styled from 'styled-components';

interface InputProps extends React.HTMLProps<HTMLDivElement> {
    rounded?: boolean;
    error?: boolean;
}

export const InputWrapper = styled.div<InputProps>`
    width: 100%;
    border: ${(props) => {
        const color = props.error ? 'red' : 'rgba(0, 0, 0, 0.1)';
        return props.rounded ? `1px solid ${color}` : 'none';
    }};
    border-bottom: ${(props) => {
        const color = props.error ? 'red' : '#ddd';
        return !props.rounded && `1px solid ${color}`;
    }};
    border-radius: ${(props) => (props.rounded ? props.theme.metrics.border.radius : '0')};
    background-color: #ffffff;
    box-shadow: ${(props) => (props.rounded ? 'inset 0 0 2px 0 rgba(0, 0, 0, 0.1)' : 'none')};
    padding: 6px;
`;

export const InputStyled = styled('input')`
    border: none;
    background: ${({theme}) => theme.colors.transparent};
    width: 100%;
    line-height: 2rem;
    font-size: 1rem;
    padding: 0 1.5rem;
    color: ${({theme}) => theme.colors.black};
    &:focus {
        outline-width: 0;
    }
    &:-webkit-autofill {
        background-color: ${({theme}) => theme.colors.transparent};
    }
`;

export const Label = styled('div')`
    color: rgba(0, 0, 0, 0.75);
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1.1rem;
    text-align: left;
    margin-bottom: 0.75rem;
    padding: 0 0.3rem;
    width: 100%;
`;

export const Error = styled(Label)`
    color: ${({theme}) => theme.colors.error};
    font-size: 0.7rem;
`;

export const TextareaRounded = styled('div')`
    width: 100%;
    border-radius: ${({theme}) => theme.metrics.border.radius};
    height: auto;
    background-color: #ffffff;
    box-shadow: inset 0 0 2px 0 rgba(0, 0, 0, 0.1);
    line-height: 1.75rem;
    font-size: 1.125rem;
`;
