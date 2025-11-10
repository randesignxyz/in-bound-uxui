
import ListMenuComp, { ListMenuItem } from "@/components/ListMenu"
import { PageContainer } from "@ant-design/pro-components"
import { useAccess } from "@umijs/max";
import { useEffect } from "react";
import NCMReportModalForm from "./request/reports/NCMReportModalForm";
import { ExportOutlined } from "@ant-design/icons";
import NCMItemReportModalForm from "./request/reports/NCMItemReportModalForm";
import itemOnhand from "./item-onhand";


export const WHMPaths = {
    request: '/whm/issue/request',
    item: '/whm/inventory/item',
    itemOnhand: '/whm/inventory/item-onhand',
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
                link: `${WHMPaths.request}/list`,
                menu:access.isAccessNCMRequestCriteriaExportReport?{
                   items:[{label: <NCMReportModalForm trigger={<a>Export NCM Report</a>} />, key: 'exportNCMRequestReport', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }}/>}]
                }: undefined
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
                link: `${WHMPaths.item}/list`,
                // menu:access.isAccessNCMItemOnHandCriteriaExportReport?{
                //    items:[{label: <NCMItemReportModalForm trigger={<a>Export NCM Item Report</a>} />, key: 'exportNCMItemRequestReport', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }}/>}]
                // }: undefined
            });
        }
        if (access.canAccessWhmItemOnHandMenu) {
            items.push({
                id: 'whm_inventory_item_onhand',
                name: 'Item Stock On Hand',
                description: 'Item Stock On Hand Management',
                link: `${WHMPaths.itemOnhand}/list`,
                // menu:access.isAccessNCMItemOnHandCriteriaExportReport?{
                //    items:[{label: <NCMItemReportModalForm trigger={<a>Export NCM Item Report</a>} />, key: 'exportNCMItemRequestReport', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }}/>}]
                // }: undefined
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