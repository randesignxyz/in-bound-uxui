import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { LeadDetail } from "@/services/sale/data";
import { ActionType, ProForm, ProFormSelect, ProFormTextArea, ProTable } from "@ant-design/pro-components"
import { useRef, useState } from "react";
import { LeadServiceAPI } from "./services";
import { simpleRequestActions } from "@/services/model";
import { Card, Checkbox, Flex, Input } from "antd";

interface Props extends FormModalProps {
onSave: (data:number[]) => void
}

const VerificationModalForm: React.FC<Props> = ({ onSave,...props }) => {
    const requestActions = simpleRequestActions();
    const services = LeadServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [searchValue, setSearchValue] = useState('');
    const [split, setSplit] = useState(false);
    const [keySelected, setKeySelected] = useState<number[]>([]);
    const [param, setParam] = useState<{
        empNo?: string
    }>();
    return (
        <>
            <FormModalComp
                {...props}
                title="Verification Form"
                onSubmit={async () => {
                    // const dataForm = await form.validateFields(['saleperson']);
                    // const entry = {
                    //     // salePersonId: dataForm.saleperson,
                    //     customerList: keySelected
                    // }
                    onSave(keySelected);
                }}
            >
                <ProForm submitter={false}>
                    <Flex vertical gap={12}>
                        <Card size="small">
                            <Flex justify="space-between" gap={12}>
                                <ProFormSelect
                                    showSearch
                                    label="Saleperson"
                                    noStyle
                                    placeholder={"Search by Saleperson"}
                                    width={"md"}
                                    onChange={(e: string) => {
                                        setParam({ empNo: e, });
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
                                        setParam({ empNo: e, split });
                                        actionRef.current?.reload?.();
                                    }}
                                />
                                <Checkbox onClick={(e:any) => {
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
                                        advanceSearch:{
                                            isVerified:false
                                        }
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
                                    render: (_, r) => [r.firstName, r.lastName || r.internalName].join(" ")
                                },
                                {
                                    title: "Phone",
                                    render: (_, r) => [r.phone].join(" ")
                                },
                                // {
                                //     title: "Region",
                                //     render: (_, r) => r.region?.name
                                // },
                                {
                                    title: "Current Salperson",
                                    render: (_, r) => [r.salesperson?.salespersonCode, r.salesperson?.salespersonName].filter(p => p).join("  ")
                                },
                            ]}
                        />
                        <ProFormTextArea
                            name="remark"
                        />
                    </Flex>
                </ProForm>
            </FormModalComp>

        </>
    )
}

export default VerificationModalForm