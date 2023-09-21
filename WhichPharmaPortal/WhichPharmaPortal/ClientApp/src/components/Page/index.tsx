import * as React from 'react';
import { PageContainer, PageHeader, Title, Spacer, BackButton } from './styled';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

export interface PageProps {
    title?: string | React.ReactNode;
    actionPanel?: React.ReactNode;
    actionPanelAlign?: 'left' | 'right';
    children?: React.ReactNode;
    style?: React.CSSProperties;
    goBack?: () => void;
}

const Page: React.FC<PageProps> = ({ title, actionPanel, actionPanelAlign, children, style, goBack }: PageProps) => (
    <PageContainer style={style}>
        {actionPanel ? actionPanel : null}
        {children}
    </PageContainer>
);

export default Page;
