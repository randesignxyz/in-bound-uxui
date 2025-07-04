import { DrawerForm, EditableFormInstance, ProCard, ProFormDateYearRangePicker, ProFormDigit, ProFormSelect, ProFormText, SubmitterProps } from "@ant-design/pro-components"
import { ProfileData } from "../data";
import { EducationData, FilesData } from "../data.ess";
import { Image, Col, Descriptions, Divider, Flex, Form, Input, List, Row, Select, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { formatYear } from "@/pages/utils";
import { useEffect, useState } from "react";
import { ProfileServicesEss } from "../service_ess";
import { simpleRequestActions } from "@/services/model";
import ImagePreview from "@/components/ImagePreview";

interface Props{
    open?: boolean;
    onOpenModalChange:(v:boolean)=>void;
    profile: ProfileData;
    data?: EducationData;
}
const EducationQuickView = ({open, onOpenModalChange, profile, data}:Props) => {
    const requestActions = simpleRequestActions();
    const [imageList, setImageList] = useState<FilesData[]>([]);
    useEffect(() => {
            initData();
        }, [data]);
        const initData = async () => {  
            const list = await ProfileServicesEss.listImageProfile(profile.id,3,1,data?.id!!).query(requestActions);
            setImageList(list); 
            // 
            // if(!!data){
    
            //     form.setFieldsValue({...data!!,educationYear:[data.fromYear,data.toYear]});
            // }
            // else{
            //     form.resetFields();
            // }
            // setItems([])
        };
    
    return (<DrawerForm
            open={open}
            onOpenChange={onOpenModalChange}
            title={<Space>
                <div>Degree: {data?.degreeName}</div> | 
                <div>Major/Subject: {data?.educationCenter}</div>          
            </Space>}
            submitter={false}
        >
        <Space direction="vertical">
            <ProCard bordered>
                <Descriptions column={2}>
                    {/* <Descriptions.Item label="Degree">{data?.degreeName}</Descriptions.Item> */}
                    {/* <Descriptions.Item label="Major/Subject">{data?.majorName}</Descriptions.Item> */}
                    <Descriptions.Item label="Education Institution">{data?.educationCenter||''}</Descriptions.Item>
                    <Descriptions.Item label="Country of Education Institution">{data?.countryEducationCenterName}</Descriptions.Item>
                    <Descriptions.Item label="GPA">{data?.gpa}</Descriptions.Item>
                    <Descriptions.Item label="Year">{formatYear(data?.fromYear)} - {formatYear(data?.toYear)}</Descriptions.Item>
                    <Descriptions.Item label="Status">{data?.statusName}</Descriptions.Item>

                    
                </Descriptions>            
            </ProCard>
            <ProCard size="small" bordered>   
                {/* <FileUploader   
                    required={false}  
                    service="FILE" onSetFiles={f=>setUpladFileHandle?.(f)}
                    showUploadList={true} 
                /> */}
                 {imageList && <Image.PreviewGroup>
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
                </Image.PreviewGroup>}
                {imageList.length<=0 && <center>No attached file.</center>}
                
            </ProCard>
        </Space>
    </DrawerForm>)
}
export default EducationQuickView;