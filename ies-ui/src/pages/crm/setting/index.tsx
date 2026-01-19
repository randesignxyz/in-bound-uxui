import { Tabs } from "antd/lib"
import CustomerProfile from "./CustomerProfile"
import SalespersonProfile from "./SalespersonProfile"

export default () => {

    return (
        <>
            <Tabs
                items={[
                    {
                        key: "Customer Profile Hieracy",
                        label: "Customer Profile Heiracy",
                        children: <CustomerProfile />
                    },
                    {
                        key: "Salesperson Profile Section",
                        label: "Salesperson Profile Section",
                        children: <SalespersonProfile />
                    }
                ]}
            />
        </>
    )
}