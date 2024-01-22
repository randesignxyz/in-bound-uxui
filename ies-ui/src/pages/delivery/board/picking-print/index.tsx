import { InstanceDetail } from "@/services/delivery/instance.types";
import React from "react";
import LogoIcon from '@/assets/main-logo.svg';
import styles from './../style.less';
import { formatDate } from "@/pages/utils";
import moment from "moment";
import { sumBy, uniq } from "lodash";
import { Data } from "@react-google-maps/api";

export const PickingSlipToPrint = React.forwardRef((props: { data: InstanceDetail }, ref: any) => {

    const getEndLoadingDate = () => {

        const assignDate = moment(props.data.loading.assignedDate)
        const expectedEndDate = assignDate.clone().add(3, 'hour')
       if(expectedEndDate.get('date') ==  assignDate.get('date')) {
        return props.data.loading.assignedDate
       }
       return undefined
    }

    const report = (warehouse: string, index: number) => {
        const pickingItems = (props.data.loadingInfo?.newItems.length || 0) > 0 ? props.data.loadingInfo?.newItems : props.data.loadingInfo?.items
        const items = pickingItems?.filter(it => it.whsCode == warehouse)
        const total = sumBy(items?.map(it => it.qty) || [])

        const driverName = props.data.loadingInfo?.truckTransfer?.driverName || [props.data.driver.firstName, props.data.driver.lastName].join(" ")
        const truck = props.data.loadingInfo?.truckTransfer?.licensePlate || props.data.loading.truck.licensePlate
        return (
            <div style = {{fontSize: 13}}>
                {index > 0 && <h1 />}
                <table width={'100%'} className={styles.headerTitle}  >
                    <tr>
                        <td width={150}> <img src={LogoIcon} /> </td>
                        <td align="center">
                            <h3>One Fraternity Co., Ltd.</h3>
                            <div># 888K St.598, Sangkat Toul Sangke,</div>
                            <div>Khan Russey Keo, Phnom Penh, Cambodia. Tel: 023 864-333</div>
                        </td>
                        <td width={150}></td>
                    </tr>
                    <tr >
                        <td className={styles.seperate} align="center" colSpan={3}> <h4 >Picking Slip</h4> </td>
                    </tr>
                    <tr>
                        <td colSpan={3}>
                            <table width={'100%'}>
                                <tr>
                                    <td align="right" width={90} >Driver Name :</td>
                                    <td width={140}><input type={'text'} value={driverName} /> </td>
                                    <td align="right" width={90}>Truck Plate# :</td>
                                    <td width={140}> <input type={'text'} value={truck} /> </td>
                                    <td width={110} align="right">Depo :</td>
                                    <td  width={140} style={{borderBottomStyle: 'dotted', borderBottomWidth:1}}></td>
                                </tr>
                                <tr>
                                    <td align="right" >From Date :</td>
                                    <td><input type={'text'} value={formatDate(moment(props.data.loading.assignedDate))} /> </td>
                                    <td align="right">To Date :</td>
                                    <td><input type={'text'} value={  formatDate(getEndLoadingDate())} /> </td>
                                    <td align="right">Loading Started :</td>
                                    <td  style={{borderBottomStyle: 'dotted', borderBottomWidth:1}}></td>
                                </tr>
                                <tr>
                                    <td width={70}></td>
                                    <td></td>
                                    <td align="right">Shift :</td>
                                    <td><input type={'text'} value={props.data.loadingInfo?.shift} /></td>
                                    <td align="right">Loading Ended :</td>
                                    <td   style={{borderBottomStyle: 'dotted', borderBottomWidth:1}}></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table className={styles.dataTable} style={{ border: '1px', borderStyle: 'solid', marginTop: 5 }}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Item Code</th>
                            <th>Description</th>
                            <th>UoM</th>
                            <th align="right"  >Qty</th>
                            <th>Batch Number</th>
                            <th>Warehouse</th>
                            <th>Other</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items?.filter(it => it.whsCode == warehouse).map((it, index) => (<tr>
                            <td align="right"> {index + 1}</td>
                            <td> {it.itemCode}</td>
                            <td> {it.itemDescription}</td>
                            <td> {it.uom}</td>
                            <td width={50} align='right'> {it.qty}</td>
                            <td>{it.batchNum || ''}</td>
                            <td >{it.whsCode}</td>
                            <td width={120}></td>
                        </tr>))}
                    </tbody>
                    <tfoot>
                        <th colSpan={4}> Total </th>
                        <th align="right">{total}</th>
                    </tfoot>
                </table>

                <table width={'100%'} style={{ marginTop: 10 }}>
                    <tr>
                        <td align="center">Prepared By</td>
                        <td align="center">Issued By</td>
                        <td align="center">Received By</td>
                    </tr>
                </table>
            </div>
        )
    }
    return (
        <span style={{ visibility: 'hidden' }}>
            <div ref={ref}>
                {uniq((props.data.loadingInfo?.changeRequestPending ? props.data.loadingInfo.newItems : props.data.loadingInfo?.items)?.map(it => it.whsCode)).map((it, index) => report(it || '', index))}
                <h1 />
            </div>

        </span>
    );
});