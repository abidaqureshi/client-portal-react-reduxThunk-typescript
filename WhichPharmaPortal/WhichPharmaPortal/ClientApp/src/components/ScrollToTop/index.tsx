import * as React from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import { History } from 'history';

const ScrollToTop: React.FC<{ history: History }> = ({ history }) => {
    const location = useLocation();
    const [prevLocation, setPrevLocation] = React.useState(location);
    const ref = React.useMemo(() => React.createRef<HTMLElement>(), []);

    React.useEffect(() => {
        if (location.pathname !== prevLocation.pathname) {
            ref.current?.scrollTo(0, 0);
        }
        setPrevLocation(location);
        // eslint-disable-next-line
    }, [location]);

    return <span id="scroller" ref={ref} style={{width:0, height:0}}/>;
};

export default withRouter(ScrollToTop);
