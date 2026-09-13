import { PlusOutlined } from "@ant-design/icons"
import { ProList } from "@ant-design/pro-components";
import { Button, Card, Col, Input, List, Row } from "antd"
import styles from './style.less';

interface Props<T, S> {
    dataSource?: T[];
    searchable?: boolean;
    rowKey?: ((item: T) => string) | string;
    avatar?: (record: T) => React.ReactNode;
    title?: (record: T) => React.ReactNode;
    description?: (record: T) => React.ReactNode;
    contentList?: ContentList<T>[];
    actionHandlers?: {
        onAdd?: () => void;
        onSearch?: (searchValue?: S | string) => void;
        onTransform?: (searchValue?: string) => S;
    };
}

export interface ContentList<T> {
    key?: string;
    title?: React.ReactNode;
    render?: (record: T) => React.ReactNode;
}

const ListView = <T extends { id: number | string }, S>(props: Props<T, S>) => {
    const { searchable,rowKey, actionHandlers, dataSource, avatar, title, description, contentList } = props
    return (
        <Card
            bordered={false}
            title={searchable && (
                <Row>
                    <Col>
                        <Input.Search onSearch={value => {
                            actionHandlers?.onSearch?.(actionHandlers.onTransform?.(value) || value)
                        }} width='600' allowClear />
                    </Col>
                    <Col flex='Auto' />
                </Row>

            )}
            extra={(
                actionHandlers?.onAdd && <Button type='link' onClick={actionHandlers?.onAdd} icon={<PlusOutlined />} />
            )}>
            <ProList<T>
                className={styles.standardList}
                itemLayout='horizontal'
                rowKey = { rowKey}
                dataSource={dataSource}
                metas = {{
                    avatar: {
                        render: (_,r) => avatar?.(r)
                    },
                    title: {
                        render: (dom, entity, index, action, schema) => title?.(entity),
                    },
                    description: {
                        render: (_,r) => description?.(r)
                    },
                    content: {
                        render: (_,r) => contentList?.map(it => (
                            <div key = {it.key} className={styles.listContent}>
                                <div className={styles.listContentItem}>
                                    <span>{it.title}</span>
                                    <p>{it.render?.(r)}</p>
                                </div>
                            </div>
                        ))
                    }
                }}
            />
        </Card>
    )
}

export default ListView