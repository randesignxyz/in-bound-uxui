import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { simpleRequestActions } from "@/services/model";
import { ActionType, ProForm, ProFormSelect, ProTable } from "@ant-design/pro-components";
import { Card, Flex, Input, Table } from "antd";
import { LeadServiceAPI } from "./services";
import { useEffect, useRef, useState } from "react";
import { LeadDetail } from "@/services/sale/data";
import { useForm } from "antd/es/form/Form";
import { UpdateCustomerOwnerEntry } from "./data";

interface Props extends FormModalProps {
    onSave: (data: UpdateCustomerOwnerEntry) => void
}

const ChangeSalepersonForm: React.FC<Props> = ({ onSave, ...props }) => {
    const requestActions = simpleRequestActions();
    const services = LeadServiceAPI(requestActions);
    const [form] = useForm<{ customer?: number, saleperson: string }>();
    const [dataSource, setDataSource] = useState<LeadDetail[]>([]);
    const [keySelected, setKeySelected] = useState<number[]>([]);
    const actionRef = useRef<ActionType>();
    const [param, setParam] = useState<{
        empNo?: string
    }>();
    useEffect(() => {
        props.open && form.resetFields();
        props.open && setDataSource([]);
        props.open && setKeySelected([]);
    }, [props.open]);

    return (
        <FormModalComp
            {...props}
            width="800px"
            title="Change Saleperson"
            onSubmit={async () => {
                const dataForm = await form.validateFields(['saleperson']);
                const entry = {
                    salePersonId: dataForm.saleperson,
                    customerList: keySelected
                }
                onSave(entry);
            }}
        >
            <ProForm submitter={false} form={form}>
                <Flex vertical gap={12}>
                    <Card size="small">
                        <Flex justify="space-between" gap={23}>
                            <ProFormSelect
                                showSearch
                                label="Saleperson"
                                noStyle
                                placeholder={"Please Selecte Saleperson"}
                                width={"md"}
                                onChange={(e: string) => {
                                    setParam({ empNo: e });
                                    actionRef.current?.reload();
                                }}
                                rules={[
                                    { required: true }
                                ]}
                                params={param}
                                request={async ({ keyWords }) => {
                                    const data = await services.saleperson()
                                    return data.map(p => ({
                                        label: [p.salespersonCode, p.salespersonName].filter(o => o).join("  "),
                                        value: p.salespersonCode
                                    }))
                                }}
                            />
                            <Input.Search
                                placeholder={"Please input lead code to filter"}
                                onSearch={(e) => {
                                    setParam({ empNo: e });
                                    actionRef.current?.reload?.();
                                }}
                            />
                        </Flex>
                    </Card>
                    <Card
                        size="small"
                        styles={{
                            body: { padding: "10px 0" }
                        }}
                    >
                        <ProTable<LeadDetail>
                            search={false}
                            size="small"
                            options={false}
                            rowSelection={{
                                selectedRowKeys: keySelected,
                                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                                onSelect(item, selected) {
                                    if (selected) {
                                        setKeySelected(v => ([...(v || []), item.id]))
                                    } else {
                                        setKeySelected(v => v?.filter(it => it != item.id))
                                    }
                                },
                                onChange(_, selectedRows, {type}) {
                                    if (type !== 'single') {
                                        setKeySelected(selectedRows.map(it => it.id))
                                    }
                                    // else if (type === 'all') {
                                    //     setKeySelected(p => {
                                    //         const s= [...p, ...selectedRows.map(o=>o.id)];
                                    //         return Array.from(new Set(s))
                                    //     });
                                    // }
                                    // else if(type =='none'){
                                    //     setKeySelected(selectedRows.map(o=>o.id));
                                    // }
                                    // else if (type =="invert"){
                                    //     setKeySelected([])
                                    // }
                                    // else if
                                },
                            }}
                            rowKey={"id"}
                            actionRef={actionRef}
                            request={async ({ keyword, pageSize, current }) => {
                                const data = await LeadServiceAPI(requestActions).listLead({
                                    criteria: {
                                        searchValue: keyword || param?.empNo,
                                    },
                                    pagination: {
                                        current: current,
                                        pageSize: pageSize
                                    }
                                });
                                return Promise.resolve({
                                    data: data.items,
                                    sucess: true,
                                    total: data.total
                                })
                            }}
                            columns={[
                                {
                                    title: "Lead Name",
                                    render: (_, r) => [r.firstName, r.lastName || r.internalName]
                                },
                                {
                                    title: "Phone",
                                    render: (_, r) => [r.phone].join(" ")
                                },
                                {
                                    title: "region",
                                    render: (_, r) => r.region?.name
                                },
                                {
                                    title: "Current Salperson",
                                    render: (_, r) => [r.salesperson?.salespersonCode, r.salesperson?.salespersonName].filter(p => p).join("  ")
                                },
                            ]}
                        />

                    </Card>
                    <Card
                        size="small"
                    >
                        <ProFormSelect
                            showSearch
                            name={"saleperson"}
                            label="Transfer To Saleperson"
                            width={"md"}
                            rules={[
                                { required: true }
                            ]}
                            request={async ({ keyWords }) => {
                                const data = await services.saleperson()
                                return data.map(p => ({
                                    label: [p.salespersonCode, p.salespersonName].filter(o => o).join("  "),
                                    value: p.salespersonCode
                                }))
                            }}
                        />
                    </Card>
                </Flex>
            </ProForm>
        </FormModalComp>
    )
}

export default ChangeSalepersonForm