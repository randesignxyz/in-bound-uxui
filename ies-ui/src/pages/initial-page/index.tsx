import { Empty, Spin, Typography } from "antd"
import { useEffect, useState } from "react"
import { useAccess, history } from "@umijs/max";

export default () => {

    const access = useAccess()
    const [loading, setLoading] = useState<boolean>(true)
    const redirectList = [
        { access: access.canAccessTaskListMenu, path: './task-list' },
        { access: access.canAccessCrmMenuItem, path: './crm' },
        { access: access.canAccessProMenuItem, path: './pro' },
        { access: access.canAccessHrMenu, path: './hrm' },
        { access: access.canAccesDeliveyMenu, path: './delivery' },
        { access: access.canAccessFleetMenu, path: './fleet' },
        { access: access.canAccessProdMenu, path: './prod' },
        { access: access.canAccessDeliveryExpenseMenu, path: './expense/delivery' },

    ]

    useEffect(() => {
        const path = redirectList.find(it => it.access)?.path
        console.log('+++++++++++++++++ login', path)
        if (path) history.push(path)
        setLoading(false)
    }, [])

    return <Spin spinning={loading}>
        {!loading && <Empty
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
        />}

    </Spin>
}