import React from 'react';
import { Box, Chip, createStyles, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { FiltersKey } from '../../pages/ProductsListV3/ProductsFilters/types';
import { Availability } from '../../constants/availability';

interface ISearchTagsProps {
    filters: any;
    updateFilters: (property: string, value: string | string[]) => void;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            padding: theme.spacing(0.5),
            margin: 0,
        },
        chip: {
            margin: theme.spacing(0.5),
            fontWeight: 500,
        },
    }),
);

export const SearchTags: React.FC<ISearchTagsProps> = ({ filters, updateFilters }) => {
    const classes = useStyles();
    const filterValues = Object.values(FiltersKey);

    const handleDelete = (e: any, item: string, key: string) => {
        if (Array.isArray(filters[key])) {
            const values: string[] = filters[key].filter((val: string) => val !== item);
            values.length > 1 ? updateFilters(key, values) : updateFilters(key, values[0]);
        } else {
            updateFilters(key, '');
        }
    };

    const listTagsForMulitSelectFilters = () => {
        return Object.keys(filters).map((key) => {
            if (Array.isArray(filters[key])) {
                return filters[key].map((item: string) => {
                    return (
                        <Chip
                            label={item}
                            key={item}
                            onDelete={(e) => handleDelete(e, item, key)}
                            deleteIcon={<CloseIcon />}
                            color="primary"
                            size="small"
                            className={classes.chip}
                        />
                    );
                });
            }
        });
    };

    const listTagsForFeeSelectFilters = () => {
        return filterValues.map((keyItem) => {
            if (
                !Array.isArray(filters[keyItem]) &&
                keyItem !== 'isAuthorised' &&
                keyItem !== 'isMarketed' &&
                keyItem !== 'isShortage' &&
                keyItem !== 'notCommercialized'
            ) {
                return (
                    filters[keyItem] && (
                        <Chip
                            label={filters[keyItem]}
                            key={filters[keyItem]}
                            onDelete={(e) => handleDelete(e, filters[keyItem], keyItem)}
                            deleteIcon={<CloseIcon />}
                            color="primary"
                            size="small"
                            className={classes.chip}
                        />
                    )
                );
            }
        });
    };

    const listTagsForAvailableFiler = () => {
        return Availability.map((item) => {
            const { queryObject, label } = item;
            return (
                filters.isAuthorised &&
                filters.isMarketed &&
                filters[FiltersKey.isAuthorised] === queryObject.isAuthorised &&
                filters[FiltersKey.isMarketed] === queryObject.isMarketed && (
                    <Chip
                        // icon={icon}
                        label={label}
                        key={label}
                        // onDelete={(e) => handleDelete(e, filters[keyItem], keyItem)}
                        color="primary"
                        size="small"
                        className={classes.chip}
                    />
                )
            );
        });
    };

    return (
        <Box>
            {/* {listTagsForAvailableFiler()} */}
            {listTagsForMulitSelectFilters()}
            {listTagsForFeeSelectFilters()}
            {filters.isShortage && (
                <Chip
                    // icon={icon}
                    label="Shortage"
                    key="Shortage"
                    // onDelete={(e) => handleDelete(e, filters[keyItem], keyItem)}
                    color="primary"
                    size="small"
                    className={classes.chip}
                />
            )}
            {filters.notCommercialized && (
                <Chip
                    // icon={icon}
                    label="Not commercialised"
                    key="notCommercialised"
                    // onDelete={(e) => handleDelete(e, filters[keyItem], keyItem)}
                    color="primary"
                    size="small"
                    className={classes.chip}
                />
            )}
        </Box>
    );
};
