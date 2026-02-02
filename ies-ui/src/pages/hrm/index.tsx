import requisitionIcon from '@/assets/requisition.png';
import performanceReview from '@/assets/performance-review.png';
import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { ExportOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import PerformanceReport from './appraisal-request/components/PerformanceReport';
import jobImage from '../../assets/jobsdes.png';
import ipoImage from '../../assets/ipo.png'
import { Divider } from 'antd/lib';
export const HrmPaths = {
    employee: '/hrm/employee',
    staffRequisition: '/hrm/staff-requisistion',
    newStaffRequest: '/hrm/new-staff',
    staffProposalRequest: '/hrm/staff-proposal',
    appraisalSubmit: '/hrm/appraisal-submit',
    appraisalRequest: '/hrm/appraisal-request',
    probationEvaluation: '/hrm/probation-evaluation',
    df: '/hrm/df',
    job: '/hrm/job',
    ios: '/hrm/ios',
    masterData: '/hrm/master-data',
    employeeIos: '/hrm/ios/employee'
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
        }, {
            id: 'probation_evaluation',
            name: 'Probation Evaluation',
            description: 'Probation Evaluation Form',
            visible: access.canAccessProbationEvaluation,
            link: `${HrmPaths.probationEvaluation}/list`,
            icon: requisitionIcon,
        }, {
            id: 'df_360',
            name: '360 Degree Feedback',
            description: '360 Degree Feedback Form',
            visible: access.canAccessDF360,
            link: `${HrmPaths.df}/list`,
            icon: requisitionIcon,
        }, {
            id: 'job',
            name: 'Position',
            description: 'Job Description',
            visible: access.canAccessHrJOB,
            link: `${HrmPaths.job}/list`,
            icon: jobImage,
        },
    ]

    const iosItem: ListMenuItem[] = [
        {
            id: 'ios',
            name: 'Performance Objectives',
            description: 'Create, review, and endorse objectives',
            visible: access.canAccessHRMIPO,
            link: `${HrmPaths.ios}/list`,
            icon: ipoImage,
        },
        {
            id: 'ios',
            name: 'Master Set Up',
            description: 'Manage system master data',
            visible: access.canAccessHRMasterData,
            link: `${HrmPaths.masterData}/list`,
            icon: ipoImage,
        },
        {
            id: 'ios',
            name: 'Employee',
            description: 'Employee',
            // visible: access.canAccessHREmployee,
            link: `${HrmPaths.employeeIos}/list`,
            icon: ipoImage,
        },
    ]

    return (
        <PageContainer title={false}>
            <ListMenuComp items={items} />
            {
                access.canAccessHrJOB && (
                    <>
                        <Divider plain orientation="left" >Individual Objectives Setting</Divider>
                        <ListMenuComp items={iosItem} />
                    </>
                )
            }
        </PageContainer>
    )
}
