import { UserOutlined, SolutionOutlined, LoadingOutlined, SmileOutlined } from "@ant-design/icons"
import { ModalForm, ModalFormProps } from "@ant-design/pro-components"
import { Steps } from "antd"

interface Props extends ModalFormProps {
    onCancel:()=>void
}

const ContractWorkFlow: React.FC<Props> = ({onCancel,...props }) => {

    return (
        <>
            <ModalForm
                {...props}
                title="Work Flow  Processing"
                submitter={false}
                width={"1200px"}
                style={{
                    paddingTop:50,
                    height:200,
                }}
                modalProps={{
                    onCancel:onCancel,
                    
                }}
            >
                <Steps
                    items={[
                        {
                            title: 'Login',
                            status: 'finish',
                            icon: <UserOutlined />,
                        },
                        {
                            title: 'Verification',
                            status: 'finish',
                            icon: <SolutionOutlined />,
                        },
                        {
                            title: 'Pay',
                            status: 'process',
                            icon: <LoadingOutlined />,
                        },
                        {
                            title: 'Done',
                            status: 'wait',
                            icon: <SmileOutlined />,
                        },
                    ]}
                />
            </ModalForm>
        </>
    )

}

export default ContractWorkFlow