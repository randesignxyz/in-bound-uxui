export type ActionData = {
    icon?: React.ReactElement,
    label?: string;
    key: string;
    seperator?: boolean;
    visible?: boolean;
    type?: 'Primary' | 'Danger' 
    main?: boolean;
    onClick?: (id: number) => void;
}