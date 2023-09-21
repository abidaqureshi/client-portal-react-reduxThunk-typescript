import * as React from 'react';
import { TK } from '../../../../store/Translations/translationKeys';
import { useTranslations } from '../../../../store/Translations/hooks';
import { Tooltip, Typography, } from '@material-ui/core';
import { BookmarkIconButton } from './styled';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { placeholderPlugin } from './placeholderPlugin';

const placeholders = {
    userFirstName: 'user.first-name',
    userLastName: 'user.last-name',
    userTitle: 'user.title',
    userEmail: 'user.email',
    supplierFirstName: 'supplier.first-name',
    supplierLastName: 'supplier.last-name',
    productsTable: 'products.table',
    replyFormUrl: 'reply-form-url',
    dueDate: 'rfq.dueDate',
}

const sunEditorButtons = [
    ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'removeFormat'],
    ['fontColor', 'hiliteColor', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'table'],
    ['link', 'image', 'showBlocks', 'codeView', 'preview'],
];

export interface EmailTemplateProps {
    defaultTemplate?: string;
    emailTemplate: string;
    onEmailTemplateChanged: (emailTemplate: string) => void;
    saveTemplate: (emailTemplate: string) => void;
    removeSavedTemplate: () => void;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
    defaultTemplate,
    emailTemplate,
    onEmailTemplateChanged,
    saveTemplate,
    removeSavedTemplate,
}) => {
    const t = useTranslations();

    const warningMessages = [
        ([placeholders.userFirstName, placeholders.userLastName].every(placeholder => !emailTemplate.includes(placeholder)) && 'Note that you are not mentioning your name') || undefined,
        ([placeholders.supplierFirstName, placeholders.supplierLastName].every(placeholder => !emailTemplate.includes(placeholder)) && 'Note that you are not mentioning the supplier name') || undefined,
        ([placeholders.productsTable].every(placeholder => !emailTemplate.includes(placeholder)) && 'Note that the products table is not part of the e-mail') || undefined,
    ].filter(x => x);

    const isEqualDefault = React.useMemo(() => defaultTemplate === emailTemplate, [defaultTemplate, emailTemplate]);

    const placeholderPluginObject = React.useMemo(() => placeholderPlugin(Object.values(placeholders)), []);

    return (
        <div style={{ position: 'relative' }}>

            <Tooltip title={t(isEqualDefault ? TK.removeThisTemplate : TK.saveThisTemplate)}>
                <BookmarkIconButton onClick={() => isEqualDefault ? removeSavedTemplate() : saveTemplate(emailTemplate)}>
                    {isEqualDefault ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </BookmarkIconButton>
            </Tooltip>

            <div style={{ all: 'initial' }}>
                <SunEditor
                    height={500}
                    setContents={emailTemplate}
                    onChange={onEmailTemplateChanged}
                    setOptions={{
                        buttonList: [...sunEditorButtons, [placeholderPluginObject.name]],
                        customPlugins: [placeholderPluginObject],
                    }}
                />
            </div>

            {!!warningMessages?.length && warningMessages.map(msg => <Typography key={msg} color="error">{msg}</Typography>)}
        </div>
    );
};

export default EmailTemplate;
