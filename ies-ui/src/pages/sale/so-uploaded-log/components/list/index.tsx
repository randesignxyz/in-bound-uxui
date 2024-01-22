import TableView from "@/components/DataCrud/TableView"
import { simpleRequestActions } from "@/services/model"
import { SoUploadedLog, SoUploadLogAdvSearchParams } from "@/services/sale/data"
import { SaleServiceAPI } from "@/services/sale/services"
import { ActionType } from "@ant-design/pro-table"
import { Radio } from "antd"
import { useRef, useState } from "react"

interface Props { }

const SoUploadedLogListView: React.FC<Props> = ({}) => {

    const actionRef = useRef<ActionType>()
    const [advanceSearchParams, setAdvanceSearchParams] = useState<SoUploadLogAdvSearchParams>({ status: 'Failed' })
    /*************Services************/
    const requestActions = simpleRequestActions()
    const saleServices = SaleServiceAPI(requestActions) 
    /*************State************/
    return (
        <TableView<SoUploadedLog, {searchValue?: string; advanceSearch?: SoUploadLogAdvSearchParams}>
            cache
            advanceSearch
            displayOnly
            tableProps={{
                actionRef: actionRef
            }}
            extraFilter={
                <Radio.Group
                    value={advanceSearchParams.status || 'Posted'}
                    onChange={(e) => {
                        setAdvanceSearchParams((v) => ({
                            ...v,
                            status: e.target.value,
                        }));

                        actionRef.current?.reloadAndRest?.();
                    }}
                >
                    <Radio.Button value="Failed">Failed</Radio.Button>
                    <Radio.Button value="Success">Success</Radio.Button>
                </Radio.Group>
            }
            
            columns={[
                {
                    title: "Log Date",
                    dataIndex: 'createdDate',
                },
                {
                    title: 'Creaed By',
                    dataIndex: 'createdBy',
                },
                {
                    title: 'Mofile Info',
                    dataIndex: 'mobileInfo',
                },
                {
                    title: 'Creaed By',
                    dataIndex: 'createdBy',
                },
                {
                    title: 'Payload',
                    dataIndex: 'payload',
                },
                {
                    title: 'Completed Date',
                    dataIndex: 'completedDate',
                },
                {
                    title: 'Status',
                    dataIndex: 'status'
                },
                {
                    title: 'Trace',
                    dataIndex: 'trace'
                }
            ]}

        />
    )
}

export default SoUploadedLogListView

