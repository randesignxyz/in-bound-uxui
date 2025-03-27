import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProCard, ProForm, ProFormDateYearRangePicker, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { EducationData, EssLookupData, FilesData, MarjorData } from "../data.ess"
import { Flex, Space, Typography, Row, Col, Image,List, Modal, message, Button, Select, Divider, Input, InputRef, Form,} from 'antd';
import { useEffect,useRef,useState } from 'react';
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import ImagePreview from "@/components/ImagePreview";
import { ProfileServicesEss } from "../service_ess";
import { ProfileData } from "../data";
import { simpleRequestActions } from "@/services/model";
import { ProfileOutlined,SaveOutlined,CloseSquareOutlined, PlusOutlined } from "@ant-design/icons";
import { set } from "lodash";

interface Props extends ModalFormProps<EducationData> { 
    profile: ProfileData;
    data?: EducationData;
    files: FilesData[];   
    type:string; 
    isAdmin:number;
    empId:number;
    marjor: MarjorData[];  
    cb: { //used callback function to parent form
        onLoadMenu: (tid:UploadType[]) => void;  
        onReload:()=>void;
    };
}

export default ({ profile,data,files,type,isAdmin,empId,marjor,cb, ...rest }: Props) => { 
    const [form] = ProForm.useForm<EducationData>(); 
    const requestActions = simpleRequestActions();
    const [imageList, setImageList] = useState<FilesData[]>([]);
    const [createFileOther, selectedFileOther] = useState<any>();  
    const [items, setItems] = useState<MarjorData[]>([]);
    const [name, setName] = useState('');
    const [searchName, setSearchName] = useState('');
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => {  
        const list = await ProfileServicesEss.listImageProfile(profile.id,3,type=="ADD"?2:1,data?.id!!).query(requestActions);
        setImageList(list); 
        // 
        if(!!data){

            form.setFieldsValue({...data!!,educationYear:[data.fromYear,data.toYear]});
        }
        else{
            form.resetFields();
        }
    };

    //    
    const setUpladFileHandle=(ploadFiles: UploadType[])=>{ 
        selectedFileOther(ploadFiles);
        cb.onLoadMenu(ploadFiles);
    }
    // 
    const onAdminSubmit = async ()=>{

        console.log('bmform--------------------------')
        const bmForm = await form.validateFields(); 
        console.log('bmform',bmForm)
        // attachment files
        // if(type=="ADD"){ 
        //     if(createFileOther.length==0){  
        //         message.error('Please do select attachment files.');
        //         return false;
        //     } 
        // }
        // submit
        Modal.confirm({
            title: 'Save Education',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.otherFile = createFileOther||[];  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                bmForm.isDelete=0;

                var educationYear = bmForm.educationYear;
                
                bmForm.fromYear = educationYear[0];
                bmForm.toYear = educationYear[1]; 
                bmForm.openId = profile.ess.id||0;

                await ProfileServicesEss.saveEducationAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        // e.preventDefault();
        // setItems([...items, name || `New item ${index++}`]);
        if(name && (name!='' || name!= undefined)){
            setItems(v=> [...v,{id: (-1*(items.length+1))||-1,majorName:name,description:name,status: 1}]);
            setName('');
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
        }
    };
    const handleSearch = (value: string) => {
        setSearchName(value);
    };
    

    return <ModalForm   {...rest} form={form} width={'40%'} title={!!data?<><ProfileOutlined /> Edit Education</>:<><ProfileOutlined /> Add Education</>}
        // onOpenChange={visible => {
        //     form.resetFields(); 
        //     form.setFieldsValue({
        //         id: data?.id,
        //         degreeId: data?.degreeId,
        //         statusId: data?.statusId,
        //         countryEducationCenter: data?.countryEducationCenter,
        //         educationCenter: data?.educationCenter,
        //         marjorSubject: data?.marjorSubject,
        //     }); 

        //     rest.onOpenChange?.(visible)
        // }}

            submitter={isAdmin==2&&empId>0?
                {
                    render: () => { 
                        return <><Button onClick={()=>{onAdminSubmit();}}><SaveOutlined /> Save11</Button></>
                    }
                }
                :{
                    searchConfig: {
                        submitText: <div><SaveOutlined /> Save</div>,
                        resetText: <div><CloseSquareOutlined /> Cancel</div>,
                    }
                }
            } 
        >
        <ProCard bordered>
            <ProFormText label="Education Institution" name={'educationCenter'} rules={[{ required: true }]}/> 
            <ProFormSelect rules={[{ required: true }]} allowClear={true}
                name={'marjorSubject'} label = "Major/Subject"  
                showSearch  
                mode="single" 
                options={marjor?.map((it) => {
                    return { value: it.id, label: it.majorName };
                })} 
            />
            {/* <Form.Item name="majorSubject1"  label = "Major/Subject"  rules={[{ required: true }]}>
            <Select 
                style={{ width: '100%' }}
                // required={true} 
                allowClear={true}
                // id={'marjorSubject1'}
                filterOption={false}
                showSearch
                onSearch={handleSearch}
                onChange={(value:any)=> {
                    console.log('onchange===',[...marjor,...items].find(i=> (i.id==value))  )
                    setSearchName('')
                }}
                dropdownRender={(menu) => (
                <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Flex gap={2} >
                    <Input
                        placeholder="Please enter major/subject"
                        ref={inputRef}
                        value={name}
                        onChange={onNameChange}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button type="text" size="middle" icon={<PlusOutlined />} onClick={addItem}></Button>
                    </Flex>
                </>)}
                //  options={[...marjor,...items]?.map((it) => {
                //     return { value: it.id, label: it.majorName };
                // })} 
                options={[...marjor,...items]?.filter(i=> (searchName=='' || (i.majorName.toLowerCase().includes(searchName.toLowerCase()))))?.map((it) => {
                    return { value: it.id, label: it.majorName };
                })} 
            />   
            </Form.Item>  */}
            
           
            <Row>
                <Col span={12} style={{padding:'3px'}}>
                    <ProFormSelect rules={[{ required: true }]} allowClear={true} 
                        name="degreeId" label = "Degree" placeholder="Degree"  
                        showSearch 
                        mode="single" 
                        options={profile.degree?.map((it) => {
                            return { value: it.id, label: it.titleName };
                        })}  
                    />   
                </Col>
                <Col span={12} style={{padding:'3px'}}>
                    <ProFormSelect rules={[{ required: true }]} allowClear={true} 
                        name="statusId" label = "Status" placeholder="Status"  
                        showSearch 
                        mode="single" 
                        // options={
                        options={profile.status?.map((it) => {
                            return { value: it.id, label: it.titleName };
                        })}  
                    /> 
                </Col>
            </Row> 
            <ProFormDigit label="GPA" name={'gpa'} rules={[{ required: true }]}/>   
            <Row>
                <Col span={24} style={{padding:'3px'}}>
                    <ProFormDateYearRangePicker name="educationYear" label = "Year" rules={[{ required: true }]}/>
                </Col> 
            </Row>  
            <ProFormSelect rules={[{ required: true }]} allowClear={true}  
                name="countryEducationCenter" label = "Country of Education Institution" placeholder="Country of Education Institution"  
                showSearch 
                mode="single" 
                options={profile.coei?.map((it) => {
                    return { value: it.id, label: it.titleName };
                })}  
            /> 
        </ProCard>
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Education Document</Typography.Title><Typography.Title level={5} style={{color:'red'}}> (Required*)</Typography.Title>
            </Space>
            <div style={{fontSize:'12px'}}>(Degree and transcript or other related documents)</div>
        </div> 
        <ProCard size="small" bordered>   
            <FileUploader   
                required={false}  
                service="FILE" onSetFiles={f=>setUpladFileHandle?.(f)}
                showUploadList={true} 
            />
            <Image.PreviewGroup>
                <List style={{display:imageList.length>0?'':'none'}}
                    grid={{ gutter: 5 }}
                    dataSource={imageList.filter((it) => it) || []}
                    renderItem={(it) => {
                    return (
                        <List.Item>
                            <ImagePreview
                                version={2}
                                width={'200px'}
                                key={it.id}
                                fileId={it.id || ''}
                                fileName={it.fileName}
                            />
                        </List.Item>
                    );
                    }}
                />
            </Image.PreviewGroup>
        </ProCard>

    </ModalForm>
}