import { EditableFormInstance, EditableProTable, ProColumns, ProCard } from "@ant-design/pro-components"
import { DfEmpEvaluationRs } from "../data"
import { Grid, Radio, Space ,Card} from "antd";
import { useRef } from "react";

export default({
    items,
    onSetItems,
    editableFormRef,
    editable,
    editableRating,
    lang,
    getLableName
}:{
    items: DfEmpEvaluationRs[];
    onSetItems?: (v: DfEmpEvaluationRs[]) => void;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    editable: boolean|false;
    editableRating: boolean|false,
    lang: string,
    getLableName:(key:string)=>any
})=>{
    // const editableFormRef = useRef<EditableFormInstance>();

    const setRatingScore=(key?: string, rating1?: number, rating2?: number, rating3?: number, rating4?: number, rating5?: number)=>{
      onSetItems?.(
        items.map(it=> {
          if(it.key==key){
            return {
              ...it, 
              rating1: rating1,
              rating2: rating2,
              rating3: rating3,
              rating4: rating4,
              rating5: rating5
            }
          }
          return it
        })
      )
    }
    const cols: ProColumns<DfEmpEvaluationRs>[] = [
        { title:  getLableName('DF_TITLE_NO'), width: 20, editable: false, render: (_, __, index) => index + 1 },
        { title: getLableName('DF_TITLE_STATEMENT'),  
        // editable: false,
            dataIndex: lang=='KH'?'description1':'description',
            valueType: 'textarea',
            editable:(_,r) => false, 
            formItemProps: {rules: [{ required: true}] },
            fieldProps: { rows: 1, maxLength: 5000 },
            // render: (r: any) => (lang=='KH'?r.description1 :r.description)
        },
    ]
    // if(editableRating){
        cols.push({
            title: getLableName('DF_TITLE_STRONGLY_DISAGREE'),
             dataIndex: 'rating1',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
                return (editableRating?<Radio  
                key={`checked-${config.record?.key}`}
                checked={(config.record?.rating1==1)}
                onChange={(e) => {                    
                    form.setFieldValue(config.record?.key || '', {
                        ...config.record,
                        rating1: e.target.checked?1:0,
                        rating5: 0,
                        rating4: 0,
                        rating3: 0,
                        rating2: 0,
                        checked: e.target.checked,
                    });
                    setRatingScore(config.record?.key,e.target.checked?1:0,0,0,0,0)                
                }}
                />:<Radio required checked={(config.record?.rating1==1)}/>)
            },
        })
        cols.push({
            title: getLableName('DF_TITLE_DISAGREE'),
            dataIndex: 'rating2',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
                return (editableRating?<Radio  
                key={`checked-${config.record?.key}`}
                checked={(config.record?.rating2==2)}
                onChange={(e) => {                    
                    form.setFieldValue(config.record?.key || '', {
                        ...config.record,
                        rating2: e.target.checked?2:0,
                        rating5: 0,
                        rating4: 0,
                        rating3: 0,
                        rating1: 0,
                        checked: e.target.checked,
                    });
                    setRatingScore(config.record?.key,0,e.target.checked?2:0,0,0,0)             
                }}
                />:<Radio required checked={(config.record?.rating2==2)}/>)
                
            },
        })
        cols.push({
            title: getLableName('DF_TITLE_NEUTURAL'),
            dataIndex: 'rating3',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
                return (editableRating?<Radio  
                key={`checked-${config.record?.key}`}
                checked={(config.record?.rating3==3)}
                onChange={(e) => {                    
                    form.setFieldValue(config.record?.key || '', {
                        ...config.record,
                        rating3: e.target.checked?3:0,
                        rating5: 0,
                        rating4: 0,
                        rating2: 0,
                        rating1: 0,
                        checked: e.target.checked,
                    });
                    setRatingScore(config.record?.key,0,0,e.target.checked?3:0,0,0)             
                }}
                />:<Radio required checked={(config.record?.rating3==3)}/>)
                
            },
        })
        cols.push({
            title: getLableName('DF_TITLE_AGREE'),
            dataIndex: 'rating4',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
                return (editableRating?<Radio  
                key={`checked-${config.record?.key}`}
                checked={(config.record?.rating4==4)}
                onChange={(e) => {                    
                    form.setFieldValue(config.record?.key || '', {
                        ...config.record,
                        rating4: e.target.checked?4:0,
                        rating5: 0,
                        rating3: 0,
                        rating2: 0,
                        rating1: 0,
                        checked: e.target.checked,
                    });
                    setRatingScore(config.record?.key,0,0,0,e.target.checked?4:0,0)             
                }}
                />:<Radio required checked={(config.record?.rating4==4)}/>)
                
            },
        })
        cols.push({
            title: getLableName('DF_TITLE_STRONGLY_AGREE'),
            dataIndex: 'rating5',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
                return (editableRating?<Radio  
                key={`checked-${config.record?.key}`}
                checked={(config.record?.rating5==5)}
                onChange={(e) => {                    
                    form.setFieldValue(config.record?.key || '', {
                        ...config.record,
                        rating5: e.target.checked?5:0,
                        rating4: 0,
                        rating3: 0,
                        rating2: 0,
                        rating1: 0,
                        checked: e.target.checked,
                    });
                    setRatingScore(config.record?.key,0,0,0,0,e.target.checked?5:0)             
                }}
                />:<Radio required checked={(config.record?.rating5==5)}/>)
                
            },
        })

    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const ratingLabels = [
    { key: 'rating1', labelKey: 'DF_TITLE_STRONGLY_DISAGREE', value: 1 },
    { key: 'rating2', labelKey: 'DF_TITLE_DISAGREE', value: 2 },
    { key: 'rating3', labelKey: 'DF_TITLE_NEUTURAL', value: 3 },
    { key: 'rating4', labelKey: 'DF_TITLE_AGREE', value: 4 },
    { key: 'rating5', labelKey: 'DF_TITLE_STRONGLY_AGREE', value: 5 },
    ];



    return(<>
            {isMobile ? (
                <ProCard size="small">
                    <Space direction="vertical" size={10} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
                    {items?.map((item, index) => (
                        <Card
                        key={item.key || index}
                        title={<span style={{ fontSize: '14px',whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'visible', textOverflow: 'clip'  }}>{`${index + 1}. ${item.description || item.title || 'Unnamed Statement'}`}</span>}
                        style={{ width: 300 }}
                        >
                        {ratingLabels.map(({ key, value }) => (
                            <p key={`${item.key}-${key}`}>
                            <Radio
                                checked={item[key] === value}
                                onChange={(e) => {
                                const newRating = ratingLabels.reduce((acc, r) => {
                                    acc[r.key] = r.key === key && e.target.checked ? value : 0;
                                    return acc;
                                }, {} as Record<string, number>);

                                setRatingScore(
                                    item.key,
                                    newRating.rating1,
                                    newRating.rating2,
                                    newRating.rating3,
                                    newRating.rating4,
                                    newRating.rating5
                                );
                                }}
                            >
                                {getLableName(ratingLabels.find(r => r.key === key)!.labelKey)}
                            </Radio>
                            </p>
                        ))}
                        </Card>
                    ))}
                    </Space>
                </ProCard>
            ) : (
                <EditableProTable<DfEmpEvaluationRs>
                    bordered
                    pagination={false}
                    cardProps={false}
                    formRef={editableFormRef}
                    editableFormRef={editableFormRef}
                    rowKey="key"
                    editable={{
                        type: 'multiple',
                        editableKeys: items?.map((it) => it.key), 
                        onValuesChange: (record, recordList) => { }
                        }}
                            
                        recordCreatorProps={false}
                        value={items}
                        columns={cols}
                    /> 
                )}
    </>)
}