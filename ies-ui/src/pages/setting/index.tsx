import React from 'react'
import ListMenuComp from '@/components/ListMenu'
import workflowIcon from '@/assets/algorithm.png'
import { PageContainer } from '@ant-design/pro-components';
// import accountIcon  from '@/assets/account.png'

export const SettingPaths = {
    workflow: '/setting/process-def',
    pro: '/pro/setting'
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
        icon: workflowIcon,
        link: `${SettingPaths.pro}`,
    },
];

const SettingComp: React.FC<{}> = ({ }) => {
    return <PageContainer title={false}>
        <ListMenuComp items={processDefList} />
    </PageContainer>

}

export default SettingComp