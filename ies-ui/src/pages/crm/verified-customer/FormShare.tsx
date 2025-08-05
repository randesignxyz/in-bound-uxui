import { CrmServiceAPI } from "@/services/crm/services"
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDependency, ProFormSelect, ProFormTextArea, ProTable } from "@ant-design/pro-components"
import { Button, Card, Flex, Input, message, Modal } from "antd"
import { SalespersonOrgAPI } from "../salesperson/service"
import { simpleRequestActions } from "@/services/model"
import { SalePerson, CustomerItemLess } from "@/services/crm/data"
import { useForm } from "antd/es/form/Form"
import { rest } from "lodash"
import { useState, useEffect } from "react"
import { CustomerServices } from "../customer/services"
import lead from "@/pages/sale/lead"
import { CustomerWithAddressVerifiedAPI } from "./service"

interface Props {
    type: 'new' | 'edit';
    // id?: number;
    onView: (id?: number) => void;
    onBack: () => void;
    // title: string;
}

type FormDataType = {
    searchSalespersonId: number;
    customers: string;
    salespersonId: number;
}
const FormShare: React.FC<Props> = ({ type, onBack, onView }) => {

    const requestActions = simpleRequestActions();
    const [form] = useForm<FormDataType>()

    const [saleList, setSaleList] = useState<SalePerson[]>()
    const [data, setData] = useState<CustomerItemLess[]>()
    const [customerSearch, setCustomerSearch] = useState<string>()
    const [customerList, setCustomerList] = useState<CustomerItemLess[]>()
    const [selected, setSelected] = useState<any[]>()

    useEffect(() => {
        (async () => {
            const rs = await CustomerServices.listSalesperson.query(requestActions)
            setSaleList(rs)

        })()
        const searchList = customerSearch?.split(",").map(it => it.toLocaleLowerCase().trim().replaceAll(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replaceAll(' ', '')).filter(it => it)
        setCustomerList(data?.filter(it => !customerSearch || searchList?.some(i => [it.code?.toLocaleLowerCase(), it.name?.toLocaleLowerCase()
            .replaceAll(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replaceAll(' ', ''), it.internalName].join().includes(i))))
    }, [data, customerSearch])

    const loadCustomer = async (saleId?: number) => {
        if (!saleId) {
            setData([])
            return
        }
        // const rs = await CustomerServices.listCustomer(saleId).query(requestActions)
        const rs = await CustomerWithAddressVerifiedAPI(requestActions).listCustomerLeadBySE({ id: saleId })
        setData(rs)
    }
    const onSaveActionHandler = async () => {
        const dataForm = await form.validateFields();
        const entry ={
            ...dataForm,
            shareCustomerMap:selected
        }
        
        Modal.confirm({
            title:"Share Confirmation",
            content:"are you sure?",
            onOk:async()=>{
                await CustomerWithAddressVerifiedAPI(requestActions).saveShare(entry);
                message.success("Success!")
            }
        })

    }
    return (
        <>
            <ProForm
                form={form} {...rest} title="Transfer Salesperson" onValuesChange={(changedValues) => {
                    const { searchSalespersonId, customers } = changedValues
                    if ('searchSalespersonId' in changedValues) {
                        loadCustomer(searchSalespersonId)
                    }
                }}
                submitter={{
                    render: () => {
                        return (
                            <FooterToolbar
                                portalDom={false}
                            >
                                {type === 'new' && (
                                    <Button
                                        onClick={() => {
                                            form.resetFields();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}

                                {type === 'edit' && (
                                    <Button
                                        onClick={() => {
                                            form.resetFields();
                                            onView?.(lead?.id)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                {type === 'edit' && (
                                    <Button
                                        onClick={() => {
                                            form.resetFields();
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                                {type === 'new' && (
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            onSaveActionHandler();
                                        }}
                                    >
                                        Save & Add New
                                    </Button>
                                )}
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        onSaveActionHandler();
                                    }}
                                >
                                    {type === 'new' ? 'Save & View' : 'Update'}
                                </Button>
                            </FooterToolbar>
                        );
                    },
                }}
                onFinish={async (formData) => {
                    if (!selected || selected?.length == 0) {
                        message.error("No customer selected.")
                        return
                    }
                    Modal.confirm({
                        title: "Transfer customer",
                        content: "Are you sure?",
                        onOk: async () => {
                            try {
                                await CustomerServices.transfers(formData.salespersonId, selected || [])(requestActions)
                                // rest.onOpenChange?.(false)
                            } catch (error: any) {
                                message.error(error.message || "Failed to transfer")
                            }
                        }
                    })

                }}
            >
                <Flex gap={12} vertical>
                    <Card title={"Share Customer Access Form "} size="small">
                        <Flex gap={24}>
                            <ProFormSelect showSearch name={"searchSalespersonId"} width={"lg"} label="Salesperson"
                                options={saleList?.map(it => ({ label: [it.code, it.name].join(' '), value: it.id }))}
                            />
                            <ProFormSelect
                                name={"entryType"}
                                label={"Type of Customer"}
                                width={"lg"}
                                onChange={async (e) => {
                                    // const rs = await CustomerServices.listCustomer(rs).query(requestActions)
                                }}
                                options={[
                                    {
                                        value: "Direct",
                                        label: "Direct Customer"
                                    },
                                    {
                                        value: "Indirect",
                                        label: "Indirect Customer"
                                    },
                                    {
                                        value: "Prospective",
                                        label: "Prospective Customer"
                                    },
                                    {
                                        value: "Lead",
                                        label: "Lead Customer"
                                    },
                                ]}
                            />
                        </Flex>
                        < ProFormDependency name={['searchSalespersonId']} >
                            {({ searchSalespersonId }) => {
                                if (searchSalespersonId) {
                                    return <Input.Search onSearch={value => setCustomerSearch(value?.trim())} title="Search by Customers" placeholder="Please input customer code(s) to filter" />
                                }
                            }}

                        </ProFormDependency>
                    </Card>
                    <Card size="small">
                        <ProTable<CustomerItemLess> size="small" search={false}
                            rowKey="id"
                            rowSelection={{
                                selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                                selectedRowKeys: selected?.map(o=>o.id),
                                onSelect(item, selected) {
                                    setSelected(prev => {
                                        const safePrev = prev || [];
                                        if (selected) {
                                            return [...safePrev, { id: item.id, type: item.type, code: item.code }];
                                        } else {
                                            return safePrev.filter(it => it.id !== item.id);
                                        }
                                    });
                                    // if (selected) {
                                    //     setSelected(v => ([...(v || []), item.id]))
                                    // } else {
                                    //     setSelected(v => v?.filter(it => it != item.id))
                                    // }
                                },
                                onChange(_, selectedRows, info) {
                                    if (info.type !== 'single') {
                                        setSelected(selectedRows.map(it => ({ id: it.id, type: it.type, code: it.code })))
                                    }
                                },
                            }}
                            pagination={{
                                defaultPageSize: 10,
                            }}
                            options={{
                                density: false,
                                reload: false,
                                setting: false
                            }} columns={[
                                { title: 'Customer Code', dataIndex: 'code' },
                                { title: 'Customer Name', dataIndex: 'name' },
                                { title: 'Customer Name (kh)', dataIndex: 'internalName' },
                                { title: 'Type', dataIndex: 'type' },
                                { title: "SE", dataIndex: 'sale' }
                            ]} dataSource={customerList} loading={requestActions.request?.loading} />
                    </Card>
                    <Card size="small">
                        <ProFormSelect
                            name={"recipientId"}
                            label={"Share To (SE Receiver)"}
                            rules={[{ required: true }]}
                            showSearch
                            debounceTime={500}
                            request={async ({ keyWords }) => {
                                const data = await SalespersonOrgAPI(requestActions).salespersonList();
                                return data?.map(p => ({
                                    value: p.id,
                                    label: `${p.code} - ${p.name}`
                                }))
                            }}
                        />
                        <Flex gap={24}>
                            <ProFormDatePicker
                                name="statedDate"
                                label={"From Date"}
                                width={"md"}
                            />
                            <ProFormDatePicker
                                name="endedDate"
                                label="To Date"
                                width={"md"}
                            />
                        </Flex>

                        <ProFormTextArea
                            name={"remarks"}
                            label="Remarks"
                            placeholder={"Reason for Sharing"}
                        />
                    </Card>
                </Flex>
            </ProForm>
        </>
    )
}

export default FormShare