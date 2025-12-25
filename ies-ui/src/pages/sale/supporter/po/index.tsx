import { useQuery } from "@umijs/max"
import { SupporterServiceAPI } from "../services"
import { simpleRequestActions } from "@/services/model"
import { ProColumns, ProTable } from "@ant-design/pro-components"
import { useState } from "react"
import { renderDiffOnly } from "./dynamic_render"
import { Col, Row } from "antd"
import moment from "moment"


const DetailList: React.FC<{ data: any }> = ({ data }) => {

    const columns: ProColumns<any>[] = [
        {
            title: "Changed Data",
            render: (_, record) =>
                renderDiffOnly(record.oldValue, record.newValue),
        },
    ];


    return (
        <ProTable
            size="small"
            headerTitle={moment(data?.createdDate).format("DD-MM-YYYY")}
            columns={columns}
            dataSource={data ? [data] : []}
            pagination={false}
            rowKey="id"
            toolBarRender={false}
            search={false}
        />

    );
};


export default () => {
    const requestActions = simpleRequestActions();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["As"],
        queryFn: () => SupporterServiceAPI(requestActions).page({}),
        refetchOnWindowFocus: false,
        retry: 2
    })
    const [ip, setIp] = useState<any>();

    return (
        <Row gutter={6} style={{ overflow:"hidden" }}>
            <Col span={10}><ProTable
                    options={false}
                    dataSource={data?.items}
                    search={false}
                    rowSelection={{
                        type: "radio",
                        selections: ["SELECT_INVERT"],
                        selectedRowKeys: [ip?.id||data?.items[0]?.id]
                    }}
                    tableAlertRender={false}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                setIp(record)
                            }
                        }
                    }}
                    rowKey={"id"}
                    columns={[
                        {
                            title: "PO Code",
                            render: (_, r) => r?.entry?.purchaseOrderCode
                        },
                        {
                            title: "Type",
                            dataIndex: "changeType"
                        },
                        {
                            title: "Issue By",
                            dataIndex: "createdBy"
                        },
                    ]}
                />
            </Col>
            <Col span={14}>
              <DetailList data={ip || data?.items?.[0]} />
            </Col>
        </Row>
        
    )
}