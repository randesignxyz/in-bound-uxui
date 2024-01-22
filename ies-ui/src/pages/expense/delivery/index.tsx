import React, { useState } from "react"

import deliveryIcon from '@/assets/delivery-64.png'
import boardIcon from '@/assets/clipboard.png';
import priceListIcon from '@/assets/price-64.png'
import ListMenuComp, { ListMenuItem } from "@/components/ListMenu"
import reportIcon from '@/assets/business-report.png'

import { useAccess } from "umi";
import { Menu } from "antd"
import DeliveryReport, { ReportModalName } from "./Reports"
import { PageContainer } from "@ant-design/pro-components"
import { BarChartOutlined } from "@ant-design/icons"

export default (): React.ReactNode => {

  const [reportName, setReportName] = useState<ReportModalName>('none')
  const [forceUpdate, setForceUpdate] = useState<number>(0)

  const menu = (
    <Menu onClick={e => {
      setForceUpdate(v => v + 1)
      setReportName(e.key as ReportModalName)
    }}>
      <Menu.ItemGroup title="Detail">
        <Menu.Item key='deliveryDetailReport'>Delivery Detail Report</Menu.Item>
      </Menu.ItemGroup>
      {/* <Menu.ItemGroup title="Summary">
        <Menu.Item key = 'deliveryExpenseReport'>Delivery Expense Report</Menu.Item>
      </Menu.ItemGroup> */}
    </Menu>
  );

  const access = useAccess()

  const items: ListMenuItem[] = [
    {
      id: 'deliveryList',
      name: 'Delivery List',
      description: 'Delivery list',
      link: './delivery/delivery-list',
      icon: deliveryIcon,
    }
  ];

  access.canAccessDeliverySetupPriceList && items.push(
    {
      id: 'deliveryNoteFinder',
      name: 'Delivery Note Finder',
      description: 'Delivery Note List ',
      link: './delivery/dn-finder',
      icon: boardIcon
    }
  )

  access.canAccessDeliverySetupPriceList && items.push(
    {
      id: 'deliveryPriceList',
      name: 'Price List',
      description: 'Delivery Price List ',
      link: './delivery/price-list',
      icon: priceListIcon
    }
  )

  

  access.canAccessDeliveryReports && items.push(
    {
      id: 'deliveryReport',
      name: 'Reports',
      description: 'Delivery Reports ',
      //link: './delivery/reports',
      icon: reportIcon,
      menu : {
        items : [{
          type: 'group',
          label: "Detail",
          children: [
            {
              label: 'Detail',
              key: 'deliveryDetailReport',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: (e)=> {
                setForceUpdate(v => v + 1)
                setReportName(e.key as ReportModalName)
              }
            }],
        }]
      
      }
      // isMenu: true,
      // overlay: menu
    }
  )

  return  <PageContainer title = {false}>
    <ListMenuComp items={items} />
    <DeliveryReport reportName={reportName} forceUpdate={forceUpdate}></DeliveryReport>
  </PageContainer>

}
