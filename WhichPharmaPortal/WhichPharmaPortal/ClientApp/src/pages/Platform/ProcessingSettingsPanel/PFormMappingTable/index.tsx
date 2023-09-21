import * as React from "react";
import { Table, TableBody, TableRow, TableCell, Typography, Dialog, Button, FormControl, Select, InputLabel, MenuItem, IconButton, DialogContent, TableHead, Divider } from "@material-ui/core";
import { MapOf } from "../../../../utils/Types";
import MultipleSelectInput from "../../../../components/inputs/MultipleSelectInput";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { useTranslations } from "../../../../store/Translations/hooks";
import { TK } from "../../../../store/Translations/translationKeys";
import { PFormMappingTableContainer } from "./styled";
import { CloseIconWrapper, DialogTitleContainer } from "../../../ProductsListProdV1/styled";
import TextInput from "../../../../components/inputs/TextInput";
import { Autocomplete } from "@material-ui/lab";
import SingleSelectInput from "../../../../components/inputs/SingleSelectInput";
import { SearchResult } from "../../../../models/SearchResult";
import { ProcessingPformsSettings } from "../../../../models/ProcessingPformsSettings";

export interface PFormMappingTableProps {
    values: MapOf<ProcessingPformsSettings>,
    values2: SearchResult<ProcessingPformsSettings>,
    onChange: (values: MapOf<ProcessingPformsSettings>) => void,
    onChange2: (values: SearchResult<ProcessingPformsSettings>) => void,
}

const PFormMappingTable: React.FC<PFormMappingTableProps> = ({ values, values2, onChange, onChange2 }) => {

    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const [age, setAge] = React.useState('');
    const [value, setValue] = React.useState('');
    const [value2, setValue2] = React.useState('');
    const [value3, setValue3] = React.useState('');
    const [value4, setValue4] = React.useState('');
    const handleChange = React.useCallback((key: string) => (rowValues: string[]) => {
        values[key].final = rowValues;
        onChange(values);
    }, [onChange, values]);
    const handleChange2 = React.useCallback((key: string) => (rowValues: string[]) => {
        var t = "";
        var idx = values2.items.findIndex(I => I.original == key);
        values2.items[idx].final = rowValues;
        onChange2({ ...values2, [key]: rowValues });
    }, [onChange2, values2]);

    const [values3, setValues3] = React.useState([] as string[]);

    if (Object.keys(values).length == 0) {
        return (<></>);
    }
    var mapping = {} as { [key: string]: ProcessingPformsSettings | undefined };
    //values2.items.forEach(I => mapping[I.original] = I);
    //var mapping = values2.items.map(I => { I.original : I; } as {[]});
    var values23 = {
        'Tabletta': { Translated: 'Tablet', Final : ['Tablet']},
        'Capsule': { Translated: 'Capsule', Final: ['Capsule']},
        'Aerosol': { Translated: 'Aerosol', Final: ['Aerosol']},
        'Aerosol2': { Translated: 'Aerosol2', Final: ['Aerosol']},
        'Aerosol3': { Translated: 'Aerosol3', Final: ['Aerosol']},
    } as { [key: string]: any };
    var date = new Date();
    var t2 = date.toLocaleString();
    const handleClickOpen = () => {
    };
    const handleClose = () => {
        setOpen(false);
    };
    var options4 = [] as string[];
    Object.values(values).forEach(I => options4.push(...(I.final || [])));
    const options3 = new Set<string>(options4);
    options4 = Array.from(options3);
    const options = Object.values(values).map(I => I.translated);
    const options2 = Object.values(values23).map(I => I.Translated);
    options.push('Add term')
    //options.push('Add term2')


    //var options = (<>{Object.keys(values2).map(keys => {
    //    <option value={keys}>{keys}</option>
    //})}</>);

    return (
        <PFormMappingTableContainer>
            <Typography variant="caption">* {t(TK.specifyTheKeywordsForTheCorrespondingValues)}.</Typography>
            <div>Total: {Object.keys(values).length}</div>
            <Table size="small" >
                <TableHead>
                    <TableRow>
                        <TableCell>Original</TableCell>
                        <TableCell>Translated</TableCell>
                        <TableCell>Final</TableCell>
                        <TableCell>Details</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(values).map(key => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{values[key]?.translated}</TableCell>
                        {/*    <TableCell width="100%">*/}
                        {/*        <MultipleSelectInput */}
                        {/*            limitTags={10}*/}
                        {/*            freeSolo*/}
                        {/*            values={values[key]}*/}
                        {/*            onChange={handleChange(key)}*/}
                        {/*            allowAdd*/}
                        {/*        />*/}
                            {/*    </TableCell>*/}
                            <TableCell>
                                <MultipleSelectInput
                                    values={values[key]?.final}
                                    options={options4}
                                    renderOption={(option) => {
                                        if (option == 'Add term') {
                                            return <div><hr />{option}</div>;
                                        }
                                        return option;
                                    }}
                                    freeSolo
                                    allowAdd
                                    onChange={handleChange(key)}
                                    
                                    //width={'50%'}
                                />
                                <Dialog open={open} onClose={handleClose} style={{ width:'100%' }}>
                                    <DialogTitleContainer>
                                        <CloseIconWrapper>
                                            <IconButton onClick={handleClose} style={{ outline: 'none' }}>
                                                <HighlightOffIcon color="primary" fontSize="large" />
                                            </IconButton>
                                        </CloseIconWrapper>
                                    </DialogTitleContainer>
                                    <DialogContent style={{ width: '100%' }}>
                                        <div><b>Category</b>
                                            <SingleSelectInput
                                                options={options2}
                                                value={value}
                                                freeSolo
                                            />
                                        </div>
                                        <div><b>Subcategory</b>
                                            <SingleSelectInput
                                                options={options2}
                                                value={value2}
                                                freeSolo

                                            />
                                        </div>
                                        <div><b>Pharmaceutical form</b>
                                            <SingleSelectInput
                                                options={options2}
                                                value={value3}
                                                freeSolo
                                            />
                                        </div>
                                        <div><b>Administration route</b>
                                            <SingleSelectInput
                                                options={options2}
                                                value={value4}
                                                freeSolo
                                            />
                                        </div>
                                        <Button onClick={handleClose} style={{ backgroundColor: "#00c4aa", color: 'white', margin: '16px' }}>Create</Button>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                            <TableCell>Last updated by:<br />{values[key]?.updated != undefined ? new Date(Date.parse(values[key]?.updated?.toString() || '')).toLocaleString() : ''}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </PFormMappingTableContainer>
    )
}

export default PFormMappingTable;