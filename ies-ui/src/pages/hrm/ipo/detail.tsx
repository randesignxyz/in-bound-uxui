

import React, { useState } from 'react';
import { Card, Steps, Timeline, Typography, Button, Flex, Tag, Space, Divider } from 'antd';
import { UserOutlined, CheckCircleOutlined, FileDoneOutlined, SolutionOutlined, ClockCircleOutlined } from '@ant-design/icons';
import IPOHeaderForm from "./IPOHeaderForm";
import SectionForm, { DataType as Section1DataType } from "./SectionForm";
import Section2Form, { DataType as Section2DataType } from "./Section2Form";
import Section3Form, { DataType as Section3DataType } from "./Section3Form";

const { Step } = Steps;
const { Text } = Typography;

// Mock Data for Activity Logs
const activityLogs = [
    {
        action: 'Created IPO',
        user: 'Pheun Reach',
        date: '2023-01-15 08:30 AM',
        status: 'Draft',
        description: 'First draft created.'
    },
    {
        action: 'Submitted IPO',
        user: 'Pheun Reach',
        date: '2023-01-15 10:00 AM',
        status: 'Submitted',
        description: 'Submitted for review.'
    },
    {
        action: 'Line Manager Review',
        user: 'KAUV Seth Pisal',
        date: '2023-01-16 02:00 PM',
        status: 'In Progress',
        description: 'Reviewing objectives and KPIs.'
    }
];

// Mock Data for Steps
// Draft: Only basic objectives
const draftData1: Section1DataType[] = [
    {
        key: '1', no: 1, objectives: 'Develop new module', actionPlan: 'Coding', kpi: 'Complete module', weight: '50', midYearReview: '', selfEvaluation: 0, yearEndReview: 0, justification: ''
    }
];
const draftData2: Section2DataType[] = [];
const draftData3: Section3DataType[] = [];

// Submitted: Added more details
const submittedData1: Section1DataType[] = [
    {
        key: '1', no: 1, objectives: 'Develop new module', actionPlan: 'Coding and Testing', kpi: 'Complete module with 0 bugs', weight: '50', midYearReview: '', selfEvaluation: 0, yearEndReview: 0, justification: ''
    },
    {
        key: '2', no: 2, objectives: 'Improve Performance', actionPlan: 'Optimize DB', kpi: 'Reduce load time by 20%', weight: '50', midYearReview: '', selfEvaluation: 0, yearEndReview: 0, justification: ''
    }
];
const submittedData2: Section2DataType[] = [
    {
        key: '1', no: 1, objectives: 'Teamwork', actionPlan: 'Support peers', kpi: 'Feedback', weight: '30', startDate: 'Jan', dueDate: 'Dec', midYearReview: '', selfEvaluation: 0, yearEndReview: 0, justification: ''
    }
];

// Review: LM updates or comments (simulated by same data for now, but in read-only or different state)
const reviewData1 = submittedData1; // In real app, might have comments or adjustments
const reviewData2 = submittedData2;


const IPODetail: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(2); // Default to current state

    // Determine data based on step for preview
    const getStepData = (step: number) => {
        switch (step) {
            case 0: // Draft
                return { s1: draftData1, s2: draftData2, s3: draftData3, readOnly: true };
            case 1: // Submitted
                return { s1: submittedData1, s2: submittedData2, s3: draftData3, readOnly: true };
            case 2: // Review (Current)
                // Current state is editable for the reviewer
                return { s1: reviewData1, s2: reviewData2, s3: draftData3, readOnly: false };
            case 3: // Approved
                return { s1: reviewData1, s2: reviewData2, s3: draftData3, readOnly: true };
            default:
                return { s1: [], s2: [], s3: [], readOnly: true };
        }
    };

    const { s1, s2, s3, readOnly } = getStepData(currentStep);

    const basicInfo = {
        employeeId: "002330",
        employeeName: "Pheun Reach",
        position: "Senior Developer, Application Development",
        company: "OFL",
        function: "ICT",
        subFunction: "Application Development",
        fmName: "KAUV Seth Pisal",
        subFmName: "KHOM Thol"
    };

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%', }}>

            {/* Workflow Steps */}
            <Card size="small">
                <Steps
                    current={currentStep}
                    size="small"
                    onChange={setCurrentStep} // Allow clicking steps
                    // type="navigation"
                    className="site-navigation-steps"
                    items={[
                        {
                            title: "Draft",
                            // description: "Employee",
                            icon: <UserOutlined />,
                            status: currentStep === 0 ? 'process' : 'wait'
                        },
                        {
                            title: "Submitted",
                            // description: "Employee",
                            icon: <FileDoneOutlined />,
                            status: currentStep === 1 ? 'process' : 'wait'
                        },
                        {
                            title: "Line Manager Review",
                            // description: "Manager",
                            icon: <SolutionOutlined />,
                            status: currentStep === 2 ? 'process' : 'wait'
                        },
                        {
                            title: "Approved",
                            // description: "Final",
                            icon: <CheckCircleOutlined />,
                            status: currentStep === 3 ? 'process' : 'wait'
                        }
                    ]}
                />
            </Card>

            {/* Main Content Areas */}
            <Flex gap={16} align="start" wrap="wrap">

                {/* Left Side - Forms */}
                <div style={{ flex: 1, minWidth: '600px' }}>
                    {/* <Card size="small" title="IPO Detail"> */}
                    <Flex vertical gap={24}>
                        <IPOHeaderForm basiceInfo={basicInfo} />
                        <SectionForm data={s1} readOnly={readOnly} />
                        <Section2Form data={s2} readOnly={true} />
                        <Section3Form data={s3} readOnly={readOnly} />
                    </Flex>
                    {/* </Card> */}
                </div>

                {/* Right Side - Activity Logs & Actions */}

            </Flex>
        </Space>
    );
};

export default IPODetail;
