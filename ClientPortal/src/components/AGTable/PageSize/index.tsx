import React, { ReactNode, useEffect } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { v4 as uuidv4 } from 'uuid';
import { useStyles } from './styled';

interface IPageSizeProps {
    initialPageSize?: number;
    onHandleChange: (n: number) => void;
}

const pageSizes = [10, 25, 50, 100];

const PageSize: React.FC<IPageSizeProps> = ({ onHandleChange, initialPageSize = 10 }) => {
    const classes = useStyles();
    const [pageSize, setPageSize] = React.useState(initialPageSize);

    useEffect(() => {
        setPageSize(initialPageSize);
    }, [initialPageSize]);

    const handleChange = React.useCallback(
        (evt: React.ChangeEvent<{ value: unknown }>) => {
            setPageSize(evt.target.value as number);
            onHandleChange(evt.target.value as number);
        },
        [pageSize, setPageSize],
    );
    return (
        <FormControl className={classes.formControl}>
            <Select
                labelId="ag-grid-pagesize"
                value={pageSize}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'Without label' }}
                style={{ fontSize: '13px' }}
            >
                <MenuItem value="" disabled>
                    Page size
                </MenuItem>
                {pageSizes.map((item: number) => (
                    <MenuItem key={uuidv4()} value={item}>
                        {item}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default PageSize;
