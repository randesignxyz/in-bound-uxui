import essIcon from '@/assets/ess.png';
import essAnnIcon from '@/assets/ess-announce.png';  
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu'; 
import { useAccess } from '@umijs/max'; 
import { PageContainer } from '@ant-design/pro-components';

export const HrmPaths = {
    employee: '/hrm/employee',
    ess: '/ess', 
    bkc: 'fleet/booking/', 
    noPath: '', 
}

export default () => {

    const access = useAccess()
    const items: ListMenuItem[] = [ 
        {
            id: 'booking_list',
            name: "Who's Booking Cars",
            description: "Who's Booking Cars List",
            link: `${HrmPaths.bkc}/rqblist`,
            // visible: access.canAccessHrEmployeeMenuItem,
            icon: essIcon,
          },
          {
            id: 'booking_car',
            name: 'Booking Car',
            description: 'Booking Car',
            link: `${HrmPaths.bkc}/ocplist`, 
            icon: essAnnIcon,
            visible: true
          },           
          {
            id: 'occupy_car',
            name: 'Occupy Cars',
            description: 'Occupy Car',
            link: `${HrmPaths.bkc}/ocplist`, 
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