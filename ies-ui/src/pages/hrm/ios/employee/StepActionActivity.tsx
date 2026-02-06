import item from "@/pages/fma-stock/item";
import { UserOutlined, FileDoneOutlined, SolutionOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { useState } from "react";


interface Props {
    employeeName: string,
    stepItems?: {
        current: number,
        items?: string[]
    }
}

const StepActionActivity: React.FC<Props> = ({ stepItems, employeeName }) => {
    // const [currentStep, setCurrentStep] = useState(curentStep);
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
    return (
        <>
            <Card size="small">
                <Steps
                    current={stepItems?.current ?? 0}
                    size="small"
                    // onChange={c} // Allow clicking steps
                    // type="navigation"

                    className="site-navigation-steps"
                    items={stepItems?.items?.map((item, index) => {
                        return {
                            title: item,
                            // description: "Employee",
                            // icon: <UserOutlined />,
                            // status: currentStep === 0 ? 'process' : 'wait'
                        }
                    })}
                // items={[
                //     {
                //         title: "Employee - " + employeeName,
                //         // description: "Employee",
                //         // icon: <UserOutlined />,
                //         // status: currentStep === 0 ? 'process' : 'wait'
                //     },
                //     {
                //         title: "LM 1 - Srey Leak",
                //         // description: "Employee",
                //         // icon: <SolutionOutlined />,
                //         // status: currentStep === 1 ? 'process' : 'wait'
                //     },
                //     {
                //         title: "LM 2 - Srey Leak",
                //         // description: "Manager",
                //         // icon: <SolutionOutlined />,
                //         // status: currentStep === 2 ? 'process' : 'wait'
                //     },
                //     {
                //         title: "Completed",
                //         // description: "Final",
                //         // icon: <CheckCircleOutlined />,
                //         // icon: <SolutionOutlined />,
                //         // status: currentStep === 3 ? 'process' : 'wait'
                //     }
                // ]}
                />
            </Card>
        </>
    )
}

export default StepActionActivity