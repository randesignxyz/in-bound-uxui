import { UserOutlined, SolutionOutlined, LoadingOutlined, SmileOutlined } from "@ant-design/icons"
import { Steps } from "antd"


export default () => {

    return (
        <>
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
        </>
    )
}