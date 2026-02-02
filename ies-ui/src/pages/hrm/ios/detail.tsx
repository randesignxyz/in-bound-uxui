

import React, { useState } from 'react';
import { Card, Steps, Typography, Flex, Space, Spin } from 'antd';
import { UserOutlined, CheckCircleOutlined, FileDoneOutlined, SolutionOutlined } from '@ant-design/icons';
import IPOHeaderForm from "./IOSHeaderForm";
import { useQuery } from '@umijs/max';
import { IOSService } from './service';
import { simpleRequestActions } from '@/services/model';
import Section1Form from './Section1Form';
import Section2Form from './Section2Form';
import Section3Form from './Section3Form';





const IPODetail: React.FC<Props> = ({ id }) => {
    const [currentStep, setCurrentStep] = useState(2); // Default to current state
    // Determine data based on step for preview
    // const getStepData = (step: number) => {
    //     switch (step) {
    //         case 0: // Draft
    //             return { s1: draftData1, s2: draftData2, s3: draftData3, readOnly: true };
    //         case 1: // Submitted
    //             return { s1: submittedData1, s2: submittedData2, s3: draftData3, readOnly: true };
    //         case 2: // Review (Current)
    //             // Current state is editable for the reviewer
    //             return { s1: reviewData1, s2: reviewData2, s3: draftData3, readOnly: false };
    //         case 3: // Approved
    //             return { s1: reviewData1, s2: reviewData2, s3: draftData3, readOnly: true };
    //         default:
    //             return { s1: [], s2: [], s3: [], readOnly: true };
    //     }
    // };

    // const { s1, s2, s3, readOnly } = getStepData(currentStep);


    const requestAction = simpleRequestActions();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['ipo-detail', id],
        queryFn: () => IOSService.detail({ id: id }).query(requestAction),
        refetchOnWindowFocus: false,
    });

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%', }}>
            <Spin spinning={isFetching}>
                {/* Workflow Steps */}
                <Card size="small">
                    <Steps
                        current={
                            data?.activities?.some((o: { action: string; }) => o.action?.trim().toUpperCase() === "DRAFTED") ? 0 :
                                data?.activities?.some((o: { action: string; }) => o.action?.trim().toUpperCase() === "SUBMITTED") ? 1 :
                                    data?.activities?.some((o: { action: string; }) => o.action?.trim().toUpperCase() === "REVIEW") ? 2 :
                                        data?.activities?.some((o: { action: string; }) => o.action?.trim().toUpperCase() === "APPROVED") ? 3 : 0
                        }
                        size="small"
                        // onChange={setCurrentStep} // Allow clicking steps
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
                            <IPOHeaderForm basiceInfo={data?.iosEmpRequest} jobLevel={data?.iosEmpRequest?.jobLevel} />
                            <Section1Form dataSource={data?.section1} readOnly={true} weighTage={data?.iosEmpRequest?.weightage} />
                            <Section2Form dataSource={data?.section2} readOnly={true} weighTage={data?.iosEmpRequest?.weightage} />
                            <Section3Form dataSource={data?.section3} readOnly={true} />
                        </Flex>
                        {/* </Card> */}
                    </div>

                    {/* Right Side - Activity Logs & Actions */}

                </Flex>
            </Spin>
        </Space>
    );
};

export default IPODetail;
