import { simpleRequestActions } from "@/services/model"
import { createService } from "./services"
import { ProCard, ProDescriptions, ProTable } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { NewStaffDetailItem, NewStaffItemDetail } from "./data.types"
import { Checkbox, Space, message } from "antd"
import { formatDate } from "@/pages/utils"

export default ({ processInstaceId }: { processInstaceId: string }) => {
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [dataDetail, setDataDetail] = useState<NewStaffItemDetail>()
    useEffect(() => {
        (async () => {
            try {
                const rs = await services.findByInstId(processInstaceId)
                setDataDetail(rs)
            } catch (error: any) {
                message.error(error.message || "Failed to fetch data.")
            }

        })()
    }, [])


    const renderItem = (title: string, dataSource: NewStaffDetailItem[], footer?: () => React.ReactNode) => {
        return <ProTable headerTitle={title}
            search={false}
            pagination={false}
            options={{
                density: false,
                setting: false,
                reload: false
            }}
            showHeader={false} size="small" dataSource={dataSource}
            footer={() => footer?.()}
            columns={[
                { dataIndex: 'checked', width: 50, render: (_, r) => <Checkbox checked={r.checked} /> },
                { dataIndex: "itemName", width: 300 },
                { dataIndex: "remarks" }
            ]}
        />
    }

    return <Space style={{ width: '100%' }} direction="vertical">
        <ProCard size="small" title="1. Personal Details (Completed by HR)">
            <ProDescriptions<NewStaffItemDetail> dataSource={dataDetail} columns={[
                { title: "Employee Name", dataIndex: 'empName' },
                { title: "Employee Name (KH)", dataIndex: 'empLocalName' },
                { title: "Employee ID", dataIndex: 'empNo' },
                { title: "Gender", dataIndex: 'gender' },
                { title: "Position", dataIndex: 'jobTitle' },
                { title: "BU", dataIndex: 'bu' },
                { title: "Function", dataIndex: 'department' },
                { title: "Joining Date", render: (_, r) => formatDate(r.startingDate) },
                { title: "Base Location", dataIndex: 'workplace' },

            ]} />
        </ProCard>

        {renderItem("2. Workplace arrangement (Initiated by HR, reviewed by hired Function Manager)", dataDetail?.items.filter(it => it.category == 'FMA_WORK_PLACE_ARRANGEMENT') || [])}
        <ProTable headerTitle="3. Uniform (Initiated by HR, reviewed by hired Function Manager)"
            showHeader={false} size="small"
            search={false}
            pagination={false}
            options={{
                density: false,
                setting: false,
                reload: false
            }}
            dataSource={dataDetail?.items.filter(it => it.category == 'FMA_UNIFORM')}
            columns={[
                { dataIndex: 'checked', width: 50, render: (_, r) => <Checkbox checked={r.checked} /> },
                { dataIndex: "itemName", width: 300 },
                { dataIndex: "itemType", width: 70, render: (_, r) => r.checked ? `Size: ${r.itemType || ''}` : '-' },
                { dataIndex: "remarks" }
            ]}
        />

        <ProTable headerTitle="4. Accessories (Initiated by HR, reviewed by hired Function Manager)"
            showHeader={false} size="small"
            search={false}
            pagination={false}
            options={{
                density: false,
                setting: false,
                reload: false
            }}
            dataSource={dataDetail?.items.filter(it => it.category == 'FMA_UNIFORM')}
            columns={[
                { dataIndex: 'checked', width: 50, render: (_, r) => <Checkbox checked={r.checked} /> },
                { dataIndex: "itemName", width: 300 },
                { dataIndex: "itemType", width: 70, render: (_, r) => r.checked ? `Qty: ${r.qty || ''}` : '-' },
                { dataIndex: "remarks" }
            ]}
            footer={() => dataDetail?.items.some(it => it.category == "FMA_ACCESSORY") && <ProDescriptions<NewStaffItemDetail>
                dataSource={dataDetail}

                size="small"
                columns={[
                    { label: "Pheone", dataIndex: 'phoneNo' },
                    { label: 'Email', dataIndex: 'email' }
                ]}
            />}
        />
        {renderItem("5. System car access/Gate Pass (Initiated by HR, reviewed by hired Function Manager)", dataDetail?.items.filter(it => it.category == 'FMA_ACCESS') || [], () => dataDetail?.items.some(it => it.category == "FMA_ACCESS" && it.itemId == 2242) && <ProDescriptions<NewStaffItemDetail>
            dataSource={dataDetail}

            size="small"
            columns={[
                { label: "Car Model", dataIndex: 'carModal' },
                { label: 'Color', dataIndex: 'carColor' },
                { label: 'Year', dataIndex: 'year' },
                { label: 'Plate Number', dataIndex: 'plateNumber' },
            ]}
        />
        )}
    </Space>
}