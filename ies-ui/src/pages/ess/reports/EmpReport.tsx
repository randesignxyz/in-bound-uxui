import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProFormCheckbox, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { Button, Col, Dropdown, message, Row, Space } from "antd"
import type { MenuProps } from 'antd';
import { useEffect, useState } from "react"
import { useForm } from "antd/es/form/Form"
import moment from "moment"
import { BU, Department, SubDepartment } from "@/pages/hrm/data"
import { EmployeeServices } from "@/pages/hrm/services"
import { DownOutlined, FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport, MultiRequest } from "@/services/apiGateway";
import { useSafeState } from "ahooks";

type DataFormType = {
    empSearch?: string
    empStatus?: string[]
    bu?: string[]
    department?: string[]
}

export default ({ trigger }: { trigger?: JSX.Element}) => {
    const requestActions = simpleRequestActions()
    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useSafeState(false)
    const [data, setData] = useState<{
        buList: BU[];
        departmentList: Department[];
        subDepartmentList: SubDepartment[];
    }>();
    const reportList = [
        {name:'Contact Information', value: 'hr_ess_contact_info_report'},
        {name:'Personal Information', value: 'hr_ess_personal_info_report'},
        {name:'Education Information', value: 'hr_ess_education_info_report'},
        {name:'Languages Information', value: 'hr_ess_languages_info_report'},
        {name:'Training Certification', value: 'hr_ess_training_certication_report'},
        {name:'Work Experiences', value: 'hr_ess_work_experience_report'},
        {name:'Employee Information', value: 'hr_ess_employee_info_report'}
    ]
    const [rawData, setRawData] = useState<boolean>(false)
    useEffect(() => {
        initData();
    }, []);
    const initData = async () => { 
        const rs = await MultiRequest<{
        buList: BU[];
        deptList: Department[];
        subDeptList: SubDepartment[];
        }>([
            EmployeeServices.listBu.queryParams,
            EmployeeServices.listDepartment.queryParams,
            EmployeeServices.listSubDepartment.queryParams,
        ])(requestActions);

        setData({
            buList: rs.buList,
            departmentList: rs.deptList,
            subDepartmentList: rs.subDeptList,
        }); 
    }
    
    const items=(): MenuProps['items']=>{

        return reportList.map(e => {
            const isRaw = e.value=='hr_ess_employee_info_report' ? true: false
            return {
                key: e.value,
                label: e.name,
                icon: <FileExcelOutlined style={{ fontSize: '16px', color: '#08c' }} />,
                disabled: isRaw && rawData                
            }
        })
    } 
    const onRawDataChange= (v:boolean) => {
        setRawData(v)
    }
    const handleMenuClick: MenuProps['onClick'] = async (e) => {
        try {
            const dataForm = form.getFieldsValue()          
            const raw = rawData? '_data':''
            const reportName = (reportList.find(r=> r.value==e.key)?.name + raw)
            setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: e.key+raw,
                    reportPath: '/Reports/hrm/ess',
                    data: [      
                       {key:'empSearch', value: dataForm.empSearch},
                        ...(dataForm.empStatus || []).map(it => ({ key: 'empStatus', value: it })),                
                        ...(dataForm.bu || []).map(it => ({ key: 'buIds', value: it })),
                        ...(dataForm.department || []).map(it => ({ key: 'deptIds', value: it })),
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
    const empStatusDS = [{name:'Active',value:'ACTIVE'},{name:'Inactive',value:'INACTIVE'}]

    return <ModalForm<DataFormType>   
        form={form}
        trigger={trigger}
        title = "Employee List Export"        
        submitter = {{
            render(_, dom) {
                // return [dom[0], ...bnts , dom[1]]
                return [dom[0], ...bnts]
            }
        }}      
        onFinish={async(dataForm: DataFormType)=>{
            // console.log(dataForm);
            // await downloadReport<{id: number}>(requestActions)({
            //     reportName: 'export-crm-term-list-report',
            //     fileName: `crm-term-list-report-${moment().format()}.xls`,
            //     type: 'EXCEL',
            //     data: {
            //         id: 4
            //     }
            // });
            await downloadGenericReport(requestActions)({
                fileName: `transportation-time-tracking-report-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: 'hr_ess_employee_info_report',
                    reportPath: '/Reports/qa/hr',
                    data: [
                        { key: 'id', value: 1 },
                        // { key: 'dateFrom', value: dataForm.dateRange[0] },
                        // { key: 'dateTo', value: dataForm.dateRange[1] },
                        // ...(dataForm.sourceIds || []).map(it => ({ key: 'sourceIds', value: it })),
                        // ...(dataForm.driverIds || []).map(it => ({ key: 'driverIds', value: it })),
                    ]
                }
            })        
            return true
        }}
    >
        <Row>
            <Col><ProFormText label='Employee ID/Name' name='empSearch'/></Col>
            <Col style={{paddingLeft: 15,paddingTop:0, width:'50%'}}> 
                <ProFormSelect mode="multiple"  label="Employee Status" name={'empStatus'} showSearch  allowClear
                    options={empStatusDS?.map((it) => ({ label: it.name, value: it.value }))}
                />  
            </Col>
        </Row>
         
        <ProFormSelect mode="multiple"  label="Company" name={'bu'}  shouldUpdate allowClear
            options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
        />    
         <ProFormSelect mode="multiple"  label="Function" name={'department'} showSearch  allowClear
            options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))}
        /> 
        {/* <ProFormSelect showSearch allowClear  name={"reportName"} label = "Report Name" options={reportList?.map(it =>({label: it.name, value: it.value}))}/> */}
        <ProFormCheckbox  label='' name="rawData" fieldProps={{onChange:(v)=> onRawDataChange(v?.target?.checked||false)}}>Raw Data</ProFormCheckbox>    
    </ModalForm>
}