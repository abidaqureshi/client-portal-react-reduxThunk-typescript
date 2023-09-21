
import * as React from 'react';
import { List, ListItem, ListItemIcon, Checkbox, ListItemText, ListSubheader } from '@material-ui/core';
import { useTranslations } from '../../../../store/Translations/hooks';
import { TK } from '../../../../store/Translations/translationKeys';


export const productFields = [
    TK.name,
    TK.activeSubstances,
    TK.strength,
    TK.atc,
    TK.productCode,
    TK.packSize,
    TK.countryOfOrigin,
    TK.maHolder,
];

export interface ProductsFieldsSelection {
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProductsFieldsSelection: React.FC<ProductsFieldsSelection> = ({
    selected,
    setSelected,
}) => {

    const t = useTranslations();

    const handleToggle = (value: string) => () => {
        setSelected(prev => prev.includes(value)
            ? prev.filter(v => v !== value)
            : [...prev, value]);
    };

    return (
        <List
            dense
            component="div"
            role="list"
            style={{ background: 'whitesmoke' }}
            subheader={<ListSubheader>{t(TK.autoFillFields)}:</ListSubheader>}
        >
            {productFields.map((value: TK) => {
                const labelId = `transfer-list-item-${value}-label`;

                return (
                    <ListItem key={value} dense role="listitem" button onClick={handleToggle(value)}>
                        <ListItemIcon>
                            <Checkbox
                                size="small"
                                checked={selected.indexOf(value) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={t(value)} />
                    </ListItem>
                );
            })}
            <ListItem />
        </List>
    );
}

export default ProductsFieldsSelection;