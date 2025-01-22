import essIcon from '@/assets/ess.png';
import essAnnIcon from '@/assets/ess-announce.png';  
import fBookingCarIcon from '@/assets/booking_car.png';  
import fBookRoomIcon from '@/assets/booking_room.png';  
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu'; 
import { useAccess } from '@umijs/max'; 
import { PageContainer } from '@ant-design/pro-components';

export const HrmPaths = {
    employee: '/hrm/employee',
    ess: '/ess', 
    bkc: '/fleet/carbooking', 
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
            name: 'My Booking Car',
            description: 'My Booking Car',
            link: `${HrmPaths.bkc}/rqblist`, 
            icon: fBookingCarIcon,
            visible: true
          },   
          {
            id: 'booking_room',
            name: 'My Booking Room',
            description: 'My Booking Room',
            link: `${HrmPaths.bkc}/rqroomlist`, 
            icon: fBookRoomIcon,
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