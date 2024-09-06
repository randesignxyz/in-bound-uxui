import ListMenuComp, { ListMenuItem } from "@/components/ListMenu"
import { PageContainer } from "@ant-design/pro-components"

export const WHMPaths = {
    request: '/whm/issue/request',
    item: '/whm/inventory/item',
    transter:'/whm/transfer/request',
    empWhs: '/whm/inventory/empwhs',
    adjRequest:'/whm/adj/request',
}
const items: ListMenuItem[] = [
    {
      id: 'whm_issue_request',
      name: 'NCM Request',
      description: 'NCM Request Management',
      link: `${WHMPaths.request}/list`
    },
    {
        id: 'whm_transfer_request',
        name: 'Transfer Request',
        description: 'Transfer Request Management',
        link: `${WHMPaths.transter}/list`
    },
    {
        id: 'whm_inventory_item',
        name: 'Inventory Item',
        description: 'Inventory Item Management',
        link: `${WHMPaths.item}/list`
    },
    {
        id: 'whm_inventory_empwhs',
        name: 'Employe Warehouse',
        description: 'Employe Warehouse Mapping',
        link: `${WHMPaths.empWhs}/list`
    },
    {
        id: 'whm-adj-request',
        name: 'Adjustment Request',
        description: 'Adjustment Request Management',
        link: `${WHMPaths.adjRequest}/list`
    },
]
export default () => {
    return <PageContainer contentWidth='Fluid'  title={false}>
        <ListMenuComp items={items}/>
    </PageContainer> 
}