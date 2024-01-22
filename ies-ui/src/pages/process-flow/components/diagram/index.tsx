import React from 'react'
import { Modal, Spin } from 'antd'
import { UserDestItem } from '@/services/process-workflow/data'
import DiagramViewComp, { DiagramData } from '../bpmn-viwer'

export interface DiagramModalProps {
    loading?: boolean;
    diagramData?: DiagramData;
    visible?: boolean;
    userDestList?: UserDestItem[];
    onCancel?: () => void;
    onShowUserDest?: (id: string) => void;
}

const DiagramModal: React.FC<DiagramModalProps> = ({ loading, visible, userDestList, onCancel, diagramData, onShowUserDest }) => {

    const onEventHandler = (e: { type: any; id: any }) => {
        const { type, id } = e
        if (type == 'bpmn:UserTask') {
            const taskId = diagramData?.drawing?.activities?.find(it => it.id == id)?.taskId
            taskId && onShowUserDest?.(taskId)

        }
    }
    return <>
        <Modal

            styles={{
                body: {
                    backgroundColor: '#fafafa'
                }
            }}
            centered
            title={'BPMN Diagram'}
            width={'100%'}
            destroyOnClose
            onCancel={onCancel}
            footer={null}
            open={visible}>
            <Spin spinning={loading}>
                <DiagramViewComp onEventHandler={onEventHandler} drawingData={diagramData} />
            </Spin>
        </Modal>

    </>
}

export default DiagramModal