
import { Breakpoint, Descriptions } from 'antd'
import React from 'react'


export interface DescriptionDisplayDataItem {
    label: string, value: string | number | undefined, tag?: (value: string | number | undefined) => React.ReactNode;
    onClick?: () => void
}

interface Props {
    data: (DescriptionDisplayDataItem | undefined)[],
    column?: number | Partial<Record<Breakpoint, number>>;
    title?: string;
}

const DescriptionDisplay: React.FC<Props> = ({ data, column, title }) => {
    return <Descriptions title={title} column={column} contentStyle={{ fontWeight: 'bold' }}>
        {data.filter(it => it).map((it, index) => <Descriptions.Item  label={it?.label} key={`desc_${index}`}> 
         { it?.onClick && <a onClick = {() => it.onClick?.() }>{it?.value}</a> } 
         { !it?.onClick && (it?.tag === undefined) && it?.value} 
         { !it?.onClick && it?.tag && it?.tag(it.value)} 
        </Descriptions.Item>)}
    </Descriptions>
}

export default DescriptionDisplay