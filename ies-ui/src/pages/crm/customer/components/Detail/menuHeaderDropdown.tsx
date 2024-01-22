
import { CustomerView } from '@/services/crm/data';
import { CloseCircleOutlined, EditOutlined, FormOutlined, PaperClipOutlined, PlayCircleOutlined, ScheduleOutlined, SwapOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useAccess } from 'umi';
import { ModalName } from '../../reducer';

export function menuHeaderDropdown(readOnly?: boolean, data?: CustomerView, open?: (menu: ModalName & 'disabled' & 'activate' ) => void) {
    const access = useAccess()

    const isDiabled = data?.status == 'Inactive'

    return (

        <Menu   onClick={(info) => open?.(info.key as ModalName & 'disabled' & 'activate' )}>

            {/* <Menu.Item  disabled = {!access.canCreateContract} key='createContract'>
                <FormOutlined /> Create Contract
            </Menu.Item> */}

            <Menu.Divider />
            <Menu.Item  disabled = {!(data?.source !== 'SAP' ) || (!access.canEditCustomerBasicInfo)  || isDiabled} icon = {<EditOutlined />} key='editBasicInfo'>
                 Edit Customer
            </Menu.Item>

            {/* <Menu.Item disabled = {!access.canEditPurchaseEst} key='purchaseEst'>
                <EditOutlined /> Purchase Estimation
            </Menu.Item> */}

            <Menu.Divider />

            <Menu.Item key='attachments' icon = {<PaperClipOutlined />} >
                 Attach Files
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item  disabled = {!access.canVisitScheduleGen || isDiabled} icon = {<ScheduleOutlined /> } key='visitScheduleGen'>
                Generate Schedule
            </Menu.Item>
           
            <Menu.Item disabled = {!access.canTransferSe || isDiabled || data?.type?.id != 102 } icon ={<SwapOutlined />} key='transfer-customer'>
                  Transfer Salesperson
            </Menu.Item>
            {!isDiabled?<Menu.Item  disabled = { data?.type?.id != 102  || !access.canActiveInactiveCustomer } icon = {<CloseCircleOutlined />} key='disabled'>
                  Disabled
            </Menu.Item>: <Menu.Item disabled = { data?.type?.id != 102 || !access.canActiveInactiveCustomer} icon ={<PlayCircleOutlined /> } key='activate'>
                 Activate
            </Menu.Item>}
            
        </Menu>
    );
}
