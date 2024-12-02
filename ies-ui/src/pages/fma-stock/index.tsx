
import ListMenuComp, { ListMenuItem } from "@/components/ListMenu"
import { PageContainer } from "@ant-design/pro-components"
import { useAccess } from "@umijs/max";
import { useEffect } from "react";


export const WHMPaths = {
    request: '/whm/issue/request',
    item: '/whm/inventory/item',
    transter:'/whm/transfer/request',
    empWhs: '/whm/inventory/empwhs',
    adjRequest:'/whm/adj/request',
}

export default () => {
    const access = useAccess();
    function getItems(): ListMenuItem[] {
        const items: ListMenuItem[] = [];
        if (access.canAccessNcmIssueRequestMenu) {
            items.push({
                id: 'whm_issue_request',
                name: 'NCM Request',
                description: 'NCM Request Management',
                link: `${WHMPaths.request}/list`
            });
        }
        if (access.canAccessWhmInventoryTransferRequestMenu) {
            items.push({
                id: 'whm_transfer_request',
                name: 'Transfer Request',
                description: 'Transfer Request Management',
                link: `${WHMPaths.transter}/list`
            });
        }
        if (access.canAccessWhmItemMenu) {
            items.push({
                id: 'whm_inventory_item',
                name: 'Inventory Item',
                description: 'Inventory Item Management',
                link: `${WHMPaths.item}/list`
            });
        }
        if (access.canAccessWhmEmpMappingMenu) {
            items.push({
                id: 'whm_inventory_empwhs',
                name: 'Employe Warehouse',
                description: 'Employe Warehouse Mapping',
                link: `${WHMPaths.empWhs}/list`
            });
        }
        if (access.canAccessWhmInventoryAdjRequestMenu) {
            items.push({
                id: 'whm-adj-request',
                name: 'Adjustment Request',
                description: 'Adjustment Request Management',
                link: `${WHMPaths.adjRequest}/list`
            });
        }
        return items
    }
   
    return (<PageContainer contentWidth='Fluid'  title={false}>
        <ListMenuComp items={getItems()}/>
    </PageContainer>)
}