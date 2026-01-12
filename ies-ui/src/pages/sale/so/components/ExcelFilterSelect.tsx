import { CrmServices } from '@/pages/crm/services';
import { ProFormCascader } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';

const ALL_VALUE = 0;

export interface SaleAreaOption {
    value: number;
    label: string;
    default: number;
}

interface ExcelSaleAreaFilterProps {
    name?: string;
    width?: number;
    form: any;
    requestActions: any;

    /** callbacks */
    onChange?: (values: number[], options: SaleAreaOption[]) => void;
    onInit?: (values: number[], options: SaleAreaOption[]) => void;

    /** ✅ new reusable control */
    isSelectAll?: boolean;
    onSelectAllChange?: (v: boolean) => void;
}

const ExcelSaleAreaFilter: React.FC<ExcelSaleAreaFilterProps> = ({
    name = 'saleArea',
    width = 180,
    form,
    requestActions,
    onChange,
    onInit,
    isSelectAll,
    onSelectAllChange,
}) => {
    const optionsRef = useRef<SaleAreaOption[]>([]);
    const initializedRef = useRef(false);
    console.log(isSelectAll);

    /* ================================
     * External Select All controller
     * ================================ */
    useEffect(() => {
        if (!initializedRef.current) return;

        const options = optionsRef.current;
        const realValues = options.map(o => o.value);

        if (isSelectAll === true) {
            form.setFieldsValue({
                [name]: realValues.map(v => [v]),
            });
            onChange?.(realValues, options);
        }

        if (isSelectAll === false) {
            form.setFieldsValue({ [name]: [] });
            onChange?.([], []);
        }
    }, [isSelectAll]);

    return (
        <ProFormCascader
            name={name}
            width={width}
            request={async () => {
                const res = (await CrmServices.listSaleAreas().query(
                    requestActions
                )) as unknown as {
                    divisionId: number;
                    divisionName: string;
                    defaultFlag: number;
                }[];
                const formatDivisionName = (name: string) => {
                    const match = name.match(/^S&D Area\s*(\d+)$/);
                    if (match) {
                        return `A${match[1].padStart(2, '0')}`;
                    }
                    return name; // fallback for other names
                };

                const options: SaleAreaOption[] = res.map(o => ({
                    value: o.divisionId,
                    label: formatDivisionName(o.divisionName),
                    default: o.defaultFlag,
                }));

                optionsRef.current = options;

                /** default (Excel style) */
                const defaultValues = options
                    .filter(o => o.default === 1)
                    .map(o => o.value);

                if (defaultValues.length) {
                    form.setFieldsValue({
                        [name]: defaultValues.map(v => [v]),
                    });
                    onInit?.(
                        defaultValues,
                        options.filter(o => o.default === 1),
                    );
                }

                initializedRef.current = true;

                return [
                    { value: ALL_VALUE, label: 'Select All' },
                    ...options,
                ];
            }}
            fieldProps={{
                multiple: true,
                maxTagCount: 'responsive',

                onChange: (paths: number[][] = []) => {
                    const values = paths.map(p => p[0]);
                    const options = optionsRef.current;
                    const realValues = options.map(o => o.value);

                    const hasAll = values.includes(ALL_VALUE);
                    const selectedValues = values.filter(v => v !== ALL_VALUE);

                    /** 1️⃣ Select All clicked */
                    if (hasAll) {
                        const isAllSelected =
                            selectedValues.length === realValues.length;

                        if (!isAllSelected) {
                            form.setFieldsValue({
                                [name]: realValues.map(v => [v]),
                            });
                            onChange?.(realValues, options);
                            onSelectAllChange?.(true);
                        } else {
                            form.setFieldsValue({ [name]: [] });
                            onChange?.([], []);
                            onSelectAllChange?.(false);
                        }
                        return;
                    }

                    /** 2️⃣ Manual clear */
                    if (paths.length === 0) {
                        onChange?.([], []);
                        onSelectAllChange?.(false);
                        return;
                    }

                    /** 3️⃣ Normal select */
                    const selectedOptions = options.filter(o =>
                        selectedValues.includes(o.value),
                    );

                    onChange?.(selectedValues, selectedOptions);

                    /** sync Select All checkbox */
                    onSelectAllChange?.(
                        selectedValues.length === realValues.length,
                    );
                },
            }}
        />
    );
};

export default ExcelSaleAreaFilter;
