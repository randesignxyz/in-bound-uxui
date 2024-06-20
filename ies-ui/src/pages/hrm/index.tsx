import requisitionIcon from '@/assets/requisition.png';
import performanceReview from '@/assets/performance-review.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { ExportOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import PerformanceReport from './appraisal-request/components/PerformanceReport';

export const HrmPaths = {
    employee: '/hrm/employee',
    staffRequisition: '/hrm/staff-requisistion',
    newStaffRequest: '/hrm/new-staff',
    staffProposalRequest: '/hrm/staff-proposal',
    appraisalSubmit: '/hrm/appraisal-submit',
    appraisalRequest: '/hrm/appraisal-request'
}

export default () => {

    const access = useAccess()
    const items: ListMenuItem[] = [
        {
            id: 'employee',
            name: 'Employee',
            description: 'Employee List',
            link: `${HrmPaths.employee}/list`,
            visible: access.canAccessHrEmployeeMenuItem,
            icon: requisitionIcon,
        },
        {
            id: 'employee-requisition',
            name: 'Staff Requisition',
            description: 'Staff Requisition List',
            visible: access.canAccessHrStaffRequisitionMenuItem,
            link: `${HrmPaths.staffRequisition}/list`,
            icon: requisitionIcon,
        },
        {
            id: 'staff-proposal',
            name: 'Staff Proposal',
            description: 'Staff Proposal List',
            visible: access.canAccessHrStaffProposalMenuItem,
            link: `${HrmPaths.staffProposalRequest}/list`,
            icon: requisitionIcon,
        },
        {
            id: 'appraisal-submit',
            name: 'Annual Performance Appraisal',
            description: 'Annual Performance Appraisal Form',
            visible: access.canAccessAppraisalSubmit,
            link: `${HrmPaths.appraisalSubmit}/list`,
            icon: requisitionIcon,
        },
        {
            id: 'appraisal-request',
            name: 'Performance Request',
            description: 'Annual Performance Appraisal Request List',
            visible: access.canAccessAppraisalReaquest,
            link: `${HrmPaths.appraisalRequest}/list`,
            icon: performanceReview,
            menu: {
                items: [{ label: <PerformanceReport trigger={<a >Export</a>} />, key: 'exportContract', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} /> }]
            }
        }
    ]

    return (
        <PageContainer title={false}>
            {/* <ListMenuComp items={items} /> */}
        </PageContainer>
    )
}