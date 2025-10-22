import board from "@/pages/delivery/board"
import { ModalForm, ProFormCheckbox, ProFormDatePicker, ProFormDateRangePicker, ProFormDigitRange, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
import { ItemGroupListItem, WarehouseGroup } from "../data.types"
import { useEffect, useState } from "react"
import { simpleRequestActions } from "@/services/model"
import { createService } from "../services"
import { Button, Card, Dropdown, Flex, MenuProps, message, Space, Spin } from "antd"
import moment, { Moment } from "moment";
import { DownOutlined, FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport } from "@/services/apiGateway"
import {getUrlReporting} from "@/pages/ReportUrl"

type DataFormType = {        
    status?: string
    funGroupId?: number[]
    onHand: number[]
}

export default ({ trigger }: { trigger?: JSX.Element}) => {
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const [warehouseGroupList, setWarehouseGroup] = useState<WarehouseGroup[]>([]);
    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useState(false)
    const [refNo,setRefNo] = useState<string>("")
    const statusDs = [{label:'All', value:'ALL'},{label:'Active', value:'Y'},{label:'Inactive', value:'N'}]
    const [itemGroups, setItemGroups] = useState<ItemGroupListItem[]>([]);

    const initData = async () => {
        setLoading(true)
        services.listWarehouseGroup().then(whg => setWarehouseGroup(whg));    
        services.fetchReportItemRefNo().then(r=>{
            setRefNo(r.refNo)
            console.log(r)
             setLoading(false)
        })  
        const data = await services.listAllItemGroup();
        setItemGroups(data);
    };  
    useEffect(() => {
        if(!refNo || refNo==''){
            initData();
        }      
    }, [refNo]);
    const reportList = [
        {name:'NCM Item Onhand Report', value: 'whm_ncm_item_onhand_report'},
        // {name:'NCM Request Detail', value: 'whm_ncm_request_detail_report'},
        // {name:'NCM Request Summary By Item', value: 'whm_ncm_request_summary_by_item_report'}
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
                    reportPath: getUrlReporting('whm'),
                    data: [ 
                         {key:'serial', value:refNo},     
                        {key:'onHandFrom', value: dataForm.onHand?.[0]},  
                        {key:'onHandTo', value: dataForm.onHand?.[1]}, 
                        {key:'status', value: dataForm?.status||'All'},            
                        ...(dataForm.funGroupId || []).map(it => ({ key: 'funGroupId', value: it })),
                        // {key:'startWithRole', value: 'ROLE_NCM_ITEM'}
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
        <Dropdown menu={menuProps} disabled={loading} >
            <Button loading={loading} >
                <Space>
                    Export <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    ] 
    
    return (
     <ModalForm<DataFormType> 
        trigger={trigger}
        title ={'NCM Inventory Item Report'}
        form={form}        
        modalProps={{maskClosable: false}}
        submitter = {{
            render(_, dom) {
                return [dom[0], ...bnts]
            }
        }}
    > 
        <Spin spinning={loading}>
            <Card bordered>
            
                <Flex gap={2} vertical={true} style={{padding:0}}> 
                    <Flex gap={5} style={{width:'100%'}}>               
                         <ProFormSelect mode="single" label="Status" name={'status'} width={120}  shouldUpdate allowClear
                                options={statusDs}
                            /> 
                        <div style={{width:'100%'}}>
                           {warehouseGroupList&&
                            <ProFormSelect mode="multiple" 
                            options={itemGroups.map(i=>({label:i.itemGroupName, value: i.itemGroupName}))}
                            rules={[{ required: false}]}
                            label="Function"
                            name={'funGroupId'}
                            />}    
                            {/* <ProFormDateRangePicker label='Requested Date' name={'requestedDate'}  rules={[{ required: true }]}  width="md"/> */}
                        </div>
                    </Flex>
                    <ProFormDigitRange proFieldProps={{width:'100%'}}
                        // options={itemGroups.map(i=>({label:i.itemGroupName, value: i.id}))}
                        rules={[{ required: false}]}
                        label="On Hand"
                        name={'onHand'}
                    />
                    {/* <ProFormCheckbox name={'delivery'} >Delivery</ProFormCheckbox> */}
                </Flex>
            </Card>
        </Spin>
    </ModalForm>
    )
}