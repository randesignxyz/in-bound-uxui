import { MenuProps } from 'antd';
import { MenuDividerType } from "antd/lib/menu/hooks/useItems";

export type MainMenuProps = {
  items: {
    menu: {
      key: string;
      devider?: {
        label?:  React.ReactNode;
      }
      items: ListMenuItem[]
    }
  }[]

}

export type ListMenuItem = {
  visible?: boolean;
  id: string;
  name: string;
  description: string;
  icon?: any;
  menu?: MenuProps;
  onClick?: () => void;
}

