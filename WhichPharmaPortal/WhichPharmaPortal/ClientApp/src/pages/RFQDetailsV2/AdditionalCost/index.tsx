import React, { useCallback } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { IconButton, Link } from '@material-ui/core';
import { parseEuDecimalToDecimal, parseNumber } from '../../../utils/utils';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        typography: {
            padding: theme.spacing(2),
        },
    }),
);

interface IAdditionalCostProps {
    item: any;
    getAdditionalCost: (item: {
        id: string;
        supplierId: string;
        additionalCost: number;
        costList: ICostItem[];
    }) => void;
}

export interface ICostItem {
    label: string;
    value: number;
}

export const AdditionalCost: React.FC<IAdditionalCostProps> = function ({ item, getAdditionalCost }) {
    const [costList, setCostList] = React.useState<ICostItem[]>(item.additionalCostList || [{ label: '', value: 0 }]);
    const [totalCost, setTotalCost] = React.useState<number>(0);
    const { id } = item;

    React.useEffect(() => {
        getAdditionalCost({
            id: item.id,
            supplierId: item.supplierId,
            additionalCost: totalCost,
            costList: [...costList],
        });
    }, [totalCost]);

    React.useEffect(() => {
        let sum = costList.reduce((prevSum, item) => prevSum + item.value, 0);
        setTotalCost(sum);
    }, [costList, setTotalCost]);

    const onHandleAddMoreCost = useCallback(() => {
        costList.push({ label: '', value: 0 });
        setCostList([...costList]);
    }, [setCostList, costList]);

    const onHandleLabelChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key, id) => {
            costList[key].label = e.target.value;

            setCostList([...costList]);
        },
        [setCostList, costList],
    );

    const onHandleValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key, id) => {
            costList[key].value = parseFloat(e.target.value) as number;
            setCostList([...costList]);
        },
        [setCostList, costList, setTotalCost],
    );

    const onHandleKeydown = useCallback(
        (e) => {
            onHandleAddMoreCost();
        },
        [onHandleAddMoreCost],
    );

    const onHandleRemove = useCallback(
        (key) => {
            const updatedCostList = costList.filter((item, index) => index !== key);
            setCostList([...updatedCostList]);
        },
        [setCostList, costList],
    );

    const elementId = 'simple-popover' + item.id;

    return (
        <div id={elementId}>
            <Box display="flex" flexDirection="column" justifyContent="center" padding={2}>
                {/* <Box display="flex" justifyContent="right">
                    <Link style={{ outline: 'none' }} component="button" variant="body2" onClick={onHandleAddMoreCost}>
                        Add more
                    </Link>
                </Box> */}
                {costList.map((costItem, key) => {
                    return (
                        <Box display="flex" justifyContent="center" width={320} key={`${key}-${elementId}`}>
                            <Box padding={2}>
                                <TextField
                                    id={`${key}-label-${elementId}`}
                                    placeholder="Additional cost"
                                    value={costItem.label}
                                    onChange={(e) => onHandleLabelChange(e, key, id)}
                                />
                            </Box>
                            <Box display="flex" flexDirection="row" justifyContent="right">
                                <Box padding={2}>
                                    <TextField
                                        id={`${key}-number-${elementId}`}
                                        type="number"
                                        style={{ width: '60px' }}
                                        value={costItem.value}
                                        onChange={(e) => onHandleValueChange(e, key, id)}
                                    />
                                </Box>
                                <Box paddingTop={3}>€</Box>
                                {costList.length > 1 && key < costList.length - 1 && (
                                    <Box paddingTop="12px" width={70}>
                                        <IconButton
                                            color="primary"
                                            aria-label="Remove"
                                            component="span"
                                            onClick={() => onHandleRemove(key)}
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </Box>
                                )}
                                {key === costList.length - 1 && (
                                    <Box paddingTop={3} width={70}>
                                        <Link
                                            style={{ fontSize: '13px', marginLeft: '12px', cursor: 'pointer' }}
                                            onClick={(
                                                e:
                                                    | React.MouseEvent<HTMLAnchorElement, MouseEvent>
                                                    | React.MouseEvent<HTMLSpanElement, MouseEvent>,
                                            ) => onHandleKeydown(e)}
                                        >
                                            Add line
                                        </Link>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </div>
    );
};
