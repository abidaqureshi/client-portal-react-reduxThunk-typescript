import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../Mixins/breakpoints';

interface WrapperProps extends React.HTMLProps<HTMLDivElement> {
    isLogged?: boolean;
}

const smoothOpacity = keyframes`
    0% { opacity: 0; }
    100% { color: 1; }
`;

export const AppInfoContainer = styled.div`
    text-align: center;
    align-self: center;
    min-width: 10rem;
`;

export const Body = styled.div`
    width: 100%;
    height: 100vh;
    display: block;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    background-color: ${({ theme }) => theme.colors.testGB}; /*rgba(0, 0, 0, 0.86)*/
    /* color: ${({ theme }) => theme.colors.white}; */
    font-weight: ${({ theme }) => theme.typography.fontLight};
`;

export const Wrapper = styled('div')<WrapperProps>`
    width: 100%;
    height: 100%;
    flex-direction: column;
    @media ${breakpoints.sm} {
        flex-direction: row;
    }
    display: flex;
`;

export const Sidebar = styled.div<WrapperProps>`
    height: 100%;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    padding: ${({ theme }) => theme.metrics.space.s} 0 0 0;
    justify-content: center;
    color: ${({ theme }) => theme.colors.white};

    > * {
        animation: ${smoothOpacity} 2s;
    }
`;

export const Container = styled.div<WrapperProps & { $fullWidth: boolean }>`
    height: 100%;
    width: calc(100% - 2 * ${(props) => props.theme.metrics.space.xxs});

    @media ${breakpoints.sm} {
        width: ${(props) => (props.isLogged || props.$fullWidth ? '100%' : '50%')};
        height: calc(100% - 2 * ${({ theme }) => theme.metrics.space.xxs});
    }

    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: whitesmoke;
    border-radius: ${({ theme }) => theme.metrics.border.rounded} 0 0 ${({ theme }) => theme.metrics.border.rounded};
    box-sizing: border-box;
    margin: ${({ theme }) => theme.metrics.space.xxs} 0;
    transition: width 2s cubic-bezier(0.67, -0.04, 0.21, 1.15);
    overflow: auto;
`;

export const Logo = styled('div')<WrapperProps>`
    position: relative;
    text-align: center;
    align-self: center;

    :before {
        content: 'WP';
        display: block;
        position: absolute;
        width: 11rem;
        transform: translate(-50%, 0);
        -webkit-text-stroke: thick;
        opacity: ${(props) => (props.isLogged ? 1 : 0)};
        transition: opacity 0.5s ease-in-out 1s;
    }

    :after {
        content: 'WhichPharma';
        display: block;
        position: absolute;
        width: 11rem;
        transform: translate(-50%, 0);
        -webkit-text-stroke: thick;
        opacity: ${(props) => (props.isLogged ? 0 : 1)};
        transition: opacity 0.5s ease-in-out 1s;
    }

    @media ${breakpoints.md} {
        :before {
            opacity: 0;
        }
        :after {
            opacity: 1;
        }
    }
`;

export default null;
