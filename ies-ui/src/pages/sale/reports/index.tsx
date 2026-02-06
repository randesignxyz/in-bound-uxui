import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { useEffect, useState } from 'react';
import DSDLeadReport from './DSDLeadReport';
import DSDSalesInvoiceReport from './DSDSalesInvoiceReport';
import PurchaseOrderReport from './PurchaseOrderReport';
import SaleOrderReport from './SaleOrderReport';
// import SalesPerformanceOverviewReport from './SalesPerformanceOverviewReport';
import PerformancePurchaseOrderReport from './PerformancePurchaseOrderReport';
import VisitReports from './VisitReports';
import { DSDReportAPI } from './service';
import DSDSalesInvoiceReportV1 from './DSDSalesInvoiceReportV1';
import SaleOrderSummaryReport from './SaleOrderSummaryReport';

interface Props {
  reportName?: ReportName;
  onClose: () => void;
}

export type ReportName =
  | 'sale-order-report'
  | 'sale-order-summary-report'
  | 'dsd-reports'
  | 'dsd-lead-report'
  | 'visit-report'
  | 'purchase-order-reports'
  | 'sale-invoice-report-v1'
  | 'performance-po-report';

const Reports: React.FC<Props> = ({ reportName, onClose }) => {
  const requestActions = simpleRequestActions();
  const services = DSDReportAPI(requestActions);
  const [salesperson, setSalesperson] = useState<SalesTeamWorkLess[]>([]);

  useEffect(() => {
    (async () => {
      const salesTeam = await services.salespersonList();
      setSalesperson(salesTeam.filter((it) => it.isApprover === false));
    })();
  }, []);

  return (
    <div>
      <VisitReports
        salespersons={salesperson}
        title="Visit Outlets"
        width="800px"
        open={reportName === 'visit-report'}
        onCancel={onClose}
      />
      <SaleOrderReport
        title="Puchase Order Report"
        width="800px"
        open={reportName === 'sale-order-report'}
        onCancel={onClose}
      />
      <SaleOrderSummaryReport
        title="Sale Order Summary Report"
        width="800px"
        open={reportName === 'sale-order-summary-report'}
        onCancel={onClose}
      />
      <DSDSalesInvoiceReport
        salespersons={salesperson}
        title="Generate DSD Reports"
        width="700px"
        open={reportName === 'dsd-reports'}
        onCancel={onClose}
      />
      <DSDSalesInvoiceReportV1
        salespersons={salesperson}
        title="Generate a Report Merging IES and SFA"
        width="700px"
        open={reportName === 'sale-invoice-report-v1'}
        onCancel={onClose}
      />
      <DSDLeadReport
        salespersons={salesperson}
        title="Lead Report"
        width="700px"
        open={reportName === 'dsd-lead-report'}
        onCancel={onClose}
      />
      <PurchaseOrderReport
        salespersons={salesperson}
        title="Purchase Order Reports"
        width="700px"
        open={reportName === 'purchase-order-reports'}
        onCancel={onClose}
      />
      <PerformancePurchaseOrderReport
        salespersons={salesperson}
        title="Performance P.O Reports"
        width="700px"
        open={reportName === 'performance-po-report'}
        onCancel={onClose}
      />
    </div>
  );
};

export default Reports;
