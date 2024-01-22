import React from 'react';
import { history } from 'umi';
import styles from './style.less';
import { List, Card, Typography, Dropdown, MenuProps } from 'antd';
import formLogo from '@/assets/icons8-form-80.png';
import { DownOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

export interface ListMenuItem {
  visible?: boolean;
  id: string;
  name: string;
  description: string;
  link?: string;
  icon?: any;
  overlay?: React.ReactElement;
  menu?: MenuProps;
  onClick?: () => void;
}

const onOpenHandler = (item: ListMenuItem) => {
  if (item.link) {
    history.push(item.link);
    return;
  }
  if (item.onClick) {
    item.onClick();
    return;
  }
};

const title = (item: ListMenuItem, menu?: MenuProps) => {
  if (item.menu || item.overlay) {
    return (
      <Dropdown className={styles.itemTitle} menu={menu} overlay={!menu ? item.overlay : undefined} trigger={['hover']}>
        <a>
          {item.name} <DownOutlined />
        </a>
      </Dropdown>
    );
  } else {
    return <a className={styles.itemTitle} > {item.name}</a>;
  }
};

const ListMenuComp: React.FC<{
  items: ListMenuItem[];
}> = ({ items, }) => {
  return (
    <div className={styles.formList}>
      <div className={styles.cardList}>
        <List<ListMenuItem>
          rowKey="id"
          grid={{ gutter: 16, lg: 3, md: 2, sm: 1, xs: 1, xl: 4, xxl: 4 }}
          dataSource={items.filter((it) => it.visible === true || it.visible === undefined)}
          renderItem={(item) => {

            return (
              <List.Item
                onClick={(e: any) => {
                  const { className, offsetParent } = e.target;
                  if (['itemTitle'].some(it => className?.includes?.(it) && (item.menu?.items?.length || 0) > 0)) return
                  if (['cardMenu'].some(it => offsetParent?.className?.includes?.(it))) onOpenHandler(item)
                }}
              >
                <Card
                  hoverable
                  className={styles.cardMenu}
                >
                  <Card.Meta
                    avatar={
                      <img
                        height="60px"
                        alt=""
                        className={styles.cardAvatar}
                        src={item.icon || formLogo}
                      />
                    }
                    title={title(item, item.menu)}
                    description={
                      <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                        {item.description}
                      </Paragraph>
                    }
                  />
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ListMenuComp;
