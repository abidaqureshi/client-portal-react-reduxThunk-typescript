import * as React from 'react';
import { Menu, MenuItem } from '@material-ui/core';

export interface TreeMenuOption {
    id: string;
    label: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    options?: TreeMenuOption[];
}

export interface TreeMenuProps {
    id: string;
    anchorEl: HTMLElement | null;
    options: TreeMenuOption[];
    onClose: () => void;
}

const TreeMenu : React.FC<TreeMenuProps> = ({
    id,
    anchorEl,
    options,
    onClose,
}) => {
    const [anchors, setAnchors] = React.useState<(HTMLElement|null)[]>(options.map(_ => null));

    const handleItemClick = React.useCallback((e: React.MouseEvent<HTMLLIElement>, option: TreeMenuOption, index: number) => {
        if (option.options?.length) {
            setAnchors(prev => prev.map((anchor, i) => i !== index ? anchor : e.currentTarget))
        }
        if (option.onClick) {
            option.onClick();
        }
        onClose();
    }, [setAnchors, onClose]);

    const handleMenuClose = React.useCallback((index: number) => {
        setAnchors(prev => prev.map((anchor, i) => i !== index ? anchor : null));
        onClose();
    }, [setAnchors, onClose]);

    return (
        <Menu
            id={id}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={onClose}
        >
            {options.map((option, index) => [

                <MenuItem 
                    key={option.id} 
                    disabled={option.disabled}
                    onClick={e => handleItemClick(e, option, index)}
                >
                    {option.label}
                </MenuItem>,

                option.options &&  
                    <TreeMenu 
                        id={option.id} 
                        options={option.options}
                        anchorEl={anchors[index]}
                        onClose={() => handleMenuClose(index)}
                    />,
                    
            ].filter(x => x))}
        </Menu>
    )
};

export default TreeMenu;