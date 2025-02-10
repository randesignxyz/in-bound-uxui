import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { useEffect, useState } from 'react';
import DSDLeadReport from './DSDLeadReport';
import DSDSalesInvoiceReport from './DSDSalesInvoiceReport';
import PurchaseOrderReport from './PurchaseOrderReport';
import { DSDReportAPI } from './service';
import SaleOrderReport from './SaleOrderReport';

interface Props {
  reportName?: ReportName;
  onClose: () => void;
}

export type ReportName =
  | 'sale-order-report'
  | 'dsd-reports'
  | 'dsd-lead-report'
  | 'visit-report'
  | 'purchase-order-reports';

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
      <SaleOrderReport
        title="Sale Order Report"
        width="800px"
        open={reportName === 'sale-order-report'}
        onCancel={onClose}
      />
      <DSDSalesInvoiceReport
        salespersons={salesperson}
        title="Generate DSD Reports"
        width="700px"
        open={reportName === 'dsd-reports'}
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
    </div>
  );
};

export default Reports;
