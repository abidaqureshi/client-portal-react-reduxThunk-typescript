import React from 'react';
import { Tooltip } from '@material-ui/core';
import { ProductV2 } from '../../../models/ProductV2';
import { useTranslations } from '../../../store/Translations/hooks';
import { CircleBox, Collumn3, TriangleBox } from '../styled';
import { GridContainer, ItemsContainer } from './styled';

export const AdditionalInformation: React.FC<{ product: ProductV2 }> = ({ product }) => {
    const t = useTranslations();
    return (
        <GridContainer style={{ margin: '0px' }}>
            <ItemsContainer>
                {!!product.isGeneric && (
                    <Tooltip title={<span>Generic</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isGeneric}>
                                G
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}
                {!!(product.isPsychotropic || product.isNarcotic) && (
                    <Tooltip title={<span>Controlled Drug</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isPsychotropic || product.isNarcotic}>
                                Ps
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}
                {!!product.isBiological && (
                    <Tooltip title={<span>Biological</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isBiological}>
                                B
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}
            </ItemsContainer>
            <ItemsContainer>
                {!!product.isPrescription && (
                    <Tooltip title={<span>Prescription drug</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isPrescription}>
                                Rx
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}

                {!!product.isAdditionalMonitoring && (
                    <Tooltip title={<span>Addtional monitoring</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isAdditionalMonitoring}>
                                <TriangleBox isActive={true} bgColor={'white'}></TriangleBox>
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}
                {!!product.isParallelImport && (
                    <Tooltip title={<span>Parallel Import</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isParallelImport}>
                                PI
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}

                {!!product.isHospitalar && (
                    <Tooltip title={<span>Hospital drug</span>}>
                        <Collumn3>
                            <CircleBox isActive={product.isHospitalar}>
                                H
                            </CircleBox>
                        </Collumn3>
                    </Tooltip>
                )}
            </ItemsContainer>
        </GridContainer>
    );
};
