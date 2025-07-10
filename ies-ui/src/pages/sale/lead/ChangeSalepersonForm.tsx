import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { simpleRequestActions } from "@/services/model";
import { ActionType, ProForm, ProFormCheckbox, ProFormSelect, ProTable } from "@ant-design/pro-components";
import { Card, Checkbox, Flex, Input, Table } from "antd";
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
    const [searchValue, setSearchValue] = useState('');
    const [split, setSplit] = useState(false);

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
                                placeholder={"Search by Saleperson"}
                                width={"md"}
                                onChange={(e: string) => {
                                    setParam({ empNo: e,  });   
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
                                    }));
                                }}
                            />

                            <Input.Search
                                placeholder={"Please input lead code to filter"}
                                onChange={(e) => setSearchValue(e.target.value)}
                                value={searchValue}
                                allowClear
                                onSearch={(e) => {
                                    setParam({ empNo: e,split });
                                    actionRef.current?.reload?.();
                                }}
                            />
                            <Checkbox onClick={(e) => {
                                const checked = e.target?.checked;
                                setSplit(checked);
                                if (checked) {
                                    // transform space-separated to comma-separated
                                    const newValue = searchValue.trim().split(/\s+/).join(',');
                                    setSearchValue(newValue);
                                } else {
                                    // Optionally: transform comma back to space (or keep as is)
                                    const newValue = searchValue.trim().split(/,+/).join(' ');
                                    setSearchValue(newValue);
                                }
                            }}>
                                Split
                            </Checkbox>
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
                                selectedRowKeys: keySelected.filter((value, index, self) => self.indexOf(value) === index).filter(p => p != undefined),
                                onSelect(item, selected) {
                                    if (selected) {
                                        setKeySelected(v => ([...(v || []), item.id]))
                                    } else {
                                        setKeySelected(v => v?.filter(it => it != item.id))
                                    }
                                },
                                onSelectAll: (select, row, changeRow) => {
                                    if (select) {
                                        setKeySelected((v) => [...v, ...row.map(o => o?.id)])
                                    }
                                    else {
                                        const toRemove = changeRow.map(o => o.id);
                                        setKeySelected((v) => {
                                            const d = v.filter(t => !toRemove.includes(t));
                                            return d
                                        })
                                    }
                                },
                                onChange(_, selectedRows, { type },) {
                                    if (type === "none") {
                                        setKeySelected([])
                                    }
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
                                });
                            }}
                            columns={[
                                {
                                    title: "Lead Name",
                                    render: (_, r) => r.leadCode
                                    // render: (_, r) => [r.firstName, r.lastName || r.internalName]
                                },
                                {
                                    title: "Lead Name",
                                    render: (_, r) => [r.firstName, r.lastName || r.internalName]
                                },
                                {
                                    title: "Phone",
                                    render: (_, r) => [r.phone].join(" ")
                                },
                                {
                                    title: "Region",
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