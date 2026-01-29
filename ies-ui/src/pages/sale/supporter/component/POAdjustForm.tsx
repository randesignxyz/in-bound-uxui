import { EditableProTable, ModalForm, ModalFormProps, ProFormCheckbox, ProFormDatePicker, ProFormDependency, ProFormDigit, ProFormList, ProFormMoney, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Alert, Button, Card, Divider, Flex, Form, message, Space } from "antd";
import { useForm } from "antd/es/form/Form"
import { PurchaseOrderServiceAPI } from "../../mpu/purchase_order/services";
import { simpleRequestActions } from "@/services/model";
import { SupporterServiceAPI } from "../services";
import { useEffect, useState } from "react";
import RemoteSelectBox from "@/components/RemoteSelectBox";
import { CrmService, CrmServiceAPI } from "@/services/crm/services";
import { CustomerLookup } from "@/services/sale/data";
import { AimOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { AddressInfo } from '@/services/crm/data';

interface Props extends ModalFormProps {
    actionType?: string;
    onClose: () => void
}
const typeOption = [
    {
        value: "PO_ROLLBACK",
        label: "Rollback Date",
        description: "Revert the purchase order to a previous transaction date."
    },
    {
        value: "PO_CHANGE_ITEM",
        label: "Change Item",
        description: "Adjust the item in the purchase order."
    },
    // {
    //     value: "CHANGE_ITEM_PRICE",
    //     label: "Change Price",
    //     description: "Update or correct the item pricing in the purchase order."
    // },
    // {
    //     value: "REJECT_ITEM",
    //     label: "Reject Item",
    //     description: "Mark the item as rejected and exclude it from the purchase order."
    // }
];


const getAddress = (address?: AddressInfo) => {
    return address
        ? [
            { name: 'Street', value: address?.streetNo },
            { name: 'House#', value: address?.houseNo },
            { name: 'Village', value: address?.village },
            { name: 'Commune', value: address?.commune },
            { name: 'District', value: address?.district },
            { name: 'Province', value: address?.province },
            { name: 'Latitude', value: address?.latitude },
            { name: 'Longitude', value: address?.longitude },
            { name: 'Direction', value: address?.direction },
            { name: 'Hotspot', value: address?.hotspot },
        ]
            .filter((it) => it.value)
            .map((it) => `${it.name} ${it.value}`)
            .join(', ')
        : '';
};

const POAdjustForm: React.FC<Props> = ({ actionType, onClose, ...props }) => {
    const [form] = useForm<any>();
    const requestActions = simpleRequestActions();


    useEffect(() => {
        props.open && form.resetFields();
    }, [props.open])

    const selectedType = typeOption.find(item => item.value === actionType);
    const [poIdState, setPoIdState] = useState<number>();
    const [addressList, setAddressList] = useState<AddressInfo[]>();
    const onSubmit = async (addNew: Boolean) => {
        const dataForm = await form.validateFields();
        const distributor = dataForm.distributorId?.split(',');
        const entry = {
            ...dataForm,
            distributorId: distributor?.[0],
            distributorCode: distributor?.[1],
            distributorName: distributor?.[2],
            actionType: actionType,
            items: dataForm.items?.map((p: { id: any; itemCode: any; itemId: any; quantity: any; pricing: any; status: any; }) => ({ id: p.id, itemCode: p.itemCode, itemId: p.itemId, qty: p.quantity, price: p.pricing, status: p.status }))
        }
        const res = await SupporterServiceAPI(requestActions).poTodo(entry) as { id: number, message: string };

        if (res?.id == -500) {
            return message.error(res?.message);
        }
        message.success(res.message);
        !addNew && onClose?.();
        addNew && form.resetFields();

    }

    return (
        <>
            <ModalForm
                {...props}
                form={form}
                layout="horizontal"
                title="PO Adjustment & Correction"
                onValuesChange={async (values) => {
                    if (values.distributorId) {
                        const data = await CrmServiceAPI(requestActions).listAddressByCustomer({
                            id: values.distributorId.split(",")[0],
                        });
                        setAddressList(data);

                    }
                    if (values.addressId) {
                        const address = addressList?.find((e) => e.id === values.addressId);
                        const fullAddress = getAddress(address);
                        form.setFieldValue("address", fullAddress);
                        form.setFieldValue("addressCode", address?.address);
                        form.setFieldValue("latitude", address?.latitude);
                        form.setFieldValue("longitude", address?.longitude);
                    }
                    if (values.poId && values.poId !== poIdState) {
                        const dd = await PurchaseOrderServiceAPI(requestActions).detail(values.poId)
                        form.setFieldValue("items", dd.items)
                        form.setFieldValue("date", dd.purchaseOrderDate)
                        form.setFieldValue("currentDistributor", `${dd.distributorCode}-${dd.distributorName}`)
                        form.setFieldValue("currentAddress", dd.addressCode)
                        form.setFieldValue("currentAddressDetail", dd.address)
                    }
                }}
                // onFinish={async () => {
                //     const dataForm = await form.validateFields();
                //     const distributor = dataForm.distributorId?.split(',');
                //     const entry = {
                //         ...dataForm,
                //         distributorId: distributor?.[0],
                //         distributorCode: distributor?.[1],
                //         distributorName: distributor?.[2],
                //         actionType: actionType,
                //         items: dataForm.items?.map((p: { id: any; itemCode: any; itemId: any; quantity: any; pricing: any; status: any; }) => ({ id: p.id, itemCode: p.itemCode, itemId: p.itemId, qty: p.quantity, price: p.pricing, status: p.status }))
                //     }

                //     onSubmit(entry)
                // }}

                submitter={{
                    searchConfig: {
                        submitText: "Save"
                    },
                    submitButtonProps: {
                        onClick: () => {
                            onSubmit(false)
                        }
                    },
                    render: (props, defaultDoms) => {
                        return [
                            ...defaultDoms,
                            <Button
                                key="saveAndNew"
                                type="primary"
                                onClick={() => {
                                    onSubmit(true)
                                }}
                            >
                                Save & New
                            </Button>,
                        ];
                    },
                }}
            >
                <Alert
                    title={selectedType?.label}
                    description={selectedType?.description}
                    type="warning"
                    closable
                />
                <ProFormSelect
                    label={"PO"}
                    name={"poId"}
                    showSearch
                    rules={[{ required: true }]}
                    request={async ({ keyWords }) => {
                        const data = await PurchaseOrderServiceAPI(requestActions).page({
                            criteria: {
                                searchValue: keyWords,
                            }
                        });

                        return data.items.map((o) => ({
                            label: [o.purchaseOrderCode, o.distributorCode, o.assignedTo].filter(p => p).join("/"),
                            value: o.id
                        }))
                    }}
                />

                {
                    (actionType == "PO_ROLLBACK" && (
                        <Flex vertical>
                            <ProFormSwitch name={"toPending"} label="Rollback Status to Pending" />
                            <ProFormDatePicker name={"date"} label={"Date Change"} />
                            
                            <Flex justify="space-between" gap={12}>
                                <Card style={{ width: "50%" }} title="Current Distributor" size="small" >
                                    <Space direction="vertical">
                                        <ProFormSelect readonly noStyle name={"currentDistributor"} />
                                        <ProFormSelect readonly noStyle name={"currentAddress"} />
                                        <ProFormSelect readonly noStyle name={"currentAddressDetail"} />
                                    </Space>
                                </Card>
                                <ArrowRightOutlined />
                                <Card style={{ width: "50%" }} title="New Distributor" size="small">
                                    <Space direction="vertical">
                                        <Form.Item
                                            help={<span />}
                                            name="distributorId"
                                            label="Source Of Supply"
                                            rules={[{ required: true }]}
                                            labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
                                        >
                                            <RemoteSelectBox<CustomerLookup, { searchValue: any }>
                                                width={'285px'}
                                                transforms={{
                                                    onCriteria: (value) => {
                                                        return { searchValue: value };
                                                    },
                                                    onOptionData: (item) => {
                                                        return {
                                                            value: [item.id, item.code, item.name].join(','),
                                                            label: [item.code, item.name].filter((it) => it !== null).join(' - '),
                                                        };
                                                    },
                                                }}
                                                service={CrmService('search-basic-customer')}
                                            />
                                        </Form.Item>
                                        <ProFormSelect
                                            name={'addressId'}
                                            label="Address"
                                            labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
                                            allowClear={false}
                                            key={'address'}
                                            showSearch
                                            rules={[{ required: true }]}
                                            options={addressList?.map((item) => {
                                                return {
                                                    value: item.customerAddressId,
                                                    label: item.address,
                                                };
                                            })}
                                        />

                                        <ProFormText
                                            readonly
                                            hidden
                                            name="addressCode"
                                        />
                                        <ProFormText hidden name={"latitude"} />
                                        <ProFormText hidden name={"longitude"} />
                                        <ProFormTextArea
                                            readonly
                                            //help={<AimOutlined />}
                                            label={<AimOutlined />}
                                            disabled={true}
                                            name="address"
                                        />
                                    </Space>
                                </Card>
                            </Flex>                                
                        </Flex>
                    )) ||
                    actionType === "PO_CHANGE_ITEM" && (
                        <EditableProTable
                            rowKey="id"
                            name="items"
                            recordCreatorProps={false}
                            size="small"
                            editable={{
                                type: 'multiple',
                                editableKeys: form.getFieldValue("items")?.map((p: { id: any; }) => p.id) || [],
                                onValuesChange: (_, recordList) => {
                                    form.setFieldValue("items", recordList);
                                },
                            }}
                            columns={[
                                {
                                    editable: false,
                                    title: "Product",
                                    render: (_, r) => `${r.itemCode || ""} - ${r.itemName || ""}`,
                                },
                                {
                                    title: "Quantity",
                                    dataIndex: "quantity",
                                    width: 120
                                },
                                {
                                    title: "Price",
                                    dataIndex: "pricing",
                                    width: 120
                                },
                                {
                                    title: "Status",
                                    dataIndex: "status",
                                    valueType: "select",
                                    valueEnum: {
                                        Loaded: { text: "Loaded" },
                                        Rejected: { text: "Rejected" },
                                    },
                                    editable: (text, record) => {
                                        return record.status !== "Rejected";
                                    },

                                }

                                // {
                                //     title: "Rejected",
                                //     dataIndex: "status",
                                //     valueType: "select",
                                //     valueEnum: {
                                //         Loaded: { text: "Loaded" },
                                //         Rejected: { text: "Rejected" }
                                //     },
                                // },

                            ]}
                        />
                    )

                }

                <Divider />
                <ProFormTextArea
                    name="remark"
                    label="Remarks"
                    rules={[{ required: true }]}
                />

            </ModalForm>
        </>
    )
}

export default POAdjustForm