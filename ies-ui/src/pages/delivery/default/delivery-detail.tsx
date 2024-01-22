import { formatDateTime, formatter } from "@/pages/utils";
import { DeliveryInfo, DeliveryNoteDetail, FreightDetail } from "@/services/delivery/data";
import { AimOutlined } from "@ant-design/icons";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-form";
import ProList from "@ant-design/pro-list";
import { Card, Descriptions, Divider, Table } from "antd";
import { ReactText, useState } from "react";

interface Props extends DrawerFormProps {
  data: DeliveryInfo
}

const DeliveryDetailView: React.FC<Props> = ({data, ...rest}) => {

  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly ReactText[]>([]);
    return (
        <DrawerForm title = "Delivery Detail" submitter = {false} {...rest}>
          <Card size="small" title = "Info" >
            {/* <Descriptions column={3}>
              
                <Descriptions.Item label = "Driver"> {data.deliveryInfo.deliveredBy} </Descriptions.Item>
                <Descriptions.Item label = "Truck"> { data.deliveryInfo.truck?.licensePlate} </Descriptions.Item>
                <Descriptions.Item label = "Delivery Started"> { data.deliveryInfo.startedDate &&  formatDateTime(data.deliveryInfo.startedDate)} </Descriptions.Item>
                <Descriptions.Item label = "Delivery Ended"> { data.deliveryInfo.finishedDate && formatDateTime(data.deliveryInfo.finishedDate)} </Descriptions.Item>
                <Descriptions.Item label = "Status"> {data.deliveryInfo.status} </Descriptions.Item>
            </Descriptions> */}
          </Card>

          <Card size="small" title="Freights" style={{marginTop: 5}}>
            <ProList<FreightDetail>
              
              dataSource={data.deliveryInfo.freights}
              expandable={{ expandedRowKeys, onExpandedRowsChange: setExpandedRowKeys }}
              metas = {{
                avatar:{
                  render: () => <AimOutlined />
                },
                title: {
                  render: (_,r) => r.shippingAddress.shipToCode
                },
                subTitle: {
                  render: (_, r) => [r.customerCode, r.customerName].join(" ")
                },

                description: {
                  render: (_,r) => (<>
                    
                      {r.deliveryNotes.map(it => {
                        return <Table<DeliveryNoteDetail> 
                        pagination = {false}
                        size = "small"
                        title={ () => `DN: ${it.docNum}`}
                        dataSource = {it.items}
                        columns = {[
                          {title: "Item Code", dataIndex: 'itemCode'},
                          {title: 'Item Desc', dataIndex: 'itemDescription'},
                          {title: 'UoM', dataIndex: 'uomCode'},
                          {title: 'Qty', dataIndex: 'qty'}
                        ]}
                        />
                      } )}
                   {r.invoices.length>0 && <Divider plain/>}
                   {r.invoices.length>0 && <Table 
                    size = "small"
                    pagination = {false}
                    title={ () => `Invoices`}
                    dataSource = {r.invoices}
                    columns = {[
                      {title: 'Invoice Num', dataIndex: 'invoiceNum'},
                      {title: "Amount", render: (_,r ) => formatter.format(r.invoiceAmount)}
                    ]}
                   />}
                  </>)
                }
              }}
            />
          </Card>
        </DrawerForm>
      );
}

export default DeliveryDetailView