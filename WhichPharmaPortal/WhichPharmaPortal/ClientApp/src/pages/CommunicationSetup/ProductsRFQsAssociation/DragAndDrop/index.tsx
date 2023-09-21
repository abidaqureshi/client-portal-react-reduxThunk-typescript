import * as React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { RFQCard, ProductChip } from './styled';
import { Chip, IconButton, CardHeader } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

export interface DragAndDropItemProps {
    id: string, 
    label: React.ReactNode,
    onCloseClick?: () => void,
}

export interface DragAndDropProps {
    id: string,
    avatar?: React.ReactNode,
    title: React.ReactNode,
    items: DragAndDropItemProps[],
    texts?: {
        none?: string,
    },
    onCloseClick?: () => void,
}

const DragAndDrop : React.FC<DragAndDropProps> = ({
    id,
    title,
    avatar,
    items = [],
    texts,
    onCloseClick,
}) => (
    <Droppable droppableId={id}>
        {(provided, snapshot) => (
            <RFQCard
                $isDraggingOver={snapshot.isDraggingOver}
                {...provided.droppableProps}
                ref={provided.innerRef}
            >
                <CardHeader
                    avatar={avatar}
                    action={ onCloseClick && (
                        <IconButton aria-label="remove" onClick={onCloseClick}>
                            <CloseIcon />
                        </IconButton>
                    )}
                    title={title}
                />
                {items.filter(item => item).map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                        <ProductChip
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                label={item.label}
                                color="primary"
                                onDelete={item.onCloseClick}
                            />)}
                    </Draggable>
                ))}
                {!items.length && texts?.none?.length && <Chip label={texts.none}/>}
                {provided.placeholder}
            </RFQCard>
        )}
    </Droppable>
);

export default DragAndDrop;