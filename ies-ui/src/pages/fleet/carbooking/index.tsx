import essIcon from '@/assets/ess.png';
import essAnnIcon from '@/assets/ess-announce.png';
import essProfileIcon from '@/assets/customer.png';

import performanceReview from '@/assets/performance-review.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { ClockCircleOutlined, ExportOutlined } from '@ant-design/icons'; 
import { useAccess } from '@umijs/max'; 
import { PageContainer } from '@ant-design/pro-components';

export const HrmPaths = {
    employee: '/hrm/employee',
    ess: '/ess', 
    noPath: '', 
}

export default () => {

    const access = useAccess()
    const items: ListMenuItem[] = [ 
        {
            id: 'booking_list',
            name: 'booking List',
            description: 'booking-List',
            link: `${HrmPaths.employee}/list`,
            // visible: access.canAccessHrEmployeeMenuItem,
            icon: essIcon,
          },
          {
            id: 'booking_car',
            name: 'Booking Car',
            description: 'Booking Car',
            link: `${HrmPaths.ess}/list`, 
            icon: essAnnIcon,
            visible: true
          },           
          {
            id: 'occupy_car',
            name: 'Occupy Car',
            description: 'Occupy Car',
            link: `${HrmPaths.ess}/list`, 
            icon: essAnnIcon,
            visible: true
          }, 
    ]

    return (
        <PageContainer title = {false}>
            <ListMenuComp items={items} />
        </PageContainer>
    )
}