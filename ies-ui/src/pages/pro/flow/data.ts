import { Position } from "reactflow"

export type FlowNode = {
    id: string,
    type: string,
    level: number;
    seq: number;
    data: any,
    sourcePosition?: Position
    targetPosition?: Position
    current: boolean;
    selected: boolean
}



export type FlowEdge = {
    id: string
    source: string
    target: string
    animated: boolean
    label?: string
}

export type FlowData = {
    nodes: FlowNode[];
    edges: FlowEdge[]
}

export type FlowNodeType = 'PR' | 'PQ' | 'QC' | 'PO'