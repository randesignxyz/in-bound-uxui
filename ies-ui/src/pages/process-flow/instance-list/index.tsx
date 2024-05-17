import { useCallback } from 'react'
import { history } from "@umijs/max";
import { Menu, Spin, Card } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import styles from './style.less';
import { processDefType, ProcessInstance, ProcessInstanceDef } from '@/services/process-workflow/data';
import DefaultFilterComp from '@/components/DefaultFilter';
import { ProcessFlowModalMngt } from '../components/ProcessFlowModalWrapper';
import InstanceItemListComp from './components/InstanceItemList';
import MenuListComp from '../components/MenuListModal';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { PageContainer } from '@ant-design/pro-components';

export default () => {
    // const { state, ops, actions } = Modal()
    const model = ProcessFlowModel()
    const { state, actions, modals } = model
    const menu = (
        <Menu onClick={v => {
            actions.openStartMenu(parseInt(v.key.toString()))
        }}>
            <Menu.Item key={1} icon={<PlusCircleOutlined />}> OFL </Menu.Item>
            <Menu.Item key={2} icon={<PlusCircleOutlined />}> NVC </Menu.Item>
            <Menu.Item key={3} icon={<PlusCircleOutlined />}> OMM </Menu.Item>
            <Menu.Item key={4} icon={<PlusCircleOutlined />}> OMR </Menu.Item>
        </Menu>
    );

    const handleGotoDetail = useCallback((item: ProcessInstance) => {
        history.push(`/data-form/${item.procDefKey}/${item.procInstId}`);
    }, [])

    const onSearchHandler = (data?: { isGlobal?: boolean, status?: string, searchValue?: string }) => {

        actions.loadInstanceList({
            criteria: {
                state: data?.status,
                searchValue: data?.searchValue
            }
        })
    }

    const filterComp = <DefaultFilterComp<processDefType>
        items={state.instStatusFilterList || []}
        defaultValue={state.searchParams?.state}
        isGlobal={true}
        onSearch={onSearchHandler} />

    return (<PageContainer
    // extra={
    //     <Affix offsetTop={50}>
    //         <Dropdown  overlay={menu} trigger={['click']}>
    //             <Button
    //                 type='primary'
    //                 style={{ width: '100%', marginBottom: 8 }}>
    //                 Start Process <DownOutlined />
    //             </Button>
    //         </Dropdown>
    //     </Affix>
    // }
    >

        <Spin spinning={state.loading}>

            <Card
                // bodyStyle={{ backgroundColor: '#fafafa' }}
                className={styles.listCard}
                bordered={false}
                extra={filterComp}>
                <InstanceItemListComp
                    actionHandlers={{
                        onGotoDetail: handleGotoDetail,
                        onGotoPage: (page, pageSize) => actions.loadInstanceList({ paging: { page: page - 1, pageSize: pageSize } }),
                        onShowDiagram: item => actions.loadDiagram(item.procInstId),
                        onDownload: item => actions.downloadForm(item.procInstId, ` ${item.procName}.pdf`)

                    }}
                    data={state.instanceList}
                />
            </Card>

            <MenuListComp<ProcessInstanceDef>
                title={"Process Definition List"}
                loading={state.loading}
                afterSubmit='CLOSE'
                visible={modals.isVisible('InstanceDefList')}
                items={state.processDefList || []}
                onCancel={() => modals.hideModal('InstanceDefList')}
                onSelected={item => console.log(item)}

            />
            <ProcessFlowModalMngt workflowModel={model} />
        </Spin>
    </PageContainer>)
}