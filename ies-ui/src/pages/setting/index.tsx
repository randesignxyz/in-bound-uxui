import React from 'react'
import ListMenuComp from '@/components/ListMenu'
import workflowIcon from '@/assets/algorithm.png'
import settingIcon from '@/assets/gear-two.png'
import { PageContainer } from '@ant-design/pro-components';

// import accountIcon  from '@/assets/account.png'

export const SettingPaths = {
    workflow: '/setting/process-def',
    pro: '/pro/setting'
}
export const NCMStockPaths = {
    request: '/stock/request',
    item: '/stock/item',
}

const processDefList = [
    {
        id: 'workflow',
        name: 'Set up workflow',
        description: 'Workflow configuration',
        icon: workflowIcon,
        link: `${SettingPaths.workflow}/list`,
    },
    {
        id: 'pro-setting',
        name: 'Pro',
        description: 'Setting for Pro module',
        icon: settingIcon,
        link: `${SettingPaths.pro}`,
    },
    {
        id: 'inhouse_stock_item',
        name: 'NCM Item List',
        description: 'NCM Item Management',
        link: `${NCMStockPaths.item}/list`,

    },
];

const SettingComp: React.FC<{}> = ({ }) => {
    return <PageContainer title={false}>
        <ListMenuComp items={processDefList} />
    </PageContainer>

}

export default SettingComp