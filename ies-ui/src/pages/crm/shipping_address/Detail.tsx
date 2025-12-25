import { simpleRequestActions } from "@/services/model"
import { useQuery } from "@umijs/max"
import { ShippingAddressAPI } from "./services"
import { Card } from "antd";
import { ProDescriptions } from "@ant-design/pro-components";

interface Props {
    id?: number;
    openInTab?: true;
    onBack?: () => void;
    item?:any
}

const ShippingAddressDetail: React.FC<Props> = ({ openInTab, onBack, id, item }) => {
    const requestAction = simpleRequestActions()
    return (
        <>
            <Card
                title={"Information"}
                size="small"
            >
                <ProDescriptions
                
                dataSource={item}
                    columns={[
                        {
                            title:"Shipping Code",
                            dataIndex:"code"
                        },
                        {
                            title:"Customer",
                            dataIndex:"customerCode"
                        },
                        {
                            title:"Address",
                            dataIndex:"addressCode"
                        },
                        {
                            title:"Salesperson Code",
                            render:(_,r)=>r.salesperson?.code
                        },
                        {
                            title:"Salesperson Name",
                            dataIndex:"saleCode",
                             render:(_,r)=>r.salesperson?.name
                        },
                    ]}
                />


            </Card>
        </>
    )
}

export default ShippingAddressDetail

