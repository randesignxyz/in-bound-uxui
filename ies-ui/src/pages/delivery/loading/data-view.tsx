import { formatDateTime } from "@/pages/utils";
import { LoadedInfo, LoadedItemInfo } from "@/services/delivery/data";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-form"
import ProTable from "@ant-design/pro-table";
import { Card, Descriptions } from "antd";

interface Props extends DrawerFormProps {
    data: LoadedInfo;
    
}
const ViewData: React.FC<Props> = ({ data, ...props }) => {

    return <DrawerForm {...props} submitter = {false} >
        <Card size="small" title = "Basic Info">
            <Descriptions>
                <Descriptions.Item label = "Loading Dock"> {data.loadingDock} </Descriptions.Item>
                <Descriptions.Item label = "Driver"> {data.driver.firstName} -  {data.driver.lastName} </Descriptions.Item>
                <Descriptions.Item label = "Truck"> {data.truck.licensePlate} </Descriptions.Item>
                <Descriptions.Item label = "Loading Started"> {formatDateTime(data.loadingStarted)} </Descriptions.Item>
                <Descriptions.Item label = "Loading Ended"> {formatDateTime(data.loadingEnded)} </Descriptions.Item>
                <Descriptions.Item label = "Status"> {data.status} </Descriptions.Item>
            </Descriptions>
        </Card>

        <Card size="small" title = "Loading Item" style={{marginTop: 5}}>
            <ProTable<LoadedItemInfo>
                dataSource={data.items}
                size = 'small'
                search = {false}
                options = {{
                    density: false,
                    fullScreen: false,
                    setting: false,
                    reload: false
                }}
                pagination = {false}
                columns = {[
                    {title: 'Item Code', dataIndex: "itemCode"},
                    {title: 'Item Description', dataIndex: "itemDescription"},
                    {title: 'UoM', dataIndex: "uom"},
                    {title: 'Quantity', dataIndex: "qty"},
                    {title: 'Batch', dataIndex: "batchNum"},
                    {title: 'Warehouse', dataIndex: "whsCode"},
                    {title: 'Loaded Qty', dataIndex: "loadedQty"},
                ]}
                
            />
        </Card>
    </DrawerForm>
}

export default ViewData