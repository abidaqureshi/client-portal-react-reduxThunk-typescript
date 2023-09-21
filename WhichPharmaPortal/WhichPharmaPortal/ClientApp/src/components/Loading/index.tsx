import * as React from 'react';
import { LoadingContainer, LoadingGif } from "./styed";

const Loading : React.FC<{isLoading: boolean}> = ({isLoading}) => (
    <LoadingContainer isLoading={isLoading}><LoadingGif src="/loading.gif" /></LoadingContainer>
)

export default Loading;