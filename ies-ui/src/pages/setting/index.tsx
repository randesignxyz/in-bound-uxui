import React from 'react'
import ListMenuComp from '@/components/ListMenu'
import workflowIcon from '@/assets/algorithm.png'
import { PageContainer } from '@ant-design/pro-components';
// import accountIcon  from '@/assets/account.png'

export const SettingPaths = {
    workflow: '/setting/process-def',
}

const processDefList = [
    {
        id: 'workflow',
        name: 'Set up workflow',
        description: 'Associated groups, Associated users, Assignee ',
        icon: workflowIcon,
        link: `${SettingPaths.workflow}/list`,
    },
];

const SettingComp: React.FC<{}> = ({ }) => {
    return <PageContainer title={false}>
        <ListMenuComp items={processDefList} />
    </PageContainer>

}

export default SettingComp