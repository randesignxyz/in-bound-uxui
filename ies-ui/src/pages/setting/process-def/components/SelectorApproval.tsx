import { DestSelector, DestSelectorType, Selector } from "@/services/account/data"
import { AccountServiceAPIs } from "@/services/account/services"
import { simpleRequestActions } from "@/services/model"
import { EditableFormInstance, EditableProTable, ModalForm, ModalFormProps, ProFormSelect } from "@ant-design/pro-components"
import { message } from "antd"
import { uniqueId } from "lodash"
import { useRef, useState } from "react"

export default ({ onSave, ...rest }: ModalFormProps<{ approver: string }> & {
    data?: DestSelector,
    onSave: (approver: string, data: Selector[]) => void
}) => {

    const editableFormRef = useRef<EditableFormInstance>();
    
    const selectorList: DestSelectorType[] = [
        { dataType: 'String', name: 'function', },
        { dataType: 'String', name: 'sub-function' },
        { dataType: 'String', name: 'bu' },
        { dataType: 'String', name: 'job-title' },
        { dataType: 'ListString', name: 'employee-id' },
        { dataType: 'String', name: 'selector1' },
        { dataType: 'String', name: 'selector2' },
        { dataType: 'String', name: 'selector3' }
    ]

    const dataType = [
        {value: 'Number', label: 'Number'},
        {value: 'String', label: 'String'},
        {value: 'Date', label: 'Date'},
    ]

    const operands = [
        {value: 'Equals', label: 'Equals'},
        {value: 'Not', label: 'Not'},
        {value: 'LessThan', label: 'Less Than'},
        {value: 'LessThanEqual', label: 'Less Than Or Equal'},
        {value: 'GreaterThan', label: 'Greater Than'},
        {value: 'GreaterThanEqual', label: 'Greater Than Or Equal'},
        {value: 'In', label: 'In'},
        {value: 'NotIn', label: 'Not In'},
        // {value: 'IsNull', label: 'Is Null'},
        // {value: 'IsNotNull', label: 'Is Not Null'},
    ]

    const [data, setData] = useState<readonly Selector[]>(selectorList.map(it => ({
        key: uniqueId().toString(),
        operand: 'Equals',
        dataType: 'String',
        selector: it.name
    })))

    const requestActions = simpleRequestActions()
    const loadUser = async (keyworks?: string) => {
        return (await AccountServiceAPIs.fetchListContributors(keyworks).query(requestActions)).map(it => ({ label: [it.code || '000000', it.name].join(' - '), value: it.id, }))
    }
    return <ModalForm width={1000} {...rest} onFinish={async (dataForm) => {
        if (data.filter(it => it.value).length == 0) {
            message.error("No selector set.")
            return
        }
         await editableFormRef.current?.validateFields()
         try {
            onSave(dataForm.approver, data.filter(it => it.value)) 
            rest.onOpenChange?.(false)   
         } catch (error: any) {
            message.error(error.message || 'Failed to save.')
         }
        
    }}>

        <ProFormSelect
            showSearch allowClear name={'approver'}
            rules={[{ required: true }]} width={"xl"}
            label="Approver" debounceTime={500}
            request={({ keyWords }) => loadUser(keyWords)} />

        <EditableProTable<Selector>
            rowKey='key'
            editableFormRef={editableFormRef}
            value={data}
            onChange={ setData}
            recordCreatorProps={{
                newRecordType: 'dataSource', 
                record: ({key: uniqueId().toString(), selector: "", dataType: 'String' , operand: 'Equals' }), 
                creatorButtonText: 'Add',
                position: 'top'
            }}
            controlled
            columns={[
                { title: 'Selector', 
                    formItemProps: {rules: [{required: true}] } , 
                    editable:(_,r) => !selectorList.some(it => it.name == r.selector ) , 
                    dataIndex: 'selector' 
                },
                { title: "Data Type", width: 110 , dataIndex: 'dataType', valueType: 'select', fieldProps: { options: dataType } },
                { title: "Operand", width: 200, dataIndex: 'operand', valueType: 'select', fieldProps: { options: operands } },
                { title: 'Value', dataIndex: 'value' },
                { title: 'Remarks', dataIndex: 'remarks' },
                {
                    title: '',
                    valueType: 'option',
                    width: 50,
                    render: () => {
                      return null;
                    },
                },
            ]}

            editable={{
                type: 'multiple',
                editableKeys: data?.map(it => it.key),
                actionRender: (row, config, defaultDoms) => {
                    if(selectorList.some(it => it.name == row.selector)) return []
                    return [defaultDoms.delete];
                  },
                // onValuesChange(_, dataSource) {
                //     setData(dataSource)
                // },
            }}
        />
    </ModalForm>
}