import RetailerReports from './RetailerReports';

interface Props {
  reportName?: ReportName;
  onClose: () => void;
}

export type ReportName = 'retailer-reports';

const Reports: React.FC<Props> = ({ reportName, onClose }) => {
  return (
    <div>
      <RetailerReports
        title="Retailer Reports"
        width="700px"
        open={reportName === 'retailer-reports'}
        onCancel={onClose}
      />
    </div>
  );
};

export default Reports;
