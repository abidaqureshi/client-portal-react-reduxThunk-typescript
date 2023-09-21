import * as React from "react";
import { Table, TableBody, TableRow, TableCell, Typography, Dialog, Button, FormControl, Select, InputLabel, MenuItem, IconButton, DialogContent, TableHead, Divider } from "@material-ui/core";
import { MapOf } from "../../../../utils/Types";
import MultipleSelectInput from "../../../../components/inputs/MultipleSelectInput";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { useTranslations } from "../../../../store/Translations/hooks";
import { TK } from "../../../../store/Translations/translationKeys";
import { MappingTableContainer } from "./styled";
import { CloseIconWrapper, DialogTitleContainer } from "../../../ProductsListProdV1/styled";
import TextInput from "../../../../components/inputs/TextInput";
import { Autocomplete } from "@material-ui/lab";
import SingleSelectInput from "../../../../components/inputs/SingleSelectInput";

export interface MappingTableProps {
    values: MapOf<string[]>,
    onChange: (values: MapOf<string[]>) => void,
}

const MappingTable: React.FC<MappingTableProps> = ({ values, onChange }) => {

    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    var values2 = {
        'Tabletta': { Translated: 'Tablet', Final: ['Tablet'] },
        'Capsule': { Translated: 'Capsule', Final: ['Capsule'] },
        'Aerosol': { Translated: 'Aerosol', Final: ['Aerosol'] },
        'Aerosol2': { Translated: 'Aerosol2', Final: ['Aerosol'] },
        'Aerosol3': { Translated: 'Aerosol3', Final: ['Aerosol'] },
    } as { [key: string]: any };
    const handleClickOpen = () => {
    };
    const [age, setAge] = React.useState('');

    const [values3, setValues3] = React.useState([] as string[]);
    const handleChange2 = (event: Object) => {

        setOpen(true);
        //setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const options = Object.values(values2).map(I => I.Translated);
    options.push('Add term')
    //options.push('Add term2')
    const [value, setValue] = React.useState('');
    const [value2, setValue2] = React.useState('');
    const [value3, setValue3] = React.useState('');
    const [value4, setValue4] = React.useState('');

    const handleChange = React.useCallback((key: string) => (rowValues: string[]) => {
        onChange({ ...values, [key]: rowValues });
    }, [onChange, values]);

    //var options = (<>{Object.keys(values2).map(keys => {
    //    <option value={keys}>{keys}</option>
    //})}</>);

    return (
        <MappingTableContainer>
            <Typography variant="caption">* {t(TK.specifyTheKeywordsForTheCorrespondingValues)}.</Typography>
            <Table size="small" >
                <TableHead>
                    <TableRow>
                        <TableCell>Original</TableCell>
                        <TableCell>Translated</TableCell>
                        <TableCell>Final</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(values2).map(key => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{values2[key].Translated}</TableCell>
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
                                <SingleSelectInput
                                    value={values2[key].Translated}
                                    options={options}
                                    renderOption={(option) => {
                                        if (option == 'Add term') {
                                            return <div><hr />{option}</div>;
                                        }
                                        return option;
                                    }}
                                    onChange={(v) => {
                                        //values2[key].Translated = v;
                                        setOpen(true);
                                    }}

                                //width={'50%'}
                                />
                                <Dialog open={open} onClose={handleClose} style={{ width: '100%' }}>
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
                                                options={options}
                                                value={value}
                                                freeSolo
                                            />
                                        </div>
                                        <div><b>Subcategory</b>
                                            <SingleSelectInput
                                                options={options}
                                                value={value2}
                                                freeSolo

                                            />
                                        </div>
                                        <div><b>Pharmaceutical form</b>
                                            <SingleSelectInput
                                                options={options}
                                                value={value3}
                                                freeSolo
                                            />
                                        </div>
                                        <div><b>Administration route</b>
                                            <SingleSelectInput
                                                options={options}
                                                value={value4}
                                                freeSolo
                                            />
                                        </div>
                                        <Button onClick={handleClose} style={{ backgroundColor: "#00c4aa", color: 'white', margin: '16px' }}>Create</Button>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </MappingTableContainer>
    )
}

export default MappingTable;