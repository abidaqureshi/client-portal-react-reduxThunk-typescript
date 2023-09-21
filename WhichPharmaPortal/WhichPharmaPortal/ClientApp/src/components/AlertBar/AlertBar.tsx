import React from 'react';
import './AlertBar.scss';
import { Alert, Container } from 'reactstrap';

export enum AlertType {
    Error,
    Info,
    Success,
}

export interface AlertItem {
    id: string;
    type: AlertType;
    content: React.ReactNode;
    durationMs?: number;
}

export interface AlertBarStateProps {
    alerts: AlertItem[];
}

export interface AlertBarDispatchProps {
    alertDismissed: (id: string) => void;
}

export type AlertBarProps = AlertBarStateProps & AlertBarDispatchProps;

const AlertBar: React.FC<AlertBarProps> = (props) => {
    const { alerts, alertDismissed } = props;

    const [activeAlerts, setActiveAlerts] = React.useState<AlertItem[]>(alerts);

    React.useMemo(() => {
        const newAlerts = alerts.filter((a) => !activeAlerts.some((aa) => aa.id === a.id));

        setTimeout(() => setActiveAlerts(activeAlerts.concat(newAlerts)), 100);

        newAlerts.forEach((alert) => {
            if (alert.durationMs) {
                setTimeout(() => alertDismissed(alert.id), alert.durationMs + 100);
            }
        });
        // eslint-disable-next-line
    }, [alerts]);

    const getColor = (type: AlertType): string => {
        switch (type) {
            case AlertType.Error:
                return 'danger';
            case AlertType.Success:
                return 'success';
            default:
                return 'primary';
        }
    };

    const toggle = (alert: AlertItem) => {
        alertDismissed(alert.id);
        setTimeout(() => setActiveAlerts(activeAlerts.filter((a) => a.id !== alert.id)), 1000);
    };

    return (
        <Container className="alertsContainer">
            {activeAlerts.map((alert) => (
                <Alert
                    key={alert.id}
                    color={getColor(alert.type)}
                    toggle={() => toggle(alert)}
                    isOpen={alerts.some((a) => a.id === alert.id)}
                >
                    {alert.content}
                </Alert>
            ))}
        </Container>
    );
};

export default AlertBar;
