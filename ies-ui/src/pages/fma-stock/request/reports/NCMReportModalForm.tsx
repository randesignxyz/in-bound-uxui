import board from "@/pages/delivery/board"
import { ModalForm, ProFormCheckbox, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
import { WarehouseGroup } from "../data.types"
import { useEffect, useState } from "react"
import { simpleRequestActions } from "@/services/model"
import { createService } from "../services"
import { Button, Card, Dropdown, Flex, MenuProps, message, Space } from "antd"
import moment, { Moment } from "moment";
import { DownOutlined, FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport } from "@/services/apiGateway"


type DataFormType = {    
    requestedDate: moment.Moment[]
    status?: string[]
    warehouseFrom?: string[]
    delivery?: boolean
}

export default ({ trigger }: { trigger?: JSX.Element}) => {
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const [warehouseGroupList, setWarehouseGroup] = useState<WarehouseGroup[]>([]);
    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useState(false)
    const statusDs = [{label:'Pending', value:'PENDING'},{label:'Completed', value:'COMPLETED'},{label:'Rejected', value:'REJECTED'}]

    const initData = async () => {
        services.listWarehouseGroup().then(whg => setWarehouseGroup(whg));      
    };  
    useEffect(() => {
        initData();
    }, []);
    const reportList = [
        {name:'NCM Request Summary', value: 'whm_ncm_request_summary_report'},
        {name:'NCM Request Detail', value: 'whm_ncm_request_detail_report'}
    ]
    const handleMenuClick: MenuProps['onClick'] = async (e) => {
        try {           
            const dataForm =  await form.validateFields()  
            const reportName = (reportList.find(r=> r.value==e.key)?.name)
            setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: e.key,
                    reportPath: '/Reports/whm',
                    data: [    
                        {key:'dateFrom', value: dataForm.requestedDate?.[0], type:'dateTime'},  
                        {key:'dateTo', value: dataForm.requestedDate?.[1], type:'dateTime'},                       
                        ...(dataForm.status || []).map(it => ({ key: 'status', value: it })),                
                        ...(dataForm.warehouseFrom || []).map(it => ({ key: 'warehouseFrom', value: it })),
                        {key:'delivery', value: dataForm.delivery||false}
                    ]
                }
            }).then(()=>{
                setLoading(false)
            })
        } catch (error: any) {
            message.error(error.message || "Failed to generate report.")
            setLoading(false)
        }            
    };
    
    const items=(): MenuProps['items']=>{
        return reportList.map(e => {
            const isRaw = e.value=='hr_ess_employee_info_report' ? true: false
            return {
                key: e.value,
                label: e.name,
                icon: <FileExcelOutlined style={{ fontSize: '16px', color: '#08c' }} />
            }
        })
    } 
    const menuProps = {
        items: items(),
        onClick: handleMenuClick,
    };

    const bnts = [
        <Button onClick={()=>{form.resetFields()}}>Reset</Button>,
        <Dropdown menu={menuProps}>
            <Button loading={loading}>
                <Space>
                    Export <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    ] 
    
    return <ModalForm<DataFormType>
        trigger={trigger}
        title ={'NCM Request Report'}
        form={form}        
        modalProps={{maskClosable: false}}
        submitter = {{
            render(_, dom) {
                return [dom[0], ...bnts]
            }
        }}
    > 
       <Card bordered>
      
        <Flex gap={2} vertical={true} style={{padding:0}}> 
            <Flex gap={5} style={{width:'100%'}}>               
                <ProFormDateRangePicker label='Requested Date' name={'requestedDate'}  rules={[{ required: true }]}  width="md"/>
                <div style={{width:'100%'}}>
                <ProFormSelect mode="multiple"  label="Status" name={'status'}  shouldUpdate allowClear
                    options={statusDs}
                /> </div>
            </Flex>            
            {warehouseGroupList&&
            <ProFormSelect mode="multiple" 
            options={warehouseGroupList.map(i=>({label:i.name, value: i.code}))}
            rules={[{ required: false}]}
            label="From Warehouse"
            name={'warehouseFrom'}
            />}     
            <ProFormCheckbox name={'delivery'} >Delivery</ProFormCheckbox>
        </Flex>
        </Card>

    </ModalForm>
}