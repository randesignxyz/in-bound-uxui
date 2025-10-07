import { ProTable } from "@ant-design/pro-components"
import { DfEmpEvaluationDetailReport, DfEmpStatementDetail } from "../data"
import { formatterQty1 } from "@/pages/utils"

interface Props {
    lang: string,
    keyRating: string
    getLable: (key: string)=>any,   
    item?: DfEmpEvaluationDetailReport
}
export default({lang, item, getLable,keyRating}: Props) => {

    return (
        <ProTable<DfEmpStatementDetail>
            size="small"
            search={false}
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowKey="id"
            dataSource={item?.statements||[]}
            options={{
                density: false,
                fullScreen: false,
                reload: false,
                setting: false,
            }}
            columns={[
                { title: getLable('DF_TITLE_NO'), width: 20, editable: false, render: (_, __, index) => index + 1 },
                { title: (getLable('DF_TBL_STATEMENT')||'') +' ('+ (getLable(keyRating)||'')+')',dataIndex: lang=='KH'?'description1':'description',
                    render: (text, record) => <div>
                        <div style={{fontSize: 14}}><b>{lang=='KH'?record.title1: record.title}</b></div>
                        {lang=='KH'?record.description1: record.description}
                        </div>
                },
                { title: getLable(keyRating)||'', width: 80, dataIndex: 'rating', render: (text, record) => record.rating==0?'-': formatterQty1.format(record.rating)},
                { title: getLable('DF_TBL_RATING_AVG')||'', fixed: 'right', width: 40, dataIndex: 'avgRating', render: (text, record) => record.avgRating==0?'-': formatterQty1.format(record.avgRating)},
            ]}
        />
    )
}