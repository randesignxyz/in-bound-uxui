import { WarningOutlined } from "@ant-design/icons"
import { PageLoading } from "@ant-design/pro-components"
import { Empty, Flex, Spin, Typography } from "antd"
import { useEffect, useState } from "react"
import { useAccess, history } from "umi"

export default () => {

    const access = useAccess()
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (access.canAccessTaskListMenu) {
            history.push("task-list")
        } else if (access.canAccessCrmMenuItem) {
            history.push("crm")
        }
        else if (access.canAccessProMenuItem) {
            history.push("pro")
        }
        else if (access.canAccesDeliveyMenu) {
            history.push("delivery")
        }
        else if (access.canAccessDeliveryExpenseMenu) {
            history.push("expense/delivery")
        }
        else if (access.canAccessFleetMenu) {
            history.push("fleet")
        }
        else {
            setLoading(false)
        }
    }, [])

    return <Spin spinning={loading}>
        <Empty
            image={Empty.PRESENTED_IMAGE_DEFAULT}
            imageStyle={{ height: 60 }}
            description={
                <span>
                    <Typography.Title level={3} type="warning">
                        Access Denied: You do not have the necessary authorization to access this system.
                    </Typography.Title>
                    <Typography.Title level={5}>
                        Please contact the Information and Communications Technology (ICT) team for support
                    </Typography.Title>
                </span>
            }
        >
            {/* <Button type="primary">Create Now</Button> */}
        </Empty>
    </Spin>
}