import requisitionIcon from '@/assets/requisition.png';
import performanceReview from '@/assets/performance-review.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { ExportOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import PerformanceReport from './appraisal-request/components/PerformanceReport';
import jobsdes from '../../assets/jobsdes.png';
export const HrmPaths = {
    employee: '/hrm/employee',
    staffRequisition: '/hrm/staff-requisistion',
    newStaffRequest: '/hrm/new-staff',
    staffProposalRequest: '/hrm/staff-proposal',
    appraisalSubmit: '/hrm/appraisal-submit',
    appraisalRequest: '/hrm/appraisal-request',
    probationEvaluation: '/hrm/probation-evaluation',
    df: '/hrm/df',
   jobdes: '/hrm/jobdes'
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
        },{
            id: 'probation_evaluation',
            name: 'Probation Evaluation',
            description: 'Probation Evaluation Form',
            visible: access.canAccessProbationEvaluation,
            link: `${HrmPaths.probationEvaluation}/list`,
            icon: requisitionIcon,
        },{
            id: 'df_360',
            name: '360 Degree Feedback',
            description: '360 Degree Feedback Form',
            visible: access.canAccessDF360,
            link: `${HrmPaths.df}/list`,
            icon: requisitionIcon,
        },
      {
        id: 'job',
        name: 'Job',
        description: 'Job Description',
        visible: access.canAccessHrEmployeeMenuItem,
        link: `${HrmPaths.jobdes}/list`,
        icon: jobsdes,
      }
    ]

    return (
        <PageContainer title={false}>
            <ListMenuComp items={items} />
        </PageContainer>
    )
}
