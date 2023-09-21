import React, { useRef } from 'react';
import { useTranslations } from '../../store/Translations/hooks';
import { moneyConvert } from '../../utils/utils';
import { Chip, Tooltip, Typography } from '@material-ui/core';
import { PriceTitle, PriceList, PriceListItem, PriceCaption } from './styled';
import { TK } from '../../store/Translations/translationKeys';
import { Spinner } from 'reactstrap';

interface PriceProps {
    title: string;
    priceWithoutVat?: number;
    priceWithVat?: number;
    currencyCode?: string;
    targetCurrencyCode?: string;
}

const Price: React.FC<PriceProps> = ({
    title,
    priceWithoutVat,
    priceWithVat,
    currencyCode = 'EUR',
    targetCurrencyCode = 'EUR',
}: PriceProps) => {
    const t = useTranslations();

    const componentIsMounted = useRef(true);

    React.useEffect(() => {
        return () => {
            componentIsMounted.current = false;
        };
    }, []);

    const [fPriceWithoutVat, setFPriceWithoutVat] = React.useState<React.ReactNode>(<Spinner size="sm" />);
    const [fPriceWithVat, setFPriceWithVat] = React.useState<React.ReactNode>(<Spinner size="sm" />);
    const [oPriceWithoutVat, setOPriceWithoutVat] = React.useState<React.ReactNode>(<Spinner size="sm" />);
    const [oPriceWithVat, setOPriceWithVat] = React.useState<React.ReactNode>(<Spinner size="sm" />);

    React.useMemo(
        (): void => {
            priceWithoutVat &&
                moneyConvert(priceWithoutVat, currencyCode, targetCurrencyCode).then(
                    (val) => componentIsMounted && setFPriceWithoutVat(<div>{val}</div>),
                );

            priceWithVat &&
                moneyConvert(priceWithVat, currencyCode, targetCurrencyCode).then(
                    (val) => componentIsMounted && setFPriceWithVat(<div>{val}</div>),
                );

            priceWithoutVat &&
                moneyConvert(priceWithoutVat, currencyCode, currencyCode).then(
                    (val) => componentIsMounted && setOPriceWithoutVat(<div>{val}</div>),
                );

            priceWithVat &&
                moneyConvert(priceWithVat, currencyCode, currencyCode).then(
                    (val) => componentIsMounted && setOPriceWithVat(<div>{val}</div>),
                );
        },
        // eslint-disable-next-line
        [],
    );

    const differentCurrencyCode = currencyCode !== targetCurrencyCode;

    if (!priceWithoutVat && !priceWithVat) {
        return <span>-</span>;
    }

    return (
        <Tooltip
            title={
                <>
                    <PriceTitle>{title}</PriceTitle>
                    <PriceList>
                        {priceWithoutVat && (
                            <PriceListItem>
                                <PriceCaption>{t(TK.withoutVAT)}</PriceCaption>
                                {fPriceWithoutVat}
                            </PriceListItem>
                        )}
                        {priceWithVat && (
                            <PriceListItem>
                                <PriceCaption>{t(TK.withVAT)}</PriceCaption>
                                {fPriceWithVat}
                            </PriceListItem>
                        )}
                        {priceWithoutVat && differentCurrencyCode && (
                            <PriceListItem>
                                <PriceCaption>
                                    {t(TK.withoutVAT)} ({t(TK.original)})
                                </PriceCaption>
                                {oPriceWithoutVat}
                            </PriceListItem>
                        )}
                        {priceWithVat && differentCurrencyCode && (
                            <PriceListItem>
                                <PriceCaption>
                                    {t(TK.withVAT)} ({t(TK.original)})
                                </PriceCaption>
                                {oPriceWithVat}
                            </PriceListItem>
                        )}
                    </PriceList>
                </>
            }
        >
            <span>
                <Chip size="small" label={priceWithVat ? fPriceWithVat : fPriceWithoutVat} />
            </span>
        </Tooltip>
    );
};

export default Price;
