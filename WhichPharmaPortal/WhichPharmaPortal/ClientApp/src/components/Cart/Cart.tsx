import React from 'react';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import { IconWrapper } from '../../app/NavMenu/styled';
const Cart: React.FC = () => {
    return (
        <IconWrapper>
            <ShoppingCartOutlinedIcon />
        </IconWrapper>
    );
};

export default Cart;
