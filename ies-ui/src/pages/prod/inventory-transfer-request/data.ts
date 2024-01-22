export type TransferRequestListItem = {
    id: number;
    code: String,
}


export type TransferRequestSearchParams = {
    keyword?: string,
    status?: string,
}

export type TransferRequestItem = {
    id?: number;
}

export type TransferRequestSavePayload = {
    id?: number;
}

export type TransferRequestDetail = {
    id: number;
}