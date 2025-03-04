import { Paging } from "@/services/API";
import { Flex, Radio, Space, Spin, Tag, message } from "antd";
import TableView from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { TermServices } from "../../service";
import { ActionType, LightFilter, ProColumns, ProForm, ProFormSelect } from "@ant-design/pro-components";
import { CheckCircleOutlined, CheckOutlined, DownloadOutlined, ExclamationCircleOutlined, ExportOutlined, SelectOutlined, TagsOutlined } from "@ant-design/icons";
import { CrmPaths } from "@/pages/crm";
import { history, useModel } from 'umi'
import { GratisConfigurationList, Term } from "../../types";
import { TermAdvanceSearchParams } from "../../model";
import { useEffect, useRef, useState } from "react";
import { useForm } from "antd/es/form/Form";
import { LookupData } from "@/services/data";
import { downloadGenericReport, downloadReport, MultiRequest } from "@/services/apiGateway";
import { ContractServices } from "@/pages/crm/contract/services";
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe";
import { Button } from "antd";
import ImportFileButton from "@/components/ImportFileButton";
import { ImportDataItem, ImportDataResponse } from "@/services/shared/data";
import UploadData from "../../upload-data";
import { formatDate } from "@/pages/utils";
import Status from "@/components/Status";
import { AppraisalEmpAdvanceSearchParams } from "@/pages/hrm/appraisal-submit/components/list";
import moment from "moment";
import { getUrlReporting } from "@/pages/ReportUrl";
import ConfigurationReportModalForm from "../../reports/ConfigurationReportModalForm";

