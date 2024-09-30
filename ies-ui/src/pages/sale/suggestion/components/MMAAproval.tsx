import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { CrmServiceAPI } from "@/services/crm/services";
import { simpleRequestActions } from "@/services/model";
import { EditableProTable, ProDescriptions, ProForm, ProFormSelect } from "@ant-design/pro-components"
import { Alert } from "antd";
import { useForm } from "antd/es/form/Form"
import { useState } from "react";
import { DistributorCreate } from "../../mpu/request/data";
import { PurchaseOrderServiceAPI } from "../../mpu/purchase_order/services";
import { PurChaseRequestAPIService } from "../../mpu/request/service";


interface Props extends FormModalProps {

}

interface MMAEntry {
    id: number;
    customer: string;
    customerCod: string;
    item: any[];
}

const MMAApproval: React.FC<Props> = ({ ...props }) => {
    const [form] = useForm<MMAEntry>();
    const requestActions = simpleRequestActions();
    const [distributor, setDistributor] = useState<DistributorCreate>();

    return (
        <>
            <FormModalComp
                {...props}
            >
                <ProForm
                    form={form}
                    layout="horizontal"
                >
                    <Alert
                        type="info"
                        banner
                        description={
                            <ProDescriptions
                                // dataSource={data}
                                contentStyle={{
                                    fontWeight: 500
                                }}
                                columns={[
                                    {
                                        title: "Store Name",
                                        // render: (_, r) => <Typography.Text type='success'>{r.stockName}</Typography.Text>
                                    },
                                    {
                                        title: "Requested Date",
                                        dataIndex: "requestedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "	Request By",
                                        dataIndex: "owner"
                                    },
                                    {
                                        title: "Serial #",
                                        dataIndex: "referenceNo"
                                    },
                                    {
                                        title: "	Approved Date",
                                        dataIndex: "approvedDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Approved By",
                                        dataIndex: "approvedBy"
                                    },
                                    {
                                        title: "Plate Number",
                                        dataIndex: "plateNumber"
                                    },
                                    {
                                        title: "Received By",
                                        dataIndex: "receivedBy",
                                    },
                                    {
                                        title: "Status",
                                        dataIndex: "receivedBy",
                                        // render: (_, r) => <Tag color='gold' bordered={false}>{r.status}</Tag>
                                    },
                                    {
                                        title: "Description",
                                        dataIndex: "description"
                                    },
                                ]}
                            />
                        }
                    />
                    <ProFormSelect
                        showSearch
                        debounceTime={500}
                        name={"distributorId"}
                        rules={[
                            { required: true }
                        ]}
                        onChange={async (s: number) => {
                            const y = await CrmServiceAPI(requestActions).findDetailCustomer({ id: s });
                            setDistributor({
                                code: y.code,
                                id: y.id,
                                name: y.name,
                                phone: y.contacts?.[0].phone1,
                                latitude: y?.addressList?.[0]?.latitude,
                                longitude: y?.addressList?.[0]?.longitude
                            });
                        }}
                        label={"Distributor"}
                        request={async (k: { keyWords: string }) => {
                            // const data = await CrmServiceAPI(requestActions).findAllCustomer({
                            //   searchValue: k.keyWords
                            // });
                            const data = await PurChaseRequestAPIService(requestActions).customerDistributor({
                                criteria: {
                                    searchValue: ""
                                }
                            })
                            return data.items.map(p => ({ value: p.id, label: p.name }));
                        }}
                    />

                    <EditableProTable
                        columns={[
                            {
                                title: "Item Code",
                                dataIndex: ""
                            },
                            {
                                title: "Item Name",
                                dataIndex: ""
                            },
                            {
                                title: "Qty",
                                dataIndex: ""
                            },
                            {
                                title: "Unit price",
                                dataIndex: ""
                            },
                            {
                                title: "Total Price",
                                dataIndex: ""
                            },
                        ]}
                    />
                </ProForm>
            </FormModalComp>
        </>
    )
}


export default MMAApproval