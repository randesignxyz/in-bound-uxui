import { useState, useEffect, useCallback } from 'react';
import styles from './style.less';
import { List, Card, Typography, Modal, Button, Row, Col, Input, Select } from 'antd';
import formLogo from '@/assets/icons8-form-80.png';
import { MenuItem } from '@/services/data';

const { Paragraph } = Typography;

interface Props<T extends MenuItem> {
  visible: boolean;
  items: T[];
  loading?: boolean;
  title: string;
  afterSubmit?: 'CLOSE' | undefined;
  onCancel: () => void;
  onSelected: (item: T) => void;
}

const MenuListComp = <T extends MenuItem>({
  visible,
  title,
  loading,
  items,
  onSelected,
  onCancel,
  afterSubmit,
}: Props<T>) => {
  const [localItems, setLocalItems] = useState<T[]>([]);

  useEffect(() => {
    setLocalItems([...items]);
  }, [items]);

  const launchStartFormHandler = useCallback((item: T) => {
    if (afterSubmit) onCancel();
    onSelected(item);
  }, []);

  const onSearchHandler = useCallback((value: string) => {
    if (!value && value.trim().length == 0) {
      setLocalItems([...items]);
      return;
    }
    setLocalItems([
      ...localItems.filter((item) =>
        item.name.toLocaleLowerCase().includes(value.toLocaleLowerCase().trim()),
      ),
    ]);
  }, []);

  return (
    <Modal
      styles={{
        body: {
          backgroundColor: '#fafafa'
        }
      }}
      open={visible}
      width={'1200px'}
      title={title}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {' '}
          Cancel
        </Button>,
      ]}
    >
      <Row>
        <Col flex="auto" style={{ marginLeft: '30px', marginRight: '30px' }}>
          <Input.Group>
            <Row>
              <Col>
                <Select defaultValue={'all'} style={{ width: '200px' }}>
                  <Select.Option value="all">All</Select.Option>
                  <Select.Option value="fi">Finance</Select.Option>
                  <Select.Option value="sale">Sale</Select.Option>
                  <Select.Option value="hr">HR</Select.Option>
                  <Select.Option value="production">Production</Select.Option>
                  <Select.Option value="ict">ICT</Select.Option>
                </Select>
              </Col>
              <Col flex="auto">
                <Input.Search onSearch={onSearchHandler} />
              </Col>
            </Row>
          </Input.Group>
        </Col>
      </Row>
      <Row>
        <Col flex="auto">
          <div className={styles.formList}>
            <div className={styles.cardList}>
              <List<T>
                rowKey="id"
                grid={{ gutter: 5 }}
                loading={loading}
                dataSource={localItems}
                renderItem={(item) => {
                  return (
                    <List.Item key={item.id} onClick={() => launchStartFormHandler(item)}>
                      <Card
                        bodyStyle={{ backgroundColor: '#fafafa' }}
                        hoverable
                        className={styles.card}
                      >
                        <Card.Meta
                          avatar={<img alt="" className={styles.cardAvatar} src={formLogo} />}
                          title={<a>{item.name}</a>}
                          description={
                            <Paragraph ellipsis={{ rows: 3 }}>{item.description}</Paragraph>
                          }
                        />
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default MenuListComp;
