import { makeStyles } from '@material-ui/core/styles';
export const useProductCardStyles = makeStyles({
    root: {
        width: 350,
        margin: '0.8rem',
    },
    cardBoxItems: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
    title: {
        fontSize: 18,
        fontWeight: 600,
    },
    supplierTitle: {
        fontSize: 18,
        fontWeight: 400,
    },
    pos: {
        marginBottom: 12,
    },
});
