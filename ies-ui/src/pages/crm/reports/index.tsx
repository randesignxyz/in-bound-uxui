import ExportCustomer from './ExportCustomer';
import PosmReport from './PosmReport';
import ProductivityReport from './ProductivityReport';
import StockCountReport from './StockCountReport';
import VisitScheduleReport from './VisitScheduleReport';

interface Props {
  reportName?: ReportName;
  onClose: () => void;
}

export type ReportName =
  | 'visit-schedule'
  | 'posm-report'
  | 'stock-count-report'
  | 'productivity-report'
  | 'export-customer'
  | 'customer-detail'
  | 'agreement-compliance-report'
  | 'posm-monitoring-report'

const Reports: React.FC<Props> = ({ reportName, onClose }) => {
  return (
    <div>
      <VisitScheduleReport
        title="Customer Visit Schedule Report"
        width="600px"
        open={reportName == 'visit-schedule'}
        onCancel={onClose}
      />
      <PosmReport
        title="POSM Report"
        width="600px"
        open={reportName == 'posm-report'}
        onCancel={onClose}
      />

      <StockCountReport
        title="Stock Count Report"
        width="600px"
        open={reportName == 'stock-count-report'}
        onCancel={onClose}
      />

      <ProductivityReport
        title="Call Productivity Report"
        width="600px"
        open={reportName == 'productivity-report'}
        onCancel={onClose}
      />

    <ExportCustomer 
        title='Export Customer'
        open = {reportName == 'export-customer'}
        onCancel={onClose}
        width="600px"
        reportType='export-customer'
      />
      <ExportCustomer 
        title='Customer Detail Report'
        open = {reportName == 'customer-detail'}
        onCancel={onClose}
        width="600px"
        reportType= 'customer-report'
      />
    </div>
  );
};

export default Reports;
