import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import RequireRole from '../../components/RequireRole';
import { Box, List, Avatar, Drawer, CssBaseline, AppBar, Toolbar, Divider, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { MenuContainer, Item, IconWrapper, Text, Expander, useStyles } from './styled';
import { UserRole } from '../../models/UserRole';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { push } from 'connected-react-router';
import { routes } from '../../store/Router/routes';

import { getLoggedUser } from '../../store/Session/selectors';
import { Logo } from '../Layout/styled';
import { AppContext } from '../App';
import { AppContextType } from '../../context/@types/types';
import appSettings from '../../appSettings';
import { useUrl } from '../../utils/hooks/url';
import { CustomNav } from './Component/CustomNav';
import { isDevelopment } from '../../utils/utils';
import { getRFQSummaries } from '../../store/RFQs/selectors';
import { RFQAvatar } from '../../components/RFQAvatar';

interface ListItemWithIconProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export const ListItemWithIcon: React.FC<ListItemWithIconProps> = (props: ListItemWithIconProps) => (
    <Item onClick={props.onClick}>
        <IconWrapper>{props.icon}</IconWrapper>
        <Text>{props.title}</Text>
    </Item>
);

interface INavMenu {
    isOpen: boolean;
    handleDrawerToggle: () => void;
}

const NavMenu: React.FC<INavMenu> = ({ isOpen, handleDrawerToggle }) => {
    const { headerName } = React.useContext(AppContext) as AppContextType;

    const classes = useStyles();
    const theme = useTheme();

    const path = useUrl();

    const dispatch = useDispatch();
    const t = useTranslations();

    const user = useSelector(getLoggedUser);

    const goTo = (url: string) => (): void => {
        handleDrawerToggle();
        dispatch(push({ pathname: url }));
    };

    return (
        <>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: isOpen,
                    })}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerToggle}
                            edge="start"
                            className={clsx(classes.menuButton, isOpen && classes.hide)}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h4" noWrap>
                            <Box display="flex">
                                <RFQAvatar />
                                <Box fontWeight={600}>
                                    {path.includes(appSettings.developmentUrl + '/products/') ||
                                    path.includes(appSettings.localDevelopmentUrl + '/products/')
                                        ? t(TK.productsProdV)
                                        : headerName}
                                </Box>
                            </Box>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={isOpen}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <div className={classes.drawerHeader}>
                        <div style={{ width: '40%' }}>
                            <Logo isLogged={true} />
                        </div>
                        <IconButton onClick={handleDrawerToggle}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <MenuContainer>
                        <List>
                            <CustomNav goTo={goTo} routes={routes} locationUrl={path} />

                            {/* <RequireRole roles={[UserRole.PlatformContributor]}>
                                <ListItemWithIcon
                                    onClick={goTo(routes.shortagesSelection())}
                                    icon={<RemoveShoppingCartIcon />}
                                    title={t(TK.shortages)}
                                />
                            </RequireRole> */}

                            <RequireRole roles={[UserRole.Collaborator]}>
                                {/* <ListItemWithIcon
                                    onClick={goTo(routes.rfqsList)}
                                    icon={<YoutubeSearchedForIcon />}
                                    title={t(TK.rfqs)}
                                /> */}

                                {isDevelopment(path) ? (
                                    <>
                                        <ListItemWithIcon
                                            onClick={goTo(routes.rfqsListV2)}
                                            icon={<YoutubeSearchedForIcon />}
                                            title={isDevelopment(path) ? t(TK.rfqsV2) : t(TK.rfqs)}
                                        />
                                        <ListItemWithIcon
                                            onClick={goTo(routes.rfqsList)}
                                            icon={<YoutubeSearchedForIcon />}
                                            title={t(TK.rfqs)}
                                        />
                                    </>
                                ) : (
                                    <ListItemWithIcon
                                        onClick={goTo(routes.rfqsListV2)}
                                        icon={<YoutubeSearchedForIcon />}
                                        title={t(TK.rfqs)}
                                    />
                                )}
                            </RequireRole>

                            <RequireRole roles={[UserRole.Administrator]}>
                                <ListItemWithIcon
                                    onClick={goTo(routes.users)}
                                    icon={<PeopleAltIcon />}
                                    title={t(TK.users)}
                                />
                            </RequireRole>

                            <RequireRole roles={[UserRole.PlatformContributor]}>
                                <ListItemWithIcon
                                    onClick={goTo(routes.platform)}
                                    icon={<BeachAccessIcon />}
                                    title={t(TK.platform)}
                                />
                            </RequireRole>

                            <Expander />
                            <ListItemWithIcon
                                onClick={goTo(routes.profile)}
                                icon={
                                    user?.imageUrl?.length ? (
                                        <Avatar src={user.imageUrl} style={{ width: '24px', height: '24px' }} />
                                    ) : (
                                        <AccountCircleIcon />
                                    )
                                }
                                title={t(TK.profile)}
                            />
                            <ListItemWithIcon
                                onClick={goTo(routes.logout)}
                                icon={<ExitToAppIcon />}
                                title={t(TK.logout)}
                            />
                        </List>
                    </MenuContainer>
                </Drawer>
            </div>
        </>
    );
};

export default NavMenu;
