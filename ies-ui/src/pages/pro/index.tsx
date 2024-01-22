import poIcon from '@/assets/check-list.png';
import priceComparisonIcon from '@/assets/price-comparison.png';
import quoteIcon from '@/assets/quote.png';
import requisitionIcon from '@/assets/requisition.png';

import ListMenuComp, { ListMenuItem } from '@/components/ListMenu';
import { BarChartOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import PrReport from './reports/PrReport';

export const ProPaths = {
  requisition: '/pro/requisition',
  po: '/pro/po',
  quotation: '/pro/quotation',
  priceComparison: '/pro/price-comparison',
};

export default () => {
  const access = useAccess();

  const items: ListMenuItem[] = [
    {
      id: 'requisition',
      name: 'Purchase Requisition',
      description: 'Purchase Requisition List',
      link: `${ProPaths.requisition}/list`,
      icon: requisitionIcon,
      menu: {
        items: [
          {
            label: <PrReport trigger={<a>PR Report</a>} />,
            key: 'pr-report',
            icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
            disabled: !access.canPostPRrToSap,
          },
        ],
      },
    },
    {
      id: 'quote',
      name: 'Quotation',
      description: 'Quotation List',
      link: `${ProPaths.quotation}/list`,
      visible: access.canAccessProPQMenuItem,
      icon: quoteIcon,
      menu: {
        items: [
          {
            label: <PrReport trigger={<a>Quotation Report</a>} />,
            key: 'quotation-report',
            icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
            disabled: !access.canPostPoReport,
          },
        ],
      },
    },
    {
      id: 'price-comparison',
      name: 'Price Comparison',
      description: 'Price Comparison',
      link: `${ProPaths.priceComparison}/list`,
      visible: access.canAccessProQCMenuItem,
      icon: priceComparisonIcon,
    },
    {
      id: 'po',
      name: 'Purchase Order',
      description: 'Purchase Requisition Process',
      link: `${ProPaths.po}/list`,
      icon: poIcon,
      visible: access.canAccessProPOMenuItem,
      menu: {
        items: [
          {
            label: <PrReport trigger={<a>Po Report</a>} />,
            key: 'po-report',
            icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
            disabled: !access.canPostPoReport,
          },
        ],
      },
    },
  ];

  return (
    <PageContainer title={false}>
      <ListMenuComp items={items} />
    </PageContainer>
  );
};
