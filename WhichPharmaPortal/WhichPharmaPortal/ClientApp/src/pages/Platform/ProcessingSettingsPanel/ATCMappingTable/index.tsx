import * as React from "react";
import { Table, TableBody, TableRow, TableCell, Typography } from "@material-ui/core";
import { MapOf } from "../../../../utils/Types";
import MultipleSelectInput from "../../../../components/inputs/MultipleSelectInput";
import { useTranslations } from "../../../../store/Translations/hooks";
import { TK } from "../../../../store/Translations/translationKeys";
import { ATCMappingTableContainer } from "./styled";
import { ProcessingATCSettings } from "../../../../models/ProcessingATCSettings";
import SingleSelectInput from "../../../../components/inputs/SingleSelectInput";

export interface ATCMappingTableProps {
    values: MapOf<ProcessingATCSettings>,
    onChange: (values: MapOf<ProcessingATCSettings>) => void,
}

const ATCMappingTable: React.FC<ATCMappingTableProps> = ({ values, onChange }) => {

    const t = useTranslations();

    const handleChange = React.useCallback((key: string) => (rowValues: string[]) => {
        //onChange({ ...values, [key]: rowValues });
    }, [onChange, values]);

    if (Object.keys(values).length == 0) {
        return (<></>);
    }
    var _1 = "";
    return (
        <ATCMappingTableContainer>
            {/*<Typography variant="caption">* {t(TK.specifyTheKeywordsForTheCorrespondingValues)}.</Typography>*/}
            <Table size="small" >
                <TableBody>
                    {Object.keys(values).map(key => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell width="100%">
                                <SingleSelectInput
                                    options={Object.keys(values).map(I => values[I].description).slice(0,5)}
                                    freeSolo
                                    value={values[key].description}
                                    onChange={handleChange(key)}
                                    allowAdd
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ATCMappingTableContainer>
    )
}

export default ATCMappingTable;