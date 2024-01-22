import { colLink } from "@/components/DataCrud/TableView"
import Status from "@/components/Status"
import { CrmPaths } from "@/pages/crm"
import { formatDate } from "@/pages/utils"
import { ContractLess } from "@/services/crm/contract"
import ProTable from "@ant-design/pro-table"
import { Tag } from "antd"
import {history} from 'umi'

interface Props {
    data?: ContractLess[] 
}

const ContractListView: React.FC<Props> = ({data}) => {
    return <ProTable<ContractLess> 
        dataSource = {data}
        search = {false}
        options = {{
            fullScreen: false,
            density: false,
            reload: false,
            setting: false,
        }}
        columns = {[
            {title: 'Contract No', render: colLink( r => history.push(`${CrmPaths.contract}/detail/${r.id}`), r => r.contractNo || 'Not Assigned'), width: 150  },
            {title: 'Type' , render: (_,r) => r.contractType },
            { title: 'Terms', render: (_,r) => r.terms },
            {
                align: 'right',
                dataIndex: 'contractDate',
                width: 150 ,
                title: 'Contract Date',
                render: (_, item) => formatDate(item.effectiveDate)
            }, {
                title: 'Status',
                width: 50 ,
                render: (_, item) => item.status && <Status text= {item.status}/>
            }


        ]}
    />
}

export default ContractListView