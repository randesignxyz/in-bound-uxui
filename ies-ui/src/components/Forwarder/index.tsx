import { Spin } from "antd"
import { useEffect, useState } from "react"
import { useAccess, history } from "@umijs/max";

export default () => {

    const access = useAccess()
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (access.canAccessTaskListMenu) {
            history.push("task-list")
        } else {
            setLoading(false)
        }

    }, [])


    return <Spin spinning={loading}>
        Unaccessible
    </Spin>
}