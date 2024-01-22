import React, { useState, useEffect, useRef } from "react"
import ProTable, { ProColumns, ActionType } from "@ant-design/pro-table"
import { Button, Space, Tag } from "antd"
import { CheckCircleOutlined, DeleteOutlined, PlusOutlined, SelectOutlined, SyncOutlined } from "@ant-design/icons"
import moment, { Moment } from "moment"
import { history } from 'umi';
import { domain } from "@/services/del-expense/data"
import { querySap } from "@/services/shared/queryData"
import { PageContainer, ProCard, ProForm, ProFormDatePicker, ProFormGroup, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { toReadable } from "@/pages/utils"
import Status from "@/components/Status"

const DeliveryListComp: React.FC<{
    initLookupData?: domain.delivery.DeliveryInitLookupData;
    forceUpdate: number;
    onAdd: () => void;
}> = ({ initLookupData, onAdd, forceUpdate }) => {
   
    const actionRef = useRef<ActionType>();
    const [form] = useForm<{ status?: string; settledDate?: Moment, outsource?: String; }>()

    const [forceSearch, setForceSearch] = useState<number>(0)

    useEffect(() => {
        actionRef.current?.reloadAndRest && actionRef.current?.reloadAndRest()
    }, [forceSearch,forceUpdate])


    const searchComp = <ProForm size="small" style={{ marginBottom: '-20px', width:'610px'}} form={form} submitter={false} onValuesChange={(changedValues) => {
        setForceSearch(v => v + 1)
    }} >
        <ProFormGroup size={"small"}>
            <ProFormSelect name={'status'} width={150} options={[
                { label: "Pending", value: "PENDING" },
                { label: "Submitted", value: "SUBMITTED" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Reworked", value: "REWORKED" },
                { label: "Canceled", value: "CANCELED" },
            ]} />
            <ProFormDatePicker.Month width={150} name="settledDate" />
            <ProFormSelect name={'outsource'} width={'sm'} showSearch allowClear options={initLookupData?.outsource?.map(it => ({ label: it.display, value: it.value }))} />
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                Add
            </Button>
        </ProFormGroup>
    </ProForm>

    const gotoView = (id: number) => {
        history.push(`/expense/delivery/view/${id}`)
    }
    const cols: ProColumns<domain.delivery.DeliveryItem>[] = [
        {
            title:'',
            width:'15px',
            render: (_, record) => {                
                return <Space size={0}>
                <Button
                    type="link"  
                    icon={<SelectOutlined/>}                  
                    onClick={async () => {
                      window.open(`./view/${record.id}`, '_blank')?.focus();
                    }}/>
                </Space>
            }
        },
        {
            title: 'Outsource',
            dataIndex: 'outsource',
            hideInSearch: true,
            sorter: 'outsource',
            align: 'left',
            render: (_, record) => {                
                return <Space size={0}>
                <Button
                    type="link" 
                    onClick={async () => { gotoView(record.id)}}                   
                    >{record.outsource}</Button>
                </Space>
            }
        },
        {
            title: 'Settled On',
            dataIndex: 'settledCode',
            sorter: 'settledDate',
            hideInSearch: true,
            width: '150px',
        },

        {
            title: 'Total Amount',
            dataIndex: 'amount',
            hideInSearch: true,
            align: 'right',
            width: '200px',
            render: (_, record) => {
                return record.amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            }

        },
        {
            title: 'Prepared By',
            dataIndex: 'preparedBy',
            sorter: 'preparedBy',
            width: '200px',
            hideInSearch: true,
            align: 'left'
        },

        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            sorter: 'createdDate',
            hideInSearch: true,
            align: 'right',
            width: '150px',
            render: (_, record) => {
                return moment(record.createdDate).format('YYYY-MM-DD')
            }
        },
        {
            title: 'Status',

            // render: (_, r) => <Tag icon={r.status == 'COMPLETED'||'CONFIRMED' ? <CheckCircleOutlined />:r.status == 'CANCELED' ? <DeleteOutlined/> : <SyncOutlined spin />}  color={r.status == 'COMPLETED' || 'CONFIRMED' ? "success": r.status == 'CANCELED' ?'red' : 'processing'}>{toReadable(r.status)}</Tag>,
            render: (_, r) => <Status text={r.status}/>,
            hideInSearch: true,
            // align: 'center',
            width: '150px'
        }
    ]

    return <PageContainer onBack={() => history.back()} breadcrumb={undefined} title="Settlement List" >
        <ProCard bordered>
            <ProTable<domain.delivery.DeliveryItem>
                rowKey="id"
                pagination={{ showSizeChanger: false }}
                actionRef={actionRef}
                request={async (params, sorter) => {
                    const formData = await form.validateFields()
                    return querySap({
                        type: 'query_delivery_settlement',
                        payload: {
                            status: formData.status,
                            settledOn: formData.settledDate,
                            outsourceId: formData.outsource,
                            sorter: sorter
                        },
                        paging: {
                            page: (params.current || 1) - 1,
                            pageSize: params.pageSize || 20

                        }
                    })
                }}

                toolBarRender={() => [searchComp]}
                search={false}
                columns={cols}
                size={'small'}
            />
        </ProCard>
    </PageContainer>
}

export default DeliveryListComp