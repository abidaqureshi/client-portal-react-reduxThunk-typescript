import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import React, { useEffect, useState } from 'react';
import { useTranslations } from '../../../../store/Translations/hooks';
import { TK } from '../../../../store/Translations/translationKeys';

interface IShowMoreProps {
    limit: number;
    data: string[];
}

const ShowMore: React.FC<IShowMoreProps> = ({ data, limit }) => {
    const t = useTranslations();
    const [list, setList] = useState<string[]>(data);
    const [isShowMore, setIsShowMore] = useState<boolean>(false);

    useEffect(() => {
        if (list && list.length > limit) {
            setList(list.slice(0, limit));
            setIsShowMore(true);
        }
    }, []);

    return (
        <>
            {(list?.length &&
                list.map((c) => {
                    return (
                        <Tooltip key={c} title={t(((TK as any)[c] || c) as TK)}>
                            <Chip size="small" label={t(((TK as any)[c] || c) as TK)} />
                        </Tooltip>
                    );
                })) ||
                '-'}
            {isShowMore && data.length && (
                <Tooltip
                    title={data.slice(limit).map((label) => (
                        <div key={label} style={{ lineHeight: '2.2rem' }}>
                            <Chip size="small" label={label} />
                        </div>
                    ))}
                >
                    <Chip
                        style={{ marginLeft: '0.1rem', borderRadius: '0.5rem' }}
                        size="small"
                        label={'+' + data.slice(limit).length}
                    />
                </Tooltip>
            )}
        </>
    );
};

export default ShowMore;
