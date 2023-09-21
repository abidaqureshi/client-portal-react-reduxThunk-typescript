import { createStyles, IconButton, InputAdornment, makeStyles, Theme } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { useCallback, useState } from 'react';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import colors from '../../../theme/colors';
import TextInput from '../../inputs/TextInput';

interface IAGSearchProps {
    onHandleChange: (val: string) => void;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: '5px',
            textAlign: 'center',
            color: theme.palette.text.secondary,
            borderRadius: '1px',
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: colors.white,
            '&:hover': {
                backgroundColor: colors.white,
            },
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(1),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                width: '12ch',
                '&:focus': {
                    width: '20ch',
                },
            },
        },
    }),
);

export const AGSearch: React.FC<IAGSearchProps> = ({ onHandleChange }) => {
    const classes = useStyles();
    const t = useTranslations();

    const [text, setText] = useState('');

    const onChange = useCallback(
        (val) => {
            setText(val);
            onHandleChange(val);
        },

        [onHandleChange, setText],
    );

    return (
        <TextInput
            placeholder={t(TK.searchAnyColumn)}
            fullWidth={true}
            type="text"
            value={text}
            onChange={onChange}
            formStyle={{ width: '20%', marginLeft: '12px' }}
            endAdorment={
                <InputAdornment position="end">
                    {/* <IconButton
                                        aria-label="free text filter info"
                                        edge="end"
                                        onClick={() => setFreeTextInfoOpen(true)}
                                    >
                                        <InfoIcon />
                                    </IconButton> */}

                    <IconButton style={{ outline: 'none' }} aria-label="free text filter info" edge="start">
                        <SearchIcon color="primary" />
                    </IconButton>
                </InputAdornment>
            }
        />
    );
};
