import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormCascader, ProFormTreeSelect } from "@ant-design/pro-components";
import React, { useEffect, useState } from "react";
import { FolderServiceAPI } from "../folder/service";
import { simpleRequestActions } from "@/services/model";
import { useForm } from "antd/es/form/Form";
import { MoveDocParams } from "./data";

interface Props extends FormModalProps {
    onSave: (data:MoveDocParams) => void,
    data?:MoveDocParams
}


  
const MoveDocumentModal: React.FC<Props> = ({ onSave,data, ...props }) => {
    const requestAction = simpleRequestActions();
    const [form] = useForm<MoveDocParams>()
    const nest = (items:any[], id = 0, link = 'parentId'):any => {
        
        return items.filter(item =>{
            return  item[link] === id
        }).map(item=>({
            ...item,
            children:nest(items, item.id)
        }))
      }

      const [value, setValue] = useState<string>();
      const onChange = (newValue: string) => {
        setValue(newValue);
        
      };

      useEffect(()=>{
        form.resetFields();
      } ,[props.open]);
    

      
    return (
        <>
            <FormModalComp
                {...props}
                title="Document Movement"
                width="600px"
                onSubmit={async()=>{
                     await form.validateFields();
                    const entry ={
                        folderId:parseInt(value||""),
                        docId:data?.docId
                    }
                    onSave(entry);
                        
                }}
            >
                <ProForm
                    submitter={false}
                    form={form}
                >
                    <ProFormTreeSelect
                        name={"folderId"}
                        rules={[{required:true}]}
                        allowClear
                        secondary
                        request={async (k) => {
                            const data = await FolderServiceAPI(requestAction).list({ advanceSearch: {}, searchValue: "" });
                            const flatData = data.map(o => ({ id: o.id, parentId: o.parentId, label: o.name, value:o.id }));
                            return nest(flatData)
                        }}
                        
                        fieldProps={{
                            onSearch:onChange,
                            filterTreeNode:true,
                            showSearch:true,
                            popupMatchSelectWidth:true,
                            labelInValue: true,
                            autoClearSearchValue: true,
                            treeDefaultExpandAll:true,
                            onChange:(e)=>{
                                setValue(e.value)
                            }
                            
                        }}
                    />
                  
                </ProForm>
            </FormModalComp>
        </>
    )
}
export default MoveDocumentModal