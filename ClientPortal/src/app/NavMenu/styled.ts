import styled from 'styled-components';
import { ListItemText } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { breakpoints } from '../Mixins/breakpoints';

const menuItemWidth = '7rem';
const drawerWidth = '15%';

export const MenuContainer = styled.div`
    background: ${({ theme }) => theme.colors.dark};
    flex-grow: 1;

    > * {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
`;

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
                
            }),
            background: `#343a40`
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth})`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        content: {
            flexGrow: 1,
            width: '50%',
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: 0,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: drawerWidth,
        },
        loginForm: {
            width: '100%',
        },
    }),
);

export const MenuHeader = styled.div``;

export const Expander = styled.div`
    flex-grow: 1;
`;

export const Text = styled(ListItemText)`
    color: ${({ theme }) => theme.colors.white};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    transition: all 0.5s ease-in-out;
    transition: width 0.5s ease-in-out 1s;
    width: 0;
    overflow: hidden;
    @media ${breakpoints.md} {
        width: ${menuItemWidth};
    }
`;

export const IconWrapper = styled.div`
    color: ${({ theme }) => theme.colors.white};
    display: inline-flex;
    align-items: center;
    min-width: 2rem;
    flex-shrink: 0;
    > svg {
        fill: ${({ theme }) => theme.colors.white};
        transition: all 0.5s ease-in-out;
        &:hover {
            color: ${({ theme }) => theme.colors.RBGreen};
        }
    }
`;

export const Item = styled.li`
    width: 100%;
    display: flex;
    position: relative;
    box-sizing: border-box;
    text-align: left;
    padding: 8px 16px;
    padding-bottom: 8px;
    justify-content: flex-start;
    text-decoration: none;
    cursor: pointer;

    &:hover {
        > ${Text as any} {
            color: ${({ theme }) => theme.colors.RBGreen};
            width: ${menuItemWidth};
            transition: width 0.5s ease-in-out;
        }
        > ${IconWrapper as any} > svg {
            fill: ${({ theme }) => theme.colors.RBGreen};
        }
    }
`;
