import React, { FC, ComponentType } from 'react';
import {
    Plugin,
    Template,
    TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import { Tooltip } from '@material-ui/core';
import { ColoredIconButton } from './styled';

export interface CustomToolbarButton {
    icon: ComponentType
    title: string,
    color?: 'success' | 'error',
    onClick: () => void,
}

const pluginDependencies = [
    { name: 'Toolbar' }
  ];

const CustomToolbarButton: FC<CustomToolbarButton> = ({ 
    icon: Icon, 
    title,
    color,
    onClick,
}) => (
    <Plugin
        dependencies={pluginDependencies} 
    >
        <Template name="toolbarContent">
            <TemplatePlaceholder />
            <Tooltip title={title} >
                <ColoredIconButton aria-label={title} onClick={onClick} $iconColor={color} >
                    <Icon />
                </ColoredIconButton>
            </Tooltip>
        </Template>
    </Plugin>
);

export default CustomToolbarButton;