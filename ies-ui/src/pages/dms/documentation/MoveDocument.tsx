import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormCascader } from "@ant-design/pro-components";
import React, { useEffect } from "react";
import { FolderServiceAPI } from "../folder/service";
import { simpleRequestActions } from "@/services/model";

interface Props extends FormModalProps {
    onSave: () => void,

}

interface DD {
    text: string;
    id: number;
    level?: string;
    parentId: number;
}
class Tree<T> {
    constructor(
      public label: string,
      public children: Tree<T>[] = [],
      public data:T,
      public draggable = true,
      public droppable = true
    ) { }
  }

 

  interface Data {
    name: string,
    previousName: string,
    showOrder: string;
    preferredOrder: string
  }
  
const MoveDocumentModal: React.FC<Props> = ({ onSave, ...props }) => {
    const requestAction = simpleRequestActions();
    const nest = (items:any[], id = 0, link = 'parentId'):any => {
        // console.log(items);
        // console.log(link)
        
        return items.filter(item =>{
            return  item[link] === id
        }).map(item=>({
            ...item,
            children:nest(items, item.id)
        }))
      }



    return (
        <>
            <FormModalComp
                {...props}
                title="Document Movement"
                width="600px"
            >
                <ProForm
                    submitter={false}
                >
                    <ProFormCascader
                        fieldProps={{
                            showSearch:{}
                        }}
                        request={async (k) => {
                            const data = await FolderServiceAPI(requestAction).list({ advanceSearch: {}, searchValue: "" });
                            const flatData = data.map(o => ({ id: o.id, parentId: o.parentId, label: o.name, value:o.id }));
                            
                            return nest(flatData)
                        }}
                        name="areaList"
                    />

                </ProForm>
            </FormModalComp>
        </>
    )
}
export default MoveDocumentModal