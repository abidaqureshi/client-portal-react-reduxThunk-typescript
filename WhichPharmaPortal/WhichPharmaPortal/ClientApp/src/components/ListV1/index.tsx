import * as React from 'react';
import { Accordion, Typography, Checkbox } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactElement } from 'react';
import { ItemSummary, ItemHeader, Spacer, DetailsContainer, AccordionHeader } from './styled';
import CountryFlag from '../CountryFlag';
import UserAvatar from '../UserAvatar';

export interface Item {
    id: string | number;
    countryName?: string;
    countryCode?: string;
    username?: string;
    isSelected?: boolean;
}

export interface ListProps<T extends Item> {
    items: T[];
    multiple?: boolean;
    defaultExpanded?: string | number | number[] | string[];
    renderName: (item: T) => string | React.ReactNode;
    renderSummary?: (item: T) => string | React.ReactNode;
    renderDetails?: (item: T) => string | React.ReactNode;
    renderActions?: (item: T) => string | React.ReactNode;
    onItemClick?: (item: T) => void;
    onItemSelected?: (item: T) => void;
    onItemDeselected?: (item: T) => void;
    onExpandedChanged?: (expanded: (number | string)[]) => void;
}

const List = <T extends Item>({
    items,
    multiple,
    defaultExpanded,
    renderName,
    renderSummary,
    renderDetails,
    renderActions,
    onItemClick,
    onItemSelected,
    onItemDeselected,
    onExpandedChanged,
}: ListProps<T>): ReactElement => {
    const [expandedItems, _setExpandedItems] = React.useState<(string | number)[]>([]);

    const setExpandedItems = React.useCallback(
        (expanded: (string | number)[]) => {
            _setExpandedItems(expanded || []);
            onExpandedChanged && onExpandedChanged(expanded);
        },
        [onExpandedChanged],
    );

    const handleItemClick = (item: T) => {
        if (renderDetails) {
            const isExpanded = expandedItems.includes(item.id);

            if (multiple) {
                setExpandedItems(
                    isExpanded ? expandedItems.filter((id) => id !== item.id) : [...expandedItems, item.id],
                );
            } else {
                setExpandedItems(isExpanded ? [] : [item.id]);
            }
        }
    };

    React.useEffect(
        () =>
            setExpandedItems(
                defaultExpanded ? (Array.isArray(defaultExpanded) ? defaultExpanded : [defaultExpanded]) : [],
            ),
        [setExpandedItems, defaultExpanded],
    );

    return (
        <div>
            {items.map((item) => {
                const nameRendered = renderName(item);
                return (
                    <Accordion
                        key={item.id}
                        expanded={expandedItems.includes(item.id)}
                        onChange={() => handleItemClick(item)}
                    >
                        <AccordionHeader
                            key={item.id}
                            $isExpanded={expandedItems.includes(item.id)}
                            expandIcon={renderDetails && <ExpandMoreIcon />}
                        >
                            <ItemHeader onClick={() => onItemClick && onItemClick(item)} key={item.id}>
                                {(onItemDeselected || onItemSelected) && (
                                    <Checkbox
                                        color="primary"
                                        checked={item.isSelected}
                                        onChange={() =>
                                            item.isSelected
                                                ? onItemDeselected && onItemDeselected(item)
                                                : onItemSelected && onItemSelected(item)
                                        }
                                    />
                                )}

                                {!!item.username?.length && <UserAvatar username={item.username} />}

                                {item.countryName && (
                                    <CountryFlag countryCode={item.countryCode as string} country={item.countryName} />
                                )}

                                {typeof nameRendered === 'string' ? (
                                    <Typography>
                                        <b>{nameRendered}</b>
                                    </Typography>
                                ) : (
                                    nameRendered
                                )}

                                {renderSummary && <ItemSummary>{renderSummary(item)}</ItemSummary>}

                                {renderActions && (
                                    <>
                                        <Spacer />
                                        {renderActions(item)}
                                    </>
                                )}
                            </ItemHeader>
                        </AccordionHeader>

                        {renderDetails && <DetailsContainer>{renderDetails(item)}</DetailsContainer>}
                    </Accordion>
                );
            })}
        </div>
    );
};

export default List;
