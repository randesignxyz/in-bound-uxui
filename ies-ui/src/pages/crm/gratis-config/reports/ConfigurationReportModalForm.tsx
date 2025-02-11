import board from "@/pages/delivery/board"
import { ModalForm, ProFormCheckbox, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
// import { WarehouseGroup } from "../data.types"
import { useEffect, useState } from "react"
import { simpleRequestActions } from "@/services/model"
// import { createService } from "../services"
import { Button, Card, Dropdown, Flex, MenuProps, message, Space } from "antd"
import moment, { Moment } from "moment";
import { DownOutlined, FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport, MultiRequest } from "@/services/apiGateway"
import {getUrlReporting} from "@/pages/ReportUrl"
import { WarehouseGroup } from "@/pages/fma-stock/request/data.types"
import { createService } from "@/pages/fma-stock/request/services"
import { LookupData, LookupDataItem } from "@/services/data"
import { ContractServices } from "../../contract/services"
import { CustomerServices } from "../../customer/services"
// import { createService } from "@/pages/fma-stock/item/services"

type DataFormType = { 
    brandId?: number[]
    contractTypeId?: number[]
    startedDateRange?: moment.Moment[],
    endedDateRange?: moment.Moment[]
}

export default ({ trigger }: { trigger?: JSX.Element}) => {
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const [warehouseGroupList, setWarehouseGroup] = useState<WarehouseGroup[]>([]);
    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useState(false)
    const statusDs = [{label:'Pending', value:'PENDING'},{label:'Completed', value:'COMPLETED'},{label:'Rejected', value:'REJECTED'}]

    const [lookupData, setLookupData] = useState<{
            contractTypes?: LookupData[]
            brandList: LookupDataItem[]
        }>()

    const initData = async () => {
        services.listWarehouseGroup().then(whg => setWarehouseGroup(whg));      
    };  
     useEffect(() => {
            (async () => {
                const rs = await MultiRequest<{
                    contractTypes: LookupData[]
                    brandList: LookupDataItem[]
                }>(
                    [
                        ContractServices.listContractType().queryParams,
                        CustomerServices.listBrand.queryParams
                    ]
                )(requestActions)
                setLookupData(rs)
            })()
    
        }, [])
    useEffect(() => {
        initData();
    }, []);
    const reportList = [
        {name:'NCM Request Summary', value: 'whm_ncm_request_summary_report'},
        {name:'NCM Request Detail', value: 'whm_ncm_request_detail_report'}
    ]
    const handleMenuClick= async () => {
        try {           
            // const dataForm =  await form.validateFields()  
            const dataForm = await form.validateFields()
            const startedDateFrom = (dataForm?.startedDateRange || [undefined, undefined])[0]
            const startedDateTo = (dataForm?.startedDateRange || [undefined, undefined])[1]
            const endedDateFrom = (dataForm?.endedDateRange || [undefined, undefined])[0]
            const endedDateTo = (dataForm?.endedDateRange || [undefined, undefined])[1]
            // dataForm.brandId,
            // dataForm.contractTypeId,

            const reportName = 'Gratis Configuration List'
            setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: 'GratisConfigurationList',
                    reportPath: getUrlReporting('crm/gratis'),
                    data: [    
                        {key:'startedDateFrom', value: startedDateFrom, type:'dateTime'},  
                        {key:'startedDateTo', value: startedDateTo, type:'dateTime'},   
                        {key:'endedDateFrom', value: endedDateFrom, type:'dateTime'},  
                        {key:'endedDateTo', value: endedDateTo, type:'dateTime'}, 
                        ...( dataForm.brandId || []).map(it => ({ key: 'brandId', value: it })), 
                        ...( dataForm.contractTypeId || []).map(it => ({ key: 'contractTypeId', value: it }))
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
        <Button loading={loading} onClick={handleMenuClick}>Export</Button>,
        // <Dropdown menu={menuProps}>
        //     <Button loading={loading}>
        //         <Space>
        //             Export <DownOutlined />
        //         </Space>
        //     </Button>
        // </Dropdown>
    ] 
    
    return <ModalForm<DataFormType>
        trigger={trigger}
        title ={'Gratis Configuration Report'}
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
            {/* <Flex gap={5} style={{width:'100%'}}>               
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
            <ProFormCheckbox name={'delivery'} >Delivery</ProFormCheckbox> */}

            <ProFormSelect showSearch allowClear
                    mode="multiple" name={"brandId"}
                    label="Brand"
                    options={lookupData?.brandList?.map(it => ({ label: it.name, value: it.id }))} />
            <ProFormSelect showSearch allowClear mode="multiple"
                    name={"contractTypeId"} label="Contract Type"
                    options={lookupData?.contractTypes?.map(it => ({ label: it.name, value: it.id }))} />
            <ProFormDateRangePicker name={"startedDateRange"} label={"Start Date"} />
            <ProFormDateRangePicker name={"endedDateRange"} label={"End Date"} />
        </Flex>
        </Card>

    </ModalForm>
}