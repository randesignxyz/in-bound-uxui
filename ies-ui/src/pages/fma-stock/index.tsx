import ListMenuComp, { ListMenuItem } from "@/components/ListMenu"
import { PageContainer } from "@ant-design/pro-components"

export const InhouseStockPaths = {
    request: '/stock/request',
    item: '/stock/item',
}
const items: ListMenuItem[] = [
    {
      id: 'inhouse_stock_request',
      name: 'NCM Stock Request',
      description: 'NCM Stock Request Management',
      link: `${InhouseStockPaths.request}/list`,
    //   icon: ContactIcon,
    //   visible: access.canAccessContact,
    // isMenu: true,
    // overlay: contactMenu
    },
    {
        id: 'inhouse_stock_item',
        name: 'NCM Item',
        description: 'NCM Item Management',
        link: `${InhouseStockPaths.item}/list`,
      //   icon: ContactIcon,
      //   visible: access.canAccessContact,
      // isMenu: true,
      // overlay: contactMenu
      },
]
export default () => {
    return <PageContainer contentWidth='Fluid'  title={false}>
        <ListMenuComp items={items}/>
    </PageContainer> 
}