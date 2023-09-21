import styled from "styled-components";
import { AccordionDetails, AccordionDetailsProps, makeStyles } from "@material-ui/core";

export const FiltersSummary = styled.div`
    margin-left: var(--spacer-M);
    opacity: .8;
    font-size: var(--font-XS);

    & > * {
        margin: 0 var(--spacer-XS);
    }
`;

export const FiltersInputsContainer = styled(AccordionDetails) <AccordionDetailsProps>`
    flex-direction: column;

    & > * {
        margin: var(--spacer-XS) 0 !important;
    }
`;

export const IconStyle = makeStyles({
    IndustryIcon: {
        color: '#156f56',
        width: '1.6em',
        height: '1.4em'
    }
});