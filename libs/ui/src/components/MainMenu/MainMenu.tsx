import React from "react";
import { ListMenuItem, MainMenuProps } from "./type";
import "./MainMenu.css"
import { Card, Divider, Dropdown, Flex, List, MenuProps } from "antd";
import defaultIcon from "./../../assets/menu-icon.png"
import { DownOutlined } from "@ant-design/icons";
import Paragraph from "antd/lib/typography/Paragraph";


const onOpenHandler = (item: ListMenuItem) => {
  if (item.onClick) {
    item.onClick();
    return;
  }
};

const title = (item: ListMenuItem, menu?: MenuProps) => {
  if (item.menu) {
    return (
      <Dropdown className={'itemTitle'} menu={menu} trigger={['hover']}>
        <a>
          {item.name} <DownOutlined />
        </a>
      </Dropdown>
    );
  } else {
    return <a className={'itemTitle'} > {item.name}</a>;
  }
};

const createMenus = (key: string, items: ListMenuItem[]) => <List<ListMenuItem>
  key={key}
  rowKey="id"
  grid={{ gutter: 16, lg: 4, md: 3, sm: 2, xs: 1, xl: 4, xxl: 5 }}
  dataSource={items.filter((it) => it.visible === true || it.visible === undefined)}
  renderItem={item => {
    return (<List.Item onClick={(e: any) => {
      const { className, offsetParent } = e.target;
      if (['itemTitle'].some(it => className?.includes?.(it) && (item.menu?.items?.length || 0) > 0)) return
      if (['cardMenu'].some(it => offsetParent?.className?.includes?.(it))) onOpenHandler(item)
    }}>
      <Card hoverable className="cardMenu">
        <Card.Meta
          avatar={
            <img
              height="50px"
              alt=""
              className={'cardAvatar'}
              src={item.icon || defaultIcon}
            />
          }
          title={title(item, item.menu)}
          description={
            <Paragraph className={'item'} ellipsis={{ rows: 3 }}>
              {item.description}
            </Paragraph>
          }
        />
      </Card>
    </List.Item>)
  }}
/>

const MainMenu = (props: MainMenuProps) => {
  const size = props.items.length -1
  return <Flex vertical>
    {props.items.map((it) => <div>
      { it.menu.devider && <Divider  orientation="left" orientationMargin={"0px"} style={{marginTop: '0px'}}>{it.menu.devider.label}</Divider> }
      {createMenus(it.menu.key, it.menu.items)}
    </div>)}
  </Flex>
}

export default MainMenu