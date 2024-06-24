import { ProCard, ProTable } from "@ant-design/pro-components";
import { StockRequestDetailResponse } from "../data.types";
import { Checkbox, Descriptions, Divider } from "antd";
import { formatDate, formatDateTime } from "@/pages/utils";

interface Props {
    data?: StockRequestDetailResponse;
}
  
export default ({ data }: Props) => {
    return <ProCard>
        <Descriptions>
            <Descriptions.Item label="From No" style={{ fontWeight: 'bolder' }}>
                {data?.formNo}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Date">
                {data?.requestedDate && formatDateTime(data?.requestedDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
                {data?.createdDate && formatDateTime(data?.createdDate)}
            </Descriptions.Item>
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Group">
                {data?.groupName}{' '}
            </Descriptions.Item>    
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Reason">{data?.reason} </Descriptions.Item>       
            <Descriptions.Item label="Created By">{data?.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Remark">{data?.remarks}</Descriptions.Item>                
            {data?.lastModifiedDate && (
                <Descriptions.Item label="Last Modified Date">
                {formatDateTime(data?.lastModifiedDate)}
                </Descriptions.Item>
            )}
            {data?.lastModifiedBy && (
                <Descriptions.Item label="Last Modified By">
                {data?.lastModifiedBy}
                </Descriptions.Item>
            )}
        </Descriptions>
        <Divider />
        <ProTable
            search={false}  
            cardProps={false}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            dataSource={data?.items}
            columns={[
                {
                    title:'No',
                    dataIndex:'seqNo',
                    width: 50
                },
                {
                    title:'Item Code',
                    dataIndex:'itemCode'
                },
                {
                    title:'Item Name',
                    dataIndex:'itemName'

                },
                {
                    title:'Qty',
                    dataIndex:'qty'

                },
                {
                    title:'UoM',
                    dataIndex:'uom'

                },
                {
                    title:'Remarks',
                    dataIndex:'remarks'

                }
            ]}
        />
    </ProCard>
}