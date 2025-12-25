import ContactIcon from '@/assets/contact.png';
import CustomerIcon from '@/assets/customer.png';
import notificationIcon from '@/assets/megaphone.png';
import planIcon from '@/assets/plan.png';
import scheduleIcon from '@/assets/schedule.png';
import agreementIcon from '@/assets/agreement.png'
import settingsIcon from '@/assets/settings.png'
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
import salesperson from "@/assets/salesman.png";
import RegisterCustomerIcon from '@/assets/register-customer.png';
import customerShipping from "@/assets/courier_14234908.png";
import customer_sharing from '@/assets/share-outlet.png';
import customer_verified from '@/assets/customer_location_verified.png';
import RegisterCustomerReport from './reports/RegisterCustomerReport';

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
  locationTracking: '/crm/tracking',
  gratisConfig: '/crm/gratis-config',
  salesperson: '/crm/salesperson',
  registerCustomer: '/crm/register-customer',
  shippingAddress: '/crm/shipping-address',
  shareCustomer: '/crm/shared',
  verifiedCustomer: '/crm/verified-customer',
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
      visible: access.canAccessContact || access.canAccessCrmContact,
      // visible: access.canAccessContact,
      // visible: access.canAccessCRMContact,
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
      // visible: access.canAccessCustomerMenu,
        visible:access.canAccess("CRM_CUSTOMER"),
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
      // visible: access.canAccessVisitPlanMenu,
      visible:access.canAccess("CRM_VISIT_PLAN"),
    },
    {
      id: 'visitSchedule',
      name: 'Visit Schedule',
      description: 'Sechule to visit customer',
      link: `${CrmPaths.visitSchedule}/list`,
      // visible: access.canAccessVisitScheduleMenu,
      visible: access.canAccessCRMVisitPlan,
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
              disabled: !access.canAccessVisitScheduleRpt,
              onClick: () => setReport('visit-schedule')
            },
            {
              label: 'POSM Report',
              key: 'posm-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              disabled: !access.canAccessCrmPosmRpt,
              onClick: () => setReport('posm-report')
            },
            {
              label: 'Stock Count Report',
              key: 'stock-count-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              disabled: !access.canAccessCrmStockCountRpt,
              onClick: () => setReport('stock-count-report')
            },

            {
              label: 'Call Productivity Report',
              key: "productivity-report",
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              disabled: !access.canAccessCrmCallProductivityRpt,
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
        }, {
          label: 'Location Tracking',
          key: 'tracking-location',
          disabled: !access.crmAdmin,
          onClick: () => history.push(CrmPaths.locationTracking)
        },
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
      // visible: access.canAccessNotificationMenu,
      visible: access.canAccessCRMNotification,
    },
    {
      id: 'gratis',
      name: 'Gratis Settlement',
      description: 'Gratis List',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.gratisSettlement}/list`,
      icon: scheduleIcon,
      // visible: access.canAccessGratisSettlementMenu,
      visible: access.canAccessCRMGratis,
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
      id: 'gratisConfig',
      name: 'Gratis Configuration',
      description: 'Gratis Configuration List',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.gratisConfig}/list`,
      icon: settingsIcon,
      // visible: access.canAccessGratisConfig,
      visible: access.canAccessCRMGratisConfig,
      // menu: {
      //   items: [{ label: <TermReport trigger={<a >Export</a>} />, key: 'exportTerm', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} /> }]
      // }
    },
    {
      id: 'terms',
      name: 'Terms',
      description: 'Terms List',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.terms}/list`,
      icon: agreementIcon,
      // visible: access.canAccessTermMenu,
      visible: access.canAccessCRMTerm,
      menu: {
        items: [{ label: <TermReport trigger={<a >Export</a>} />, key: 'exportTerm', icon: <ExportOutlined style={{ fontSize: '16px', color: '#08c' }} /> }]
      }
    },
    {
      id: 'salesperson',
      name: 'Salesperson Org Unit',
      description: '',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.salesperson}/list`,
      icon: salesperson,
      // visible: access.crmSalsperson
      visible: access.canAccessCRMSalesperson
    }, {
      id: 'registerCustomer',
      name: 'Register Customer',
      description: 'Register Customer List',
      link: `${CrmPaths.registerCustomer}/list`,
      icon: RegisterCustomerIcon,
      // visible: access.canAccessCrmRegisterCustomerMenuItem,
      visible: access.canAccessCRMRegisterCustomer,
      menu: {
        items: [{
          type: 'group',
          label: "Reports",
          children: [
            {
              label: <RegisterCustomerReport trigger={<a>Register Customer List</a>} />,
              key: 'register-customer-report',
              icon: <BarChartOutlined style={{ fontSize: '16px', color: '#08c' }} />,
              onClick: () => setReport('register-customer-report'),
              // visible: access.canAccessCrmRegisterCustomerMenuItem,
            }
          ]

        }]
      }
      // overlay: customerMenu,
    },
    {
      id: 'customer-shipping-address',
      name: 'Shipping Address',
      description: '',
      //link: `${CrmPaths.settlement}/list`,
      link: `${CrmPaths.shippingAddress}/list`,
      icon: customerShipping,
      // visible: access.crmShippingAddress
      visible: access.canAccessCRMShippingAddress
    },
    {
      id: 'customer-sharing',
      name: 'Share Customer',
      description: 'Original owner of the shared customer record.',
      link: `${CrmPaths.shareCustomer}/list`,
      icon: customer_sharing,
      // visible: access.crmShareCustomer
      visible: access.canAccessCRMShare
    },
    {
      id: 'customer-verified',
      name: 'Verified Location',
      description: "location has been checked and confirmed for accuracy",
      link: `${CrmPaths.verifiedCustomer}/list`,
      icon: customer_verified,
      // visible: access.canAccessVerifiedLocationMenu
      visible: access.canAccessCRMVerification
    },

  ];

  return (
    <PageContainer contentWidth='Fluid' title={false}>
      <ListMenuComp items={items} />
      <Reports reportName={report} onClose={() => setReport(undefined)} />
    </PageContainer>
  );
};

export default Crm;
