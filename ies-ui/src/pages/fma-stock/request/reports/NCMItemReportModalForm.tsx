import { ModalForm, ProFormDigitRange, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
import { ItemGroupListItem, WarehouseGroup } from "../data.types"
import { useEffect, useState } from "react"
import { simpleRequestActions } from "@/services/model"
import { createService } from "../services"
import { Button, Card, Flex,message, Space, Spin } from "antd"
import moment from "moment";
import { FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport } from "@/services/apiGateway"
import {getUrlReporting} from "@/pages/ReportUrl"

type DataFormType = {        
    status?: string
    funGroupId?: number[]
    onHand: number[]
}

export default ({ trigger,refNo }: { trigger?: JSX.Element, refNo: string}) => {
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const [warehouseGroupList, setWarehouseGroup] = useState<WarehouseGroup[]>([]);
    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useState(false)
    const [itemGroups, setItemGroups] = useState<ItemGroupListItem[]>([]);

    const initData = async () => {
        setLoading(true)
        services.listWarehouseGroup().then(whg => setWarehouseGroup(whg));
        const data = await services.listAllItemGroup();
        setItemGroups(data);
         setLoading(false)
    };  
    useEffect(() => {
        initData();
    }, [refNo]);
    const reportList = [
        {name:'NCM Item Onhand Report', value: 'whm_ncm_item_onhand_report'}
    ]
    const handleExport= async (e:any) => {
        try {           
            const dataForm =  await form.validateFields()  
            const reportName = (reportList.find(r=> r.value=='whm_ncm_item_onhand_report')?.name)
              const reportKey = (reportList.find(r=> r.value=='whm_ncm_item_onhand_report')?.value)
            setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: reportKey||'',
                    reportPath: getUrlReporting('whm'),
                    data: [ 
                         {key:'serial', value:refNo},     
                        {key:'onHandFrom', value: dataForm.onHand?.[0]},  
                        {key:'onHandTo', value: dataForm.onHand?.[1]}, 
                        {key:'status', value: 'All'},            
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

    const bnts = [
        <Button onClick={()=>{form.resetFields()}}>Reset</Button>,
         <Button loading={loading} onClick={handleExport} icon={<FileExcelOutlined/>} ><Space>Export </Space></Button>
    ] 
    
    return (
     <ModalForm<DataFormType> 
        trigger={trigger}
        title ={'NCM Item Stock On Hand Report'}
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
                        <div style={{width:'100%'}}>
                           {warehouseGroupList&&
                            <ProFormSelect mode="multiple" 
                            options={itemGroups.map(i=>({label:i.itemGroupName, value: i.itemGroupName}))}
                            rules={[{ required: false}]}
                            label="Function"
                            name={'funGroupId'}
                            />}    
                        </div>
                    </Flex>
                    <ProFormDigitRange proFieldProps={{width:'100%'}}
                        rules={[{ required: false}]}
                        label="On Hand"
                        name={'onHand'}
                    />
                </Flex>
            </Card>
        </Spin>
    </ModalForm>
    )
}