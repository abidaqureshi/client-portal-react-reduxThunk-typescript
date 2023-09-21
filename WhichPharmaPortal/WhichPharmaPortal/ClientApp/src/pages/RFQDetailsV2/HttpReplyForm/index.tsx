import React from 'react';
import { useSelector } from 'react-redux';
import { getMyRoles } from '../../../store/Users/selectors';
import { IitemProps } from '../BarGraph';
import HttpIcon from '@material-ui/icons/Http';
import { UserRole } from '../../../models/UserRole';
import { TK } from '../../../store/Translations/translationKeys';

export const HttpReplyForm: React.FC<IitemProps> = ({ item }) => {
    const { supplierReplyForm } = item.data;
    const myRoles = useSelector(getMyRoles);
    const allowedRoles = [UserRole.Administrator, UserRole.Collaborator, UserRole.PlatformContributor];

    const rfqUrl = supplierReplyForm?.split('&')[0] as string;
    return (
        (allowedRoles.findIndex((role) => myRoles.includes(role)) > 0 && (
            <a href={rfqUrl} target="_blank" rel="noopener noreferrer">
                <HttpIcon />
            </a>
        )) || <div>{TK.notAuthorised}</div>
    );
};
