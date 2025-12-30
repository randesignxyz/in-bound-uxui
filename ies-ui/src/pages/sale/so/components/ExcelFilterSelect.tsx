import { CrmServices } from '@/pages/crm/services';
import { ProFormCascader } from '@ant-design/pro-components';
import { useRef } from 'react';

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
    onChange?: (values: number[], options: SaleAreaOption[]) => void;
    onInit?: (values: number[], options: SaleAreaOption[]) => void;
}

const ExcelSaleAreaFilter: React.FC<ExcelSaleAreaFilterProps> = ({
    name = 'saleArea',
    width = 180,
    form,
    requestActions,
    onChange,
    onInit,
}) => {
    const optionsRef = useRef<SaleAreaOption[]>([]);

    return (
        <ProFormCascader
            name={name}
            width={width}
            request={async () => {
                const res = await CrmServices.listSaleAreas().query(
                    requestActions
                ) as unknown as {
                    divisionId: number;
                    divisionName: string;
                    defaultFlag: number;
                }[];

                const options: SaleAreaOption[] = res.map(o => ({
                    value: o.divisionId,
                    label: o.divisionName,
                    default: o.defaultFlag,
                }));

                optionsRef.current = options;

                // ✅ default selected (Excel style)
                const defaultValues = options
                    .filter(o => o.default === 1)
                    .map(o => o.value);

                const defaultPaths = defaultValues.map(v => [v]);

                form.setFieldsValue({ [name]: defaultPaths });
                onInit?.(defaultValues, options.filter(o => o.default === 1));

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
                    const realOptions = optionsRef.current;
                    const realValues = realOptions.map(o => o.value);

                    const hasAllClicked = values.includes(ALL_VALUE);
                    const selectedValues = values.filter(v => v !== ALL_VALUE);

                    // 1️⃣ Click Select All
                    if (hasAllClicked) {
                        const isAllSelected =
                            selectedValues.length === realValues.length;

                        if (!isAllSelected) {
                            // select all
                            const allPaths = realValues.map(v => [v]);
                            form.setFieldsValue({ [name]: allPaths });
                            onChange?.(realValues, realOptions);
                        } else {
                            // clear all
                            form.setFieldsValue({ [name]: [] });
                            onChange?.([], []);
                        }
                        return;
                    }

                    // 2️⃣ Manual clear
                    if (paths.length === 0) {
                        onChange?.([], []);
                        return;
                    }

                    // 3️⃣ Normal select / deselect
                    const selectedOptions = realOptions.filter(o =>
                        selectedValues.includes(o.value)
                    );

                    onChange?.(selectedValues, selectedOptions);
                },
            }}
        />
    );
};

export default ExcelSaleAreaFilter;