export interface Props{
   onDetail?: (record: GratisConfigurationList) => void
   onAdd?: () => void
   forceRefresh?: number
   contractTypes?: LookupData[]
}
type LightFilterProp = {
    tag?: string[]
}
export const GratisConfigurationOtherListView: React.FC<Props> = ({onDetail,onAdd,forceRefresh,contractTypes}) => {

    const cacheList = useModel('dataList')
    const actionRef = useRef<ActionType>();
    const [form] = useForm<{tag:string[]}>()
    const requestActions = simpleRequestActions()
    const [advanceSearch, setAdanceSearch] = useState<TermAdvanceSearchParams>({ status: "ALL" })   
    const [importData, setImportData] = useState<ImportDataResponse>()
    const [lookupData, setLookupData] = useState<{
        contractTypes?: LookupData[];
      }>();
    const onRequestHandler = async (criteria?: { searchValue?: string },
        pagination?: {
            pageSize?: number;
            current?: number;
        }, sort?: any) => {
        return TermServices.list({
            criteria: {
                searchValue: criteria?.searchValue,
                advanceSearch: advanceSearch,
                sort: sort
            },
            pagination: pagination
        }).query(requestActions).then(it => {
            return cacheList.cacheDataList({
                type: 'fetch-gratis-configuration-paging',
                data: it
            })

        }) as Promise<Paging<GratisConfigurationList>>
    }
    useEffect(() => {
        onLoad()
    }, [advanceSearch,forceRefresh])

    const onLoad = async () => {
        const rs = await MultiRequest<{
            contractTypes: LookupData[];
          }>([
            ContractServices.listContractType().queryParams,
          ])(requestActions);    
          setLookupData(rs);
        actionRef.current?.reloadAndRest?.()
    }
    const cols = (onDetail?: (record: GratisConfigurationList) => void): ProColumns<GratisConfigurationList>[] => ([
        {
            title: 'Agreement No',
            sorter: 'contractNo',
            width: 180,
            render: (_, rd) => <Space>
                <Button
                    type="link"
                    icon={<SelectOutlined />}
                    onClick={async () => {
                     
                        window.open(`/external/crm/contract/detail/${rd.contractId}`, '_blank')?.focus();
                    }}
                />
                {rd.contractNo || 'Not Assigned'}
            </Space>
        },       
        
        {
            title: 'Business Name',
            dataIndex: 'customerNo',
            render: (_,r)=> <>
                <Space>
                <Button
                    type="link"
                    icon={<SelectOutlined />}
                    onClick={async () => {
                        window.open(`/external/crm/customer/detail/${r.customerId}`, '_blank')?.focus();
                    }}
                />
                    <div>{r.customerNo}</div>
                </Space>
                <Flex dir="vertical" align="stretch">
                    <div style={{fontSize:11}}>{r.customerName}</div>
                </Flex>
            </>    
        },
        {
            title: 'Agreement Type',
            width: 100,
            dataIndex: 'contractType'
        },
        {
            title: 'Brand',
            width: 60,
            dataIndex: 'brand'
        },
        {
            align: 'right',
            dataIndex: 'effectiveStartDate',
            sorter: 'effectiveStartDate',
            title: 'Start Date',
            width: 100,
            render: (_, item) => formatDate(item.effectiveStartDate)
        },
        {
            align: 'right',
            dataIndex: 'effectiveEndDate',
            sorter: 'effectiveEndDate',
            title: 'End Date',
            width: 100,
            render: (_, item) => formatDate(item.effectiveEndDate)
        },
        {
            title: 'Settlement Frequency',
            width: 100,
            dataIndex: 'settlementFrequency'
        },
        {
            title: 'Settlement Target',
            width: 80,
            dataIndex: 'settlementTarget'
        },
        {
            title: 'Settlement SKU',
            width: 100,
            dataIndex: 'settlementSKU'
        },
        {
            title: 'Offer',
            align: 'right',
            width: 60,
            dataIndex: 'offer'
        },
        {
            align: 'right',
            dataIndex: 'createdDate',
            sorter: 'createdDate',
            title: 'Create Date',
            width: 100,
            render: (_, item) => formatDate(item.createdDate)
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy'
        },
        {            
            title: 'Staus',
            width: 80,
            dataIndex: 'active',
            render: (_,r) =>  <Status text={r.active?'Active':'Inactive'} value={r.active?'Active':'Inactive'}></Status>
        }
            
        // {
        //     title: 'Action',
        //     width: 30,
        //     render: (_,r) => {

        //         return <PopconfirmMe title={`Tag - ${r.code}`}  
        //             icon= {<TagsOutlined/>}
        //             placement="left"               
        //             description={
        //                 <ProForm form={form} submitter={false} style={{width:550}}>
        //                     <ProFormSelect mode="tags" colSize={1} readonly={false} options={contractTypes?.map(it =>{ return {label: it.name,value: it.name}})} name={'tag'}/>
        //                 </ProForm>
        //             }
        //             onConfirm={ async()=>{ 
        //                 try {
        //                     const formData = await form.validateFields();    
        //                     const data = {...formData,termId:r.id}
        //                     await TermServices.saveTermTag(data)(requestActions).then(it=>{
        //                         actionRef.current?.reloadAndRest?.()
        //                         message.success('Saved successfully.');
        //                     }) 
        //                 }catch(error: any){
        //                     message.error(error.message || 'Failed to save')
        //                 }
        //             }}
        //         >
        //             <Button type="link" icon={<TagsOutlined/>} 
        //                 onClick={()=> {
        //                     form.setFieldsValue({tag: r.tag})
        //                 }}
        //             />
        //         </PopconfirmMe>
        //     }
        // }
    ])

    const handleDownload = async () => {
       try {           
                //   const dataForm =  await form.validateFields()  
                  const reportName = 'Gratis configuration Template'//(reportList.find(r=> r.value==e.key)?.name)
                //   setLoading(true)
                  await downloadGenericReport(requestActions)({
                      fileName: `${reportName}-${moment().format()}.xls`,
                      type: 'EXCEL',
                      data: {
                          reportName: 'GratisConfigurationOtherTemplate',
                          reportPath: getUrlReporting('crm/gratis'),
                          data: [    
                            //   {key:'dateFrom', value: dataForm.requestedDate?.[0], type:'dateTime'},  
                            //   {key:'dateTo', value: dataForm.requestedDate?.[1], type:'dateTime'},                       
                            //   ...(dataForm.status || []).map(it => ({ key: 'status', value: it })),                
                            //   ...(dataForm.warehouseFrom || []).map(it => ({ key: 'warehouseFrom', value: it })),
                            //   {key:'delivery', value: dataForm.delivery||false}
                          ]
                      }
                  }).then(()=>{
                    //   setLoading(false)
                  })
              } catch (error: any) {
                  message.error(error.message || "Failed to generate report.")
                //   setLoading(false)
              }  
    }

    return <Spin spinning={false}>
        <TableView<GratisConfigurationList,  { searchValue?: string; }> 
            columns={cols(onDetail)}
            cache
            tableProps={{
                actionRef: actionRef,
                toolbar: undefined
            }}
            displayOnly={true}
            
            // extraFilter={
            //     <Space>
            //         <Radio.Group optionType="button"
            //             defaultValue={"ACTIVE"}
            //             options={[
            //                 { label: "All", value: "ALL" },
            //                 { label: "Mapping", value: "MAPPING" },
            //                 { label: "None", value: "NA" },
            //             ]}
            //             onChange={(e) => setAdanceSearch(v => ({ ...v, status: e.target.value }))}
            //         />
            //         <LightFilter<LightFilterProp> 
            //             onValuesChange={(_, values) => {
            //                 const tags = values.tag;
            //                 console.log('tag',tags)
            //                 setAdanceSearch(v => { return {...v,tag: tags}})
            //             }}
            //         >
            //             <ProFormSelect 
            //                 name="tag"
            //                 label="Tag"
            //                 mode="multiple"
            //                 options={lookupData?.contractTypes?.map(it =>{ return {label: it.name,value: it.name}})}
            //             />
            //          </LightFilter>
            //     </Space>
            // }
            extraRightFilter ={[
                 <ImportFileButton<ImportDataItem>
                    importedKey="GRATIS_CONFIGURATION_OTHER_LIST"
                    onDataResponse={data => {
                        setImportData(data)
                    }}
                    key={'GRATIS-CONFIGURATION-OTHER-LIST'}
                    onHandleChange={(status) => {
                        if (status == 'done') {
                            message.info('Data uploaded.');
                        }
                    }}
                />,
                <Button type="link" icon={<DownloadOutlined/>} onClick={handleDownload}>Export Template</Button>,
               <ConfigurationReportModalForm trigger={<Button type="link" icon={<ExportOutlined/>}>Export</Button>} />
            ]}
           
            actionHandlers={{
                // onAdd: onAdd,
                onFirstLoad: () => cacheList.fetchDataList('fetch-gratis-configuration-paging').then(v => {
                    if (v) return v.dataList;
                    else return onRequestHandler()
                }) as Promise<Paging<GratisConfigurationList>>,
                onRequest: onRequestHandler,
            }}
        />
        <UploadData title="Gratis Configuration List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />
    </Spin>
}

function dowloandData(reportName: string, fileName: string): import("@/services/apiGateway").DownloadData<{ searchValue?: string; advanceSearch?: AppraisalEmpAdvanceSearchParams; }> {
    throw new Error("Function not implemented.");
}
