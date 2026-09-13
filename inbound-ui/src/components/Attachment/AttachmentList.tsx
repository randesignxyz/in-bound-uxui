
import { downloadUploadFile } from '@/services/apiGateway'
import { AttachmentFile } from '@/services/data'
import { simpleRequestActions } from '@/services/model'
import { WorkflowServiceAPI } from '@/services/process-workflow/services'
import { Card,  CardProps,  Table } from 'antd'
import moment from 'moment'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

interface Props extends CardProps {
    force?: number;
    fileIds?: string[],
    attachmentFiles: AttachmentFile[]
}

export const AttachmentList: React.FC<Props> = ({ force, fileIds, attachmentFiles, ...rest }) => {

    const [files, setFiles] = useState<AttachmentFile[]>()
    const requestActions = simpleRequestActions()
    const workflowServices = WorkflowServiceAPI(requestActions)

    useEffect(()=> {
        if(!fileIds) return
        workflowServices.listUploadedFiles({list: fileIds}).then(items => setFiles(items))

    }, [fileIds, force])

    return <Card {...rest} size='small' >
        
        <Table<AttachmentFile>
            pagination={false}
            size='small'
            columns={[
                {
                    title: 'File Name', dataIndex: 'fileName', render: (_, it) => {
                        return <a onClick={() => downloadUploadFile()(it.id, it.fileName) } >{it.fileName}</a>
                    }
                },
                { title: 'File Type', dataIndex: 'fileType' },
                { title: 'Upload Date', render: (_, it) => {
                    return moment(it.createdDate).format("YYYY-MM-DD h:mm:ss a")
                }}
            ]}
            dataSource={files || attachmentFiles}
            rowKey='id'
        />
       
    </Card>
}

export default AttachmentList