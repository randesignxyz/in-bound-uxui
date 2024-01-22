import { ModalProps } from '@/components/core/ModalProps'
import { LookupData } from '@/components/core/comp';
import useExportReport from '@/hooks/useExportReport';
import useLookupData from '@/hooks/useLookupData';
import useLookupMultiData from '@/hooks/useLookupMultiData';
import { SAPServiceType } from '@/services/API';
import { downloadReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { ProForm, ProFormCheckbox, ProFormDateRangePicker, ProFormSelect, ProFormTimePicker } from '@ant-design/pro-components';
import { Button, DatePicker, Form, message, Modal, Select, Spin } from 'antd'
import moment from 'moment';
import React, { useEffect } from 'react'

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

interface DeliveryDetailReportProps extends ModalProps<string, string> { }

const DeliveryDetailReport: React.FC<DeliveryDetailReportProps> = ({
    onHide,
    onCompleted,
    visible,
    item
}) => {

    const requestActions = simpleRequestActions();

    const initData = useLookupMultiData<{
        outsource: LookupData[],
        list_provinces: LookupData[],
        dest_customer: LookupData[],
    }>('SAP', ['outsource', 'dest_customer', 'list_provinces', 'product_type'])

    const download = useExportReport({ name: 'GATEWAY', action: 'delivery_detail_report' } )

    const districts = useLookupData({ name: "SAP", action: 'list_districts' } as SAPServiceType, false)

    const listDistricts = (id?: string) => {
        form.resetFields(['district'])
        if (id)
            districts.load(id.toString())
        else districts.clear()
    }

    const [form] = Form.useForm()

    useEffect(() => {
        reset()
        initData.load()
    }, [visible, item])

    const reset = () => {
        form.resetFields()
        form.setFieldsValue({   
            claimedType: 'all',         
            canceled: 'all'
        })
    }
    const outsourceTyps = [{label:'Outsource - Central',value:'Outsource - Central'},{label:'Outsource - Province',value:'Outsource - Province'}];

    return <Modal
        title="Delivery Detail Report Criteria"
        width={'600px'}
        okText='Export'
        destroyOnClose
        open={visible}
        footer={[
            <Button key="back" onClick={onHide}>
                Cancel
            </Button>,
            <Button key="clear" onClick={() => {
                reset()
            }}>
                Reset
          </Button>,
            <Button key="submit" type="primary" onClick={() => {
                form.validateFields().then(async values => {
                    const { outSourceType, vendor, customerCode, province, district, dateRange,claimedType,canceled } = values
                    const [startDate, endDate] = dateRange
                    const provineName = (initData.data?.list_provinces || []).find(r => r.value=== province)?.display
                    try {
                        return await downloadReport<any>(requestActions)({
                            reportName: 'export-del-expense-report',
                            fileName: `delivery-detail-report-${moment().format()}.xls`,
                            type: 'EXCEL',
                            data: {
                                outSourceType: outSourceType,
                                vendor: vendor,
                                customerCode: customerCode,
                                province: provineName,
                                district: district,
                                dateFrom: startDate,
                                dateTo: endDate,
                                claimedType: claimedType,
                                canceled:canceled
                            }
                        });
                    } catch (error: any) {
                        message.error(error.message || 'Failed to generate report.')
                    }
                    
                })
            }}>
                Export
            </Button>,
        ]}

        onCancel={onHide}>

        <Spin spinning={(initData.loading || download.downloading || (requestActions.request?.loading || false))}>
            <ProForm 
                form={form} {...layout}  
                layout="horizontal"
                submitter={{
                    render: (props, doms) => {return []}
                }}
                onValuesChange={(changeValues) => {
                    if ('province' in changeValues) {
                        const { province } = changeValues
                        listDistricts(province)
                    }
                }}
            >
                <ProFormSelect label='Outsource Type' name='outSourceType' options={outsourceTyps}/>
                <ProFormSelect label="Vendor" name='vendor'  request={async () =>(initData.data?.outsource || []).map(item => {return {label:item.display, value: item.value}})} showSearch={true}/>
                <ProFormSelect label='Customer' name="customerCode"  request={async () =>(initData.data?.dest_customer || []).map(item => {return {label:item.display, value: item.value}})} showSearch={true}/>                
                <ProFormSelect label="Province" name='province'  options={(initData.data?.list_provinces || []).map(item => {return {label:item.display, value: item.value}})} showSearch={true}/>
                <ProFormSelect label="District" name='district'  options={(districts.data || []).map(item => {return {label:item.display, value: item.display}})} showSearch={true}/>
                <ProFormDateRangePicker label="Date Range" name='dateRange' rules={[{ required: true }]}/>
                <ProFormSelect fieldProps={{popupMatchSelectWidth: 100}} name={'claimedType'} label='Status' showSearch allowClear options={[{ label: "All", value: 'all' },{ label: "Claimed", value: 'claimed' }, { label: "Unclaimed", value: "unClaimed" }]} />
                {/* <ProFormCheckbox label='Cancelled Only' name={'cancelled'} /> */}
                {/* <ProFormCheckbox.Group label='Canceled' name={'canceled'} options={[{label:'No',value:'N'},{label:'Yes',value:'Y'}]} /> */}
                <ProFormSelect fieldProps={{popupMatchSelectWidth: 100}} name={'canceled'} label='Canceled' showSearch allowClear options={[{ label: "All", value: 'all' },{ label: "Yes", value: 'Y' }, { label: "No", value: "N" }]} />
            </ProForm>
        </Spin>

    </Modal>
}

export default DeliveryDetailReport