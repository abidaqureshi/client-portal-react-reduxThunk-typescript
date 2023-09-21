import React from 'react';
import {
    SearchContainerDiv,
    Title,
    ExpandableHeader,
    NotificationIcon,
    ExpandIcon,
    ExpandableContainer,
} from './styled';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { Button } from '@material-ui/core';

export interface SearchContainerProps {
    showClearButton?: boolean;
    children?: React.ReactNode;
    onClearAll?: () => void;
}

const SearchContainer: React.FC<SearchContainerProps> = ({ showClearButton, children, onClearAll }) => {
    return <SearchContainerDiv>{children}</SearchContainerDiv>;
};

export interface AdvancedSearchContainerProps {
    showChangeNotification?: boolean;
    isOpen?: boolean;
    children?: React.ReactNode;
}

export const AdvancedSearchContainer: React.FC<AdvancedSearchContainerProps> = ({
    showChangeNotification,
    children,
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const t = useTranslations();
    return (
        <>
            <ExpandableHeader onClick={(): void => setShowAdvancedFilters(!showAdvancedFilters)}>
                <div>
                    {showChangeNotification && <NotificationIcon />}
                    {t(TK.advancedSearch)} <ExpandIcon $isOpen={showAdvancedFilters} />
                </div>
            </ExpandableHeader>

            <ExpandableContainer $isOpen={showAdvancedFilters}>{children}</ExpandableContainer>
        </>
    );
};

export const AGAdvancedSearchContainer: React.FC<AdvancedSearchContainerProps> = ({
    showChangeNotification,
    isOpen,
    children,
}) => {
   
    const t = useTranslations();
    return (
        <>       
            <ExpandableContainer $isOpen={isOpen}>{children}</ExpandableContainer>
        </>
    );
};

export default SearchContainer;
