import useModalVisible from '@/hooks/useModalVisible'
import React, { useEffect } from 'react'
import DeliveryDetailReport from './components/DeliveryDetailReport'

export type ReportModalName = 'deliveryDetailReport' | 'none'

const DeliveryReport: React.FC<{
    reportName: ReportModalName,
    forceUpdate: number;
}> = ({ reportName, forceUpdate }) => {
    const modalVisibility = useModalVisible<ReportModalName, string>({ deliveryDetailReport: false, 'none': false })

    useEffect(() => {
        modalVisibility.show(reportName)
    }, [reportName, forceUpdate])

    
    return <div>
    
        <DeliveryDetailReport
            visible={modalVisibility.modalName.deliveryDetailReport}
            onHide={() => modalVisibility.hide('deliveryDetailReport')}
            onCompleted={() => { }}
            item={modalVisibility.data || ''}
        />
    </div>
}

export default DeliveryReport