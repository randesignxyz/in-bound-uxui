import { formatDate } from "@/pages/utils"
import { IncidentListItem } from "@/services/ict/data"
import { SearchOutlined } from "@ant-design/icons"
import { ModalForm, ModalFormProps, ProCard, ProFormDatePicker, ProFormGroup, ProFormItem, ProFormText, ProTable } from "@ant-design/pro-components"
import { Button, Input, message, Space, Spin } from "antd"
import { useForm } from "antd/lib/form/Form"
import { Moment } from "moment"
import { useEffect, useState } from "react"

export default ({ loading, onCompleteTask, onLoadData, ...rest }: ModalFormProps<{
    dateBefore?: Moment,
    searchValue?: string
}> & {
    loading?: boolean,
    onLoadData: (searchValue?: string, date?: Moment) => Promise<IncidentListItem[]>;
    onCompleteTask: (instanceIdList: string[], remarks?: string) => void;
}) => {

    const [data, setData] = useState<IncidentListItem[]>()
    const [selected, setSelected] = useState<number[]>([])
    const [form] = useForm<{
        dateBefore?: Moment,
        searchValue?: string
    }>()

    useEffect(() => {
        if (!rest.open) return
        loadData()
        return () => {
            setSelected([])
            setData([])
            form.resetFields()
        }
    }, [rest.open])


    const loadData = async (searchValue?: string, dateBefore?: Moment) => {
        try {
            const rs = await onLoadData(searchValue, dateBefore)
            setData(rs)
        } catch (error: any) {
            message.error(error?.message || 'Failed to load data.');
        }
    }

    return (
        <ModalForm form={form}
            width={1000}
            title="Clean Sovled Tickets"
            onFinish={ async () => {
                if(selected?.length == 0) {
                    message.error("No item selected.")
                    return
                }
                const list = data?.filter(it => selected.some(it1 => it1 == it.id)).map(it => it.instanceId || '') || []
                onCompleteTask(list )
            } }
            {...rest}>


            <ProTable<IncidentListItem>
                search={false}
                size="small"
                dataSource={data}
                rowKey="id"
                rowSelection={{
                    selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                    selectedRowKeys: selected,
                    onSelect(item, selected) {
                        if (selected) {
                            setSelected(v => ([...(v || []), item.id]))
                        } else {
                            setSelected(v => v?.filter(it => it != item.id))
                        }
                    },
                    onChange(_, selectedRows, info) {
                        
                        if (info.type !== 'single') {
                            setSelected(selectedRows.map(it => it.id))
                        }
                    },
                }}
                headerTitle={<ProFormGroup size={2}>
                    <ProFormDatePicker name={'dateBefore'} placeholder={"Before date"} width={'sm'} />
                    <ProFormText name={'searchValue'} fieldProps={{ prefix: <SearchOutlined /> }} />
                    <Button icon={<SearchOutlined />} onClick={async () => {
                        const dataForm = await form.validateFields()
                        await loadData(dataForm.searchValue, dataForm.dateBefore)
                    }} loading={loading} >Search</Button>
                </ProFormGroup>}
                columns={[
                    { title: 'Ticket No', dataIndex: 'formNo' },
                    { title: 'Reported Date', render: (_, r) => formatDate(r.requestedDate) },
                    { title: 'Resolved Date', render: (_, r) => formatDate(r.requestedDate) },
                    { title: 'Issued Statment', dataIndex: 'symptom' },
                    { title: 'Description', dataIndex: 'description' },
                    { title: 'Reported By', dataIndex: 'requestedBy' },
                    { title: 'Created Date', render: (_, r) => formatDate(r.createdDate) },
                ]}
                options={{
                    density: false,
                    fullScreen: false,
                    reload: false,
                    setting: false,
                }} />

        </ModalForm>
    )
}