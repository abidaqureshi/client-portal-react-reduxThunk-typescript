import React from 'react';
import LanguageIcon from '@material-ui/icons/Language';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import DescriptionIcon from '@material-ui/icons/Description';

export const AGIconHoc: React.FC<{ iconType: string }> = ({ iconType }) => {
    if (iconType.toLowerCase().includes('web')) {
        return <LanguageIcon color="primary" />;
    }
    if (iconType.toLowerCase().includes('pil')) {
        return <InsertDriveFileIcon color="primary" />;
    }
    return <DescriptionIcon color="primary" />;
};
