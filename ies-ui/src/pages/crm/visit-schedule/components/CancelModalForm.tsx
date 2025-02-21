import { FetchPagingParams } from "@/components/DataCrud/TableView"
import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { CancelMultiVisitScheduleStatusParams, VisitScheduleAdvanceSearchParams } from "@/services/crm/data"
import { CrmServiceAPI } from "@/services/crm/services"
import { simpleRequestActions } from "@/services/model"
import { ProForm, ProFormTextArea, ProTable } from "@ant-design/pro-components"
import { Table } from "antd"
import { useForm } from "antd/lib/form/Form"
import moment from "moment"
import { useEffect, useState } from "react"

interface Props extends FormModalProps {
    filterParam?: FetchPagingParams<VisitScheduleAdvanceSearchParams>,
    onSave:(data:CancelMultiVisitScheduleStatusParams)=>void
}


const CancelModalForm: React.FC<Props> = ({ filterParam, onSave, ...props }) => {
    const requestActions = simpleRequestActions();
    const [rowSelectedIds, setRowSelectedIds] = useState<number[]>();
    const [form] = useForm<CancelMultiVisitScheduleStatusParams>();

    useEffect(()=>{
        props.open && form.resetFields()
    },[props.open])
    return <FormModalComp
        {...props}
        title={"Item Selected Cancel"}

        onSubmit={async() => {
            const dataForm =await  form.validateFields();
            const entry = {
                ...dataForm,
                ids:rowSelectedIds||[]
            }
            onSave(entry);
        }}
        disabled={!rowSelectedIds?.length}
    >
        <ProForm
            submitter={false}
            form={form}
        >
            <ProTable
                options={false}
                size="small"
                params={filterParam}
                rowSelection={{
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    getCheckboxProps:(record)=>{
                        const disableBackDate = moment(record.scheduleDate).isBefore(moment(),"day");
                        return {
                            disabled:(disableBackDate || record.scheduleType =="Manual"),
                        }
                    },
                    onChange: (selectedRowKeys, selectedRows, info) => {
                        setRowSelectedIds(selectedRowKeys.map(o => parseInt(o.toString())));
                    },
                }}
                pagination={{
                    pageSize: 20
                }}
                request={async () => {
                    if(filterParam?.criteria?.status !="PENDING") return Promise
                    const data = await CrmServiceAPI(requestActions).listVisitSchedule({
                        keywords:filterParam?.keywords,
                        criteria: {
                            
                            ...filterParam?.criteria,
                            status: "PENDING",
                        },
                    }, { pageSize: 1000 });
                    return Promise.resolve({
                        data: data.items?.map(o => ({ ...o, key: o.id })),
                        success: true
                    })
                }}
                search={false}
                ghost
                columns={[
                    {
                        title: "Schedule date",
                        dataIndex: "scheduleDate",
                    },
                    {
                        title: "Customer Code",
                        dataIndex: "",
                        render: (_, r) => r?.customer?.code
                    },
                    {
                        title: "Salesperson",
                        render: (_, r) => r.salesperson.name,
                    },
                    {
                        title: "Address",
                        render: (_, r) => r.address.name
                    },
                    {
                        title: "Division",
                        render: (_, r) => r.customer.division
                    },
                    {
                        title: "Created By",
                        dataIndex: 'createdBy'
                    }
                ]}
            />
            <br />
            <ProFormTextArea
                name={"remarks"}
                label="Remark"
            />
        </ProForm>
    </FormModalComp>
}

export default CancelModalForm