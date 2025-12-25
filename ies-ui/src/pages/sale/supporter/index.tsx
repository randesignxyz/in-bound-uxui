// import {
//   AppstoreAddOutlined,
//   CloudSyncOutlined,
//   DollarOutlined,
//   NodeCollapseOutlined,
//   SwapOutlined,
//   UnorderedListOutlined,
// } from '@ant-design/icons';
// // import { Form } from 'antd';
// import { useState } from 'react';
// // import styles from './assets/style.module.css';
// // import SolutionIssuesModal from './component/SolutionIssuesModal';
// import { useRollbackPurchaseOrder } from './component/useRollbackPurchaseOrder';

import ListMenuComp, { ListMenuItem } from "@/components/ListMenu";
import { TeamOutlined, TagsOutlined, ScheduleOutlined, ShoppingOutlined, FundOutlined } from "@ant-design/icons";
import { MenuProps, message } from "antd";
import { useState } from "react";
import { ReportName } from "../reports";
import POAdjustForm from "./component/POAdjustForm";
import sale from "..";


interface Props {

}

const Supporter: React.FC<Props> = ({ }) => {
  const [report, setReport] = useState<ReportName>();

  const [actionModuleState, setActionModuleState] = useState<{
    visible?: {
      state?:boolean;
      action: string
    }
  }>();


  type MenuItem = Required<MenuProps>['items'][number];
  const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem => {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  };

  const item = {
    onClick: (info: { key: any; }) => {
      switch (info.key) {
        case 'ROllBACK_DATE':
          setActionModuleState({ visible: {state:true, action: "ROllBACK_DATE" } })
          break;
        case 'CHANGE_ITEM_PRICE':
          setActionModuleState({ visible: {state:true,  action: "CHANGE_ITEM_PRICE" } })
          break;
        case 'CHANGE_ITEM_QTY':
          setActionModuleState({ visible: {state:true,  action: "CHANGE_ITEM_QTY" } })
          break;
        case 'REJECT_ITEM':
          setActionModuleState({ visible: {state:true,  action: "REJECT_ITEM" } })
          break;
        default:
          message.error('Something went wrong.');
      }
      return undefined;
    },
    items: [
      getItem('Rollback Date', 'ROllBACK_DATE', <TeamOutlined />),
      getItem('Change Item Price', 'CHANGE_ITEM_PRICE', <TeamOutlined />),
      getItem('Change Item Qty', 'CHANGE_ITEM_QTY', <TeamOutlined />),
      getItem('Reject Item', 'REJECT_ITEM', <TeamOutlined />),
    ],
  }

  const SalePaths = {
     po:"/sale/supporter/list"
  }
  const items: ListMenuItem[] = [

    {
      id: 'PO',
      name: 'PO Correction',
      description: 'Tools for adjusting, fixing, and updating PO data.',
      menu: item,
      link: `${SalePaths.po}`,
      // icon: deliveryIcon,
      // visible: access.canAccessSaleItems || access.canAccessSaleDelPrev,
    },
    {
      id: 'productItem',
      name: 'Product Preview',
      description: 'Products Preview',
      // visible: access.canAcessStockControlItem || access.canAccessSaleProdPrev,
      // link: `${SalePaths.product}/list`,
      // icon: productIcon,
    }
  ];

  return (
    <>
      <ListMenuComp items={items} />
      <POAdjustForm
        open={actionModuleState?.visible?.state}
        actionType={actionModuleState?.visible?.action!}
        modalProps={{
          onCancel: (e) => {
            setActionModuleState({ visible: undefined })
          },
        }}
      />
    </>
  )
}

export default Supporter