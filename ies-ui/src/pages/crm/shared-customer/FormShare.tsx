import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDependency, ProFormSelect, ProFormTextArea, ProTable } from "@ant-design/pro-components"
import { Button, Card, Checkbox, Flex, Input, message, Modal, Space } from "antd"
import { SalespersonOrgAPI } from "../salesperson/service"
import { simpleRequestActions } from "@/services/model"
import { SalePerson, CustomerItemLess } from "@/services/crm/data"
import { useForm } from "antd/es/form/Form"
import { rest } from "lodash"
import { useState, useEffect } from "react"
import { CustomerServices } from "../customer/services"
import { ShareCustomerAPI } from "./service"
import { useQuery } from "@umijs/max"

interface Props {
    type: 'new' | 'edit';
    onView: (id?: number) => void;
    onBack: () => void;
}

type FormDataType = {
    searchSalespersonId: number;
    customers: string;
    salespersonId: number;
}
const FormShare: React.FC<Props> = ({ type, onBack, }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<FormDataType>()
    const [customerList, setCustomerList] = useState<CustomerItemLess[]>()
    const [selected, setSelected] = useState<any[]>()
    const [split, setSplit] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const [customerFilter, setCustomerFilter] = useState<any>();
    const { data: sales } = useQuery({
        queryKey: ['salesperson'],
        queryFn: async () => CustomerServices.listSalesperson.query(requestActions),
        refetchOnWindowFocus: false
    });
    const { data: customer, isLoading } = useQuery({
        queryKey: ['customer', customerFilter],
        queryFn: async () => {
            const rs = await ShareCustomerAPI(requestActions).listCustomerLeadBySE({ ids: form.getFieldValue('searchSalespersonId') })
            setCustomerList(rs)
            return rs
        },
        refetchOnWindowFocus: false
    });
    const onSearchValue = (value?: string) => {
        if (!value?.trim()) {
            setCustomerList(customer)
            return
        }
        setCustomerList(customerList?.filter(it => value?.split(',')?.some(i => [it.code?.toLocaleLowerCase()].includes(i.toLocaleLowerCase()))))
    }

    const onSaveActionHandler = async () => {
        const dataForm = await form.validateFields();
        if ((selected?.length || 0) <= 0) {
            message.warning("No customer selected. Please choose one to share.");
            return
        }
        const entry = {
            ...dataForm,
            shareCustomerMap: selected
        }
        Modal.confirm({
            title: "Share Confirmation",
            content: "are you sure?",
            onOk: async () => {
                await ShareCustomerAPI(requestActions).saveShare(entry);
                message.success("Success!");
            }
        });
        onBack?.();
    }
    return (
        <>
            <ProForm
                form={form} {...rest} title="Transfer Salesperson" onValuesChange={(changedValues) => {
                    const { searchSalespersonId } = changedValues
                    if ('searchSalespersonId' in changedValues) {
                        setSelected([])
                        setCustomerFilter({ searchSalespersonId })
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
                                        Save
                                    </Button>
                                )}
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
                            } catch (error: any) {
                                message.error(error.message || "Failed to transfer")
                            }
                        }
                    })
                }}
            >
                <Flex gap={12} vertical>
                    <Card title={"Share Customer Access Form "} size="small">
                        <ProFormSelect
                            showSearch
                            name={"searchSalespersonId"}
                            mode="multiple"
                            label="Salesperson"
                            debounceTime={500}
                            options={sales?.map(it => ({ label: [it.code, it.name].join(' '), value: it.id }))}
                        />

                        < ProFormDependency name={['searchSalespersonId']} >
                            {({ searchSalespersonId }) => {
                                if (searchSalespersonId) {
                                    return (
                                        <Flex gap={12} >
                                            <Input.Search
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                value={searchValue}
                                                onSearch={value => { onSearchValue(value) }}
                                                title="Search by Customers"
                                                placeholder="Please input customer code(s) to filter"
                                                allowClear

                                            />
                                            <Checkbox
                                                disabled={!searchValue}
                                                onClick={(e: any) => {
                                                    const checked = e.target?.checked;
                                                    // setSplit(checked);
                                                    if (checked) {
                                                        // transform space-separated to comma-separated
                                                        const newValue = searchValue?.trim().split(/\s+/).join(',');
                                                        setSearchValue(newValue);
                                                    } else {
                                                        // Optionally: transform comma back to space (or keep as is)
                                                        const newValue = searchValue?.trim().split(/,+/).join(' ');
                                                        setSearchValue(newValue);
                                                    }
                                                }}>
                                                Split
                                            </Checkbox>
                                        </Flex>)
                                }
                            }}
                        </ProFormDependency>
                    </Card>
                    <Card size="small">
                        <ProTable<CustomerItemLess> size="small" search={false}
                            rowKey="id"
                            rowSelection={{
                                selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                                selectedRowKeys: selected?.map(o => o.id),
                                onSelect(item, selected) {
                                    setSelected(prev => {
                                        const safePrev = prev || [];
                                        if (selected) {
                                            return [...safePrev, { id: item.id, type: item.type, code: item.code }];
                                        } else {
                                            return safePrev.filter(it => it.id !== item.id);
                                        }
                                    });
                                },
                                onChange(_, selectedRows, info) {
                                    if (info.type !== 'single') {
                                        setSelected(selectedRows.map(it => ({ id: it.id, type: it.type, code: it.code })))
                                    }
                                },
                            }}
                            pagination={{
                                defaultPageSize: 10,
                                total: customerList?.length,
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
                            ]}
                            dataSource={customerList}
                            loading={isLoading}
                        />
                    </Card>
                    <Card size="small">
                        <ProFormSelect
                            name={"recipientId"}
                            label={"Share To (SE Receiver)"}
                            rules={[{ required: true }]}
                            showSearch
                            onChange={(e) => {
                                if (e == form.getFieldValue("searchSalespersonId")) {
                                    form.resetFields(["recipientId"])
                                    message.warning("This customer is already assigned to the selected salesperson.");
                                }
                            }}
                            debounceTime={500}
                            request={async () => {
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