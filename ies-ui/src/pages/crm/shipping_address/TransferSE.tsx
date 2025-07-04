import { CustomerItemLess, SalePerson } from "@/services/crm/data";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProCard, ProFormDependency, ProFormSelect, ProFormText, ProTable } from "@ant-design/pro-components"
import { Input, message, Modal, Space } from "antd"
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { CustomerServices } from "../customer/services";
import { ShippingAddressAPI } from "./services";

type FormDataType = {
    searchSalespersonId: number;
    customers: string;
    salespersonId: number;
}

export default ({ ...rest }: ModalFormProps<FormDataType>) => {

    const requestActions = simpleRequestActions();
    const [form] = useForm<FormDataType>()

    const [saleList, setSaleList] = useState<SalePerson[]>()
    const [data, setData] = useState<CustomerItemLess[]>()
    const [customerSearch, setCustomerSearch] = useState<string>()
    const [customerList, setCustomerList] = useState<CustomerItemLess[]>()
    const [selected, setSelected] = useState<number[]>()

    useEffect(() => {
        if (!rest.open) return
        (async () => {
            const rs = await CustomerServices.listSalesperson.query(requestActions)
            setSaleList(rs)

        })()
        return () => {
            form.resetFields()
            setData([])
            setSelected([])
        }
    }, [rest.open])

    useEffect(() => {
        const searchList = customerSearch?.split(",").map(it => it.toLocaleLowerCase().trim().replaceAll(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replaceAll(' ', '')).filter(it => it)
        setCustomerList(data?.filter(it => !customerSearch || searchList?.some(i => [it.code?.toLocaleLowerCase(), it.name?.toLocaleLowerCase()
            .replaceAll(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').replaceAll(' ', ''), it.internalName].join().includes(i))))
    }, [data, customerSearch])


    const loadCustomer = async (saleId?: number) => {
        if (!saleId) {
            setData([])
            return
        }
        const rs = await ShippingAddressAPI(requestActions).listBySalesperson({id:saleId})
        setData(rs)
    }

    return <ModalForm width={900} form={form} {...rest} title="Transfer Salesperson" onValuesChange={(changedValues) => {
        const { searchSalespersonId, customers } = changedValues
        if ('searchSalespersonId' in changedValues) {
            loadCustomer(searchSalespersonId)
        }
    }} onFinish={async (formData) => {
        if (!selected || selected?.length == 0) {
            message.error("No customer selected.")
            return
        }
        Modal.confirm({
            title: "Transfer customer",
            content: "Are you sure?",
            onOk: async () => {
                try {
                    await ShippingAddressAPI(requestActions).transfer({
                        ...formData,
                        selected
                    })
                    
                    rest.onOpenChange?.(false)
                } catch (error: any) {
                    message.error(error.message || "Failed to transfer")
                }
            }
        })

    }}>

        <Space style={{ width: '100%' }} direction="vertical">

            <ProCard size="small" boxShadow title="Searching">
                <ProFormSelect showSearch name={"searchSalespersonId"} width={"md"} label="Salesperson"
                    options={saleList?.map(it => ({ label: [it.code, it.name].join(' '), value: it.id }))} />
                < ProFormDependency name={['searchSalespersonId']} >
                    {({ searchSalespersonId }) => {

                        if (searchSalespersonId) {
                            return <Input.Search onSearch={value => setCustomerSearch(value?.trim())} title="Search by Customers" placeholder="Please input customer code(s) to filter" />
                        }
                    }}

                </ProFormDependency>
            </ProCard>

            <ProCard size="small" boxShadow>
                <ProTable<CustomerItemLess> size="small" search={false}
                    rowKey="id"
                    rowSelection={{
                        selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                        selectedRowKeys: selected,
                        onSelect(item, selected) {
                            if(selected) {
                                setSelected(v => ([...(v||[]), item.id]))
                            }else {
                                setSelected(v => v?.filter(it => it != item.id))
                            } 
                        },
                        onChange(_, selectedRows, info) {
                            if (info.type !== 'single') {
                                setSelected(selectedRows.map(it => it.id))
                            }
                        },
                    }}
                    options={{
                        density: false,
                        reload: false,
                        setting: false
                    }} columns={[
                        { title: 'Shipping Code', dataIndex: 'code' },
                        { title: 'Customer Code', dataIndex: 'customerCode' },
                        { title: 'Shipping Address', dataIndex: 'addressCode' },
                        // { title: 'Type', dataIndex: 'type' },
                        { title: "SE", dataIndex: 'salesCode' }
                    ]} dataSource={customerList}  loading={requestActions.request?.loading} />
            </ProCard>
            <ProCard size="small" boxShadow >
                <ProFormSelect showSearch name={'salespersonId'} width={"md"} label="Transfer To Salesperson" rules={[{ required: true }]}
                    options={saleList?.map(it => ({ label: [it.code, it.name].join(' '), value: it.id }))} />
            </ProCard>
        </Space>

    </ModalForm>
}