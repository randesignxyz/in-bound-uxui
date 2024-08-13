import essIcon from '@/assets/ess.png';
import essAnnIcon from '@/assets/ess-announce.png';
import essProfileIcon from '@/assets/customer.png';

import performanceReview from '@/assets/performance-review.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { ClockCircleOutlined, ExportOutlined } from '@ant-design/icons'; 
import { useAccess } from '@umijs/max'; 
import { PageContainer } from '@ant-design/pro-components';

export const FleetPaths = { 
  carbooking: '/fleet', 
  noPath: '', 
}

export default () => {

    const access = useAccess()
    const items: ListMenuItem[] = [ 
          {
            id: 'fleet_booking',
            name: 'Booking Car',
            description: 'Booking car',
            link: `${FleetPaths.carbooking}/booking_car`, 
            icon: essAnnIcon,
            visible: true
          }
    ]

    return (
        <PageContainer title = {false}>
            <ListMenuComp items={items} />
        </PageContainer>
    )
}