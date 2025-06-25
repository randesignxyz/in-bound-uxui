import { uniqueId } from "lodash"
import { DoRequireCustomerList } from "../data"
import { EditableProTable } from "@ant-design/pro-components"
import { Checkbox } from "antd"

export default ({title, itemList, onSetItemList, readOnly}:{
    title: string,
    itemList: DoRequireCustomerList[]
    onSetItemList?: (v: DoRequireCustomerList[]) => void;
    readOnly?: true|false;
}) => { 
    const onChangeCheckList=(key?: string, value?: number)=>{
    onSetItemList?.(
        itemList.map(it=> {
            if(it.docName===key){
            return {
                ...it,
                checkList: value||0
            }
        }
        return it
      })
    )
  }
   
    return <EditableProTable<DoRequireCustomerList>           
        pagination={false}  
        cardProps={false}
        search={false}
        size="small"
        options={{                
            density:false,
            search:false,
            reload:false,
            setting:false,
            fullScreen:false
            
        }} 
        // formRef={editableFormRef}
        // editableFormRef={editableFormRef}
        rowKey="docName"
        recordCreatorProps={false}
        value={itemList}
            editable={{
            type: 'multiple',
            editableKeys: itemList?.map((it) => it.docName||uniqueId.toString()),            
        }}
        columns={[
            {title: title, editable:false, dataIndex:'docName'}, 
            {title:'Type', editable:false, valueType: 'text', dataIndex:'docType'},
            {title:'Requirement', editable:false, valueType: 'text', dataIndex:'docRequired'},
            {title:'Check List', width: 80,  align:'center', valueType: 'radio', dataIndex:'checkList',
            renderFormItem(_, config, form,record) {
                return (!readOnly?
                <Checkbox key={`${config.record?.docName}`} 
                    onChange={(e) => {
                        form.setFieldValue(config.record?.docName || '', {
                            ...config.record,
                            checkList: e.target.checked?1:0,
                            checked: e.target.checked,
                        });                       
                        onChangeCheckList(config.record?.docName,e.target.checked?1:0)
                    }}
                    checked={config.record?.checkList==1}
                />:<Checkbox checked={config.record?.checkList==1}/>
                )
            }
            }
        ]}             
    />
}