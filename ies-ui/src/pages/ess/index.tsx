import essIcon from '@/assets/ess.png';
import essAnnIcon from '@/assets/ess-announce.png';
import essProfileIcon from '@/assets/customer.png';

import performanceReview from '@/assets/performance-review.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { ClockCircleOutlined, ExportOutlined } from '@ant-design/icons'; 
import { useAccess } from '@umijs/max'; 
import { PageContainer } from '@ant-design/pro-components';
import EmpReport from './reports/EmpReport';

export const HrmPaths = {
    employee: '/hrm/employee',
    ess: '/ess', 
    noPath: '', 
}

export default () => {

    const access = useAccess()
    const items: ListMenuItem[] = [ 
        {
            id: 'employee_self',
            name: 'Employee List',
            description: 'Employee-List',
            link: `${HrmPaths.employee}/list`,
            visible: access.canAccessHrEmployeeMenuItem,
            icon: essIcon,
            menu: access.canAccessHrESSEmpMenuReport? {
              items: [{ label: <EmpReport trigger={<a>Export</a>} />, key: 'exportEssEmpReport', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} /> }]
            }: undefined
          },
          {
            id: 'ess_announcement',
            name: 'Announcement',
            description: 'Announcement',
            link: `${HrmPaths.ess}/list`, 
            visible: access.canAccessHrEmployeeMenuItem,
            icon: essAnnIcon
          },
          {
            id: 'ess_profile',
            name: 'Employe Profile',
            description: 'Employe Profile',
            link: `${HrmPaths.noPath}/profile/0/0`, 
            icon: essProfileIcon,
            visible: true
          },
          // {
          //   id: 'ess_employee_feedback',
          //   name: 'Employee Feedback',
          //   description: 'Employee Feedback',
          //   link: `${HrmPaths.ess}/feedback`, 
          //   icon: essAnnIcon,
          //   visible: true
          // } 
    ]

    return (
        <PageContainer contentWidth='Fluid' title={false}>
            <ListMenuComp items={items} />
        </PageContainer>
    )
}