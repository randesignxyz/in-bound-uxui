import React from 'react'
import { List, BackTop, Space, Typography } from 'antd'
import IconText from '@/components/IconText'
import { PartitionOutlined } from '@ant-design/icons'
import styles from './../style.less';
import TaskStatus from '@/components/TaskStatus'
import moment from 'moment'
import { Paging } from '@/services/API';
import { ProcessInstance } from '@/services/process-workflow/data';

interface Props {
    loading?: boolean;
    data?: Paging<ProcessInstance>;
    actionHandlers?: {
        onGotoPage?: (page: number, pageSize?: number) => void;
        onGotoDetail?: (item: ProcessInstance) => void;
        onDownload?: (item: ProcessInstance) => void;
        onShowDiagram?: (item: ProcessInstance) => void;
    }

}

const ListContent = ({ data }: { data: ProcessInstance }) => (
    <div className={styles.listContent} >
        <div className={styles.listContentItem}>
            <span>Current Task</span>
            <p>{data.currTaskName || 'N/A'}</p>
        </div>
        <div className={styles.listContentItem}>
            <span>Originator</span>
            <p>{data.startUserInfo?.name || 'N/A'}</p>
        </div>
        <div className={styles.listContentItem} style={{ width: "80px", verticalAlign: "top" }}>
            <span>Started At</span>
            <p>{moment(data.startTime).format('YYYY-MM-DD HH:mm')}</p>
        </div>
        <div className={styles.listContentItem} style={{ width: "80px", verticalAlign: "top" }}>
            <span>Finished At</span>
            <p>{data.endTime ? moment(data.endTime).format('YYYY-MM-DD HH:mm') : '0000-00-00 00:00'}</p>
        </div>

    </div>
);


const InstanceItemListComp: React.FC<Props> = ({
    loading,
    data,
    actionHandlers
}) => {

    const actions = (instance: ProcessInstance) => [
        <IconText
            icon={PartitionOutlined}
            text={'Flow'}
            key="flow1"
            action={'viewFlow'}
            actionHandler={action => { actionHandlers?.onShowDiagram?.(instance) }}
        />,
        // <IconText
        //     icon={DownloadOutlined}
        //     text="Pdf"
        //     key="exportPdf1"
        //     action="exportPdf"
        //     actionHandler={() => actionHandlers?.onDownload?.(instance)}
        // />,
    ]

    return <div className={styles.standardList}>
        <List<ProcessInstance>

            itemLayout="vertical"
            size="small"
            rowKey="procInstId"
            dataSource={data?.items}
            pagination={{
                current: (data?.page || 0) + 1,
                total: data?.total || 0,
                pageSize: data?.pageSize || 20,
                onChange: actionHandlers?.onGotoPage,
            }}

            renderItem={item => {
                return (
                    <List.Item
                        // actions={actions(item)}
                        extra={[<ListContent key={item.procInstId} data={item} />]}>
                        <List.Item.Meta
                            avatar={<TaskStatus status={item.state} />}
                            title={<Space>
                                <a
                                    href={item.procInstId}
                                    onClick={e => {
                                        e.preventDefault();
                                        actionHandlers?.onGotoDetail?.(item);
                                    }}>
                                    {item.businessKey}
                                </a>
                                <Typography.Text style={{ fontSize: 14 }} type="secondary">{item.procName}</Typography.Text>
                                </Space>
                            }
                        />
                        {/* {item.currTaskName} */}
                    </List.Item>
                );
            }}
        >
            <BackTop />
        </List>
    </div>
}

export default InstanceItemListComp