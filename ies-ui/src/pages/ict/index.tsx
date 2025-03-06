import ticketIcon from '@/assets/incident.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import ItIncidentRpt from './reports/ItIncidentRpt';
import { BarChartOutlined } from '@ant-design/icons';
import ItRequestRpt from './it-request/reports/ItRequestRpt';

export const ICTPaths = {
    incident: '/ict/incident',
    request: '/ict/request',
}
export default () => {
    const access = useAccess()
    const items: ListMenuItem[] = [
        {
            id: 'incident',
            name: 'Incident Ticket',
            description: 'Incident Ticket List',
            link: `${ICTPaths.incident}/list`,
            visible: access.canAccessIncidentMenuItem,
            icon: ticketIcon,
            menu: {
                items: [
                    {
                        label: <ItIncidentRpt trigger={<a>Incident Report</a>} />,
                        key: 'incident-report',
                        icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
                        disabled: !access.isAnalystIncidentTicket
                    }
                ]
            }
        },
        {
            id: 'itRequest',
            name: "IT Request",
            description: "IT equipment, service or software.",
            link: `${ICTPaths.request}/list`,
            visible: access.canAccessITRequestFormMenuItem,
            icon: ticketIcon,
            menu: {
                items: [
                    {
                        label: <ItRequestRpt trigger={<a>Incident Report</a>} />,
                        key: 'it-request-report',
                        icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
                        disabled: !access.canAccessITRequestReport
                    }
                ]
            }
        }
    ]
    return (
        <PageContainer title={false}>
            <ListMenuComp items={items} />
        </PageContainer>
    )
}