import * as React from 'react';
import { PanelContainer, PanelButtonsContainer, OptionsIconButton } from './styled';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TreeMenu, { TreeMenuOption } from '../TreeMenu';

export interface PanelProps {
    title?: string | React.ReactNode;
    subtitle?: string;
    children?: React.ReactNode;
    options?: TreeMenuOption[];
    ref?: React.MutableRefObject<HTMLDivElement | undefined>;
}

const Panel: React.FC<PanelProps> = ({ 
    title, 
    subtitle, 
    children,
    options,
    ref,
}: PanelProps) => {
    
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <PanelContainer ref={ref}>
            { options &&
                <>
                    <OptionsIconButton aria-controls={`${title}-menu`} onClick={handleClick}><MoreVertIcon/></OptionsIconButton> 
                    <TreeMenu
                        id={`${title}-menu`}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        options={options}
                    />
                </>
            }
            {title && typeof title === 'string' && <h3>{title}</h3>}
            {title && typeof title !== 'string' && title}
            {subtitle && <p className="subtitle">{subtitle}</p>}
            {children}
        </PanelContainer>
    );
}

export { PanelButtonsContainer };
export default Panel;
