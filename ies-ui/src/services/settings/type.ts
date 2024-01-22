export type SettingServiceName ='list-bu'
    | 'add-bu'
    | 'save-bu'
    | 'find-bu'


export type InitSettingParamsType  = {
    actionName: 'list-bu',
    responseKey: 'buList';
    payload: {}
}