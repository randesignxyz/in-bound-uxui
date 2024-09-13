import ContactIcon from '@/assets/contact.png';
import CustomerIcon from '@/assets/customer.png';
import notificationIcon from '@/assets/megaphone.png';
import planIcon from '@/assets/plan.png';
import scheduleIcon from '@/assets/schedule.png';
import agreementIcon from '@/assets/agreement.png'
import type { ListMenuItem } from '@/components/ListMenu';
import ListMenuComp from '@/components/ListMenu';
import '@/pages/index.less';
import { BarChartOutlined, ExportOutlined, PlusCircleOutlined, ScheduleOutlined } from '@ant-design/icons';
import { useAccess, history } from '@umijs/max';
import { Menu, Space } from 'antd';
import React, { useState } from 'react';
import Reports, { ReportName } from './reports';
import { PageContainer } from '@ant-design/pro-components';
import PosmMonitoring from './reports/PosmMonitoring';
import AgreementCompliant from './reports/AgreementCompliant';
import ContractReport from './contract/components/ContractReport';
import TermReport from './term/components/TermReport';

export const CrmPaths = {
  contact: '/crm/contact',
  settlement: '/crm/gratis',
  customer: '/crm/customer',
  visitSchedule: '/crm/visit-schedule',
  visitPlan: '/crm/visit-plan',
  contract: '/crm/contract',
  schedule: '/crm/settlement-schedule',
  setup: '/crm/setup',
  notification: '/crm/notification',
  gratisSettlement: '/crm/gratis',
  terms: '/crm/term',
};
const Crm: React.FC = () => {
  const access = useAccess();
  const [report, setReport] = useState<ReportName>();

  // const [visibleModals, setVisibleModals] = useState<{ type: 'masterListReport'; visible: boolean; }[]>([
  //     { type: 'masterListReport', visible: false }
  // ])

  const GratistMenu = (
    <Menu>
      <Menu.ItemGroup key='actions' title="Actions">
        <Menu.Item onClick={() => {
          history.push(`${CrmPaths.settlement}/create`);
        }} key='new-settlement'>
          <Space>
            <PlusCircleOutlined style={{ fontSize: '16px', color: '#08c' }} />
            New Settlement
          </Space>
        </Menu.Item>
      </Menu.ItemGroup>
      {/* <Menu.ItemGroup key='scheduler' title="Scheduler">
        <Menu.Item onClick={() => {
          history.push(`${CrmPaths.schedule}/create`);
        }} key='new-schedule'>
          <Space>
            <PlusCircleOutlined style={{ fontSize: '16px', color: '#08c' }} /> New Schedule
          </Space>

        </Menu.Item>
        <Menu.Item key='schedule-list' onClick={() => {
          history.push(`${CrmPaths.schedule}/list`);
        }}>
          <Space>
            <ScheduleOutlined style={{ fontSize: '16px', color: '#08c' }} /> Schdule List
          </Space>

        </Menu.Item>
      </Menu.ItemGroup>

      <Menu.ItemGroup key='reports' title="Reports">
        <Menu.Item key='report'>...</Menu.Item>
      </Menu.ItemGroup> */}
    </Menu>
  );

  const contactMenu = (
    <Menu>
      {/* <Menu.ItemGroup title="Actions">
              <Menu.Item  onClick={() => {
                  history.push(`${CrmPaths.contact}/create`);
              }} key='newContact'>
                  <Space>
                      <PlusCircleOutlined  style={{ fontSize: '16px', color: '#08c' }}/>
                      New Contact
                  </Space>
              </Menu.Item>
          </Menu.ItemGroup> */}
    </Menu>
  )

  const customerMenu = (
    <Menu>

      <Menu.ItemGroup title="Reports">
        {/* <Menu.Item onClick={() => { setReport('export-customer') }} key="export-customer">
          <Space>
            <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} />
            Export
          </Space>
        </Menu.Item> */}
        <Menu.Item onClick={() => { setReport('customer-detail') }} key="customer-detail-report">
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            Customer Detail
          </Space>
        </Menu.Item>
      </Menu.ItemGroup>
      {/* <Menu.ItemGroup title="Actions">
        <Menu.Item onClick={() => {}} key="newCustomer">
          <Space>
            <PlusCircleOutlined style={{ fontSize: '16px', color: '#08c' }} />
            New Customer
          </Space>
        </Menu.Item>
      </Menu.ItemGroup> */}
      {/* <Menu.ItemGroup title="Visit Plan">
                <Menu.Item key = 'visit-plan-list' onClick={() => {
                    history.push(`${CrmPaths.visitPlan}/list`);
                }}>
                    <Space>
                        <ScheduleOutlined  style={{ fontSize: '16px', color: '#08c' }}/> Visit Plan List
                    </Space>

                </Menu.Item>
                <Menu.Item key = 'visit-schedule-list' onClick={() => {
                    history.push(`${CrmPaths.visitSchedule}/list`);
                }}>
                    <Space>
                        <ScheduleOutlined  style={{ fontSize: '16px', color: '#08c' }}/> Visit Schedule List
                    </Space>

                </Menu.Item>
            </Menu.ItemGroup>

            <Menu.ItemGroup title="Reports">
                <Menu.Item onClick={() => {
                    // setVisibleModals(v => [{ type: 'masterListReport', visible: true }])
                }} key='report' >Master List</Menu.Item>
            </Menu.ItemGroup> */}
    </Menu>
  );

  const visitScheduleMenu = (
    <Menu>
      <Menu.ItemGroup title="Reports">
        <Menu.Item
          onClick={() => {
            setReport('visit-schedule');
          }}
          key="visit-schedule-report"
        >
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            Visit Schedule Report
          </Space>
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setReport('posm-report');
          }}
          key="posm-report"
        >
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            POSM Report
          </Space>
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            setReport('stock-count-report');
          }}
          key="stock-count-report"
        >
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            Stock Count Report
          </Space>
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            setReport('productivity-report');
          }}
          key="productivity-report"
        >
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            Call Productivity Report
          </Space>
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item
          onClick={() => {
            setReport('agreement-compliance-report');
          }}
          key="agreement-compliance-report"
        >
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            Agreement Compliance
          </Space>
        </Menu.Item>

        <Menu.Item

          onClick={() => {
            setReport('posm-monitoring-report');
          }}

          key="posm-monitoring-report"
        >
          <Space>
            <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />
            POSM Monitoring
          </Space>
        </Menu.Item>

      </Menu.ItemGroup>
    </Menu>
  );

  const items: ListMenuItem[] = [
    {
      id: 'contact',
      name: 'Contact',
      description: 'Contact Management',
      link: `${CrmPaths.contact}/list`,
      icon: ContactIcon,
      visible: access.canAccessContact,
      // isMenu: true,
      // overlay: contactMenu
    },
    {
      id: 'contract',
      name: 'Contract',
      description: 'Contract List',
      link: `${CrmPaths.contract}/list`,
      icon: ContactIcon,
      visible: access.canAccessContact,
      menu: {
        items: [{ label: <ContractReport trigger={<a >Export</a>} />, key: 'exportContract', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} /> }]
      }
    },
    {
      id: 'customer',
      name: 'Customer',
      description: 'Customer List',
      link: `${CrmPaths.customer}/list`,
      icon: CustomerIcon,
      menu: {
        items: [{
          type: 'group',
          label: "Reports",
          children: [
            {
              onClick: () => { setReport('customer-detail') },
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              label: 'Customer Detail',
              key: "customer-detail-report"
            }
          ]

        }]
      }
      // overlay: customerMenu,
    },
    {
      id: 'visitPlan',
      name: 'Visit Plan',
      description: 'Plan to visit customer',
      link: `${CrmPaths.visitPlan}/list`,
      icon: planIcon,
    },
    {
      id: 'visitSchedule',
      name: 'Visit Schedule',
      description: 'Sechule to visit customer',
      link: `${CrmPaths.visitSchedule}/list`,
      // isMenu: true,
      // overlay: visitScheduleMenu,
      menu: {
        items: [{
          type: 'group',
          label: "General",
          children: [
            {
              label: 'Visit Schedule Report',
              key: 'visit-schedule-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('visit-schedule')
            },
            {
              label: 'POSM Report',
              key: 'posm-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('posm-report')
            },
            {
              label: 'Stock Count Report',
              key: 'stock-count-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('stock-count-report')
            },

            {
              label: 'Call Productivity Report',
              key: "productivity-report",
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('productivity-report')
            },
          ]

        }, {
          type: 'group',
          label: "Verification",
          children: [
            {
              label: <AgreementCompliant trigger={<a>Agreement Compliance</a>} />,
              key: 'greement-compliance-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('agreement-compliance-report'),
              disabled: !access.crmAdmin
            },
            {
              label: <PosmMonitoring trigger={<a>POSM Monitoring</a>} />,
              key: 'posm-monitoring-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('posm-monitoring-report'),
              disabled: !access.crmAdmin
            }
          ]
        }
        ]
      },
      icon: scheduleIcon,
    },
    {
      id: 'notoification',
      name: 'Notification',
      description: 'Notification Management',
      link: `${CrmPaths.notification}/list`,
      icon: notificationIcon,
    },
    {
      id: 'gratis',
      name: 'Gratis Settlement',
      description: 'Gratis List',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.gratisSettlement}/list`,
      icon: scheduleIcon,
      menu: {
        items: [
          {
            type: 'group',
            label: "Actions",
            children: [
              {
                icon: <PlusCircleOutlined style={{ fontSize: '16px', color: '#08c' }} />,
                label: 'New Settlement',
                onClick: () => {
                  history.push(`${CrmPaths.settlement}/create`);
                },
                key: 'new-settlement'
              }
            ]
          }
        ]
      },
      // overlay: GratistMenu
    },
    {
      id: 'terms',
      name: 'Terms',
      description: 'Terms List',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.terms}/list`,
      icon: agreementIcon,
      menu: {
        items: [{ label: <TermReport trigger={<a >Export</a>} />, key: 'exportTerm', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} /> }]
      }
    }
  ];

  return (
    <PageContainer contentWidth='Fluid' title={false}>
      <ListMenuComp items={items} />
      <Reports reportName={report} onClose={() => setReport(undefined)} />
    </PageContainer>
  );
};

export default Crm;
