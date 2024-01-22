import styles from './style.less';
import LogoIcon from '@/assets/main-logo.svg';
import React from 'react';
import { CashCollectionListItem, SettlementDetail } from '@/services/delivery/data';
import { formatDate, formatter } from '@/pages/utils';
import { Num2Word } from 'khmer-number-js';

export const ReceiptPrint = React.forwardRef(({ detail, selectedItem }: { detail: SettlementDetail, selectedItem: CashCollectionListItem }, ref: any) => {

    const cashCollections = detail.checkoutList.flatMap(it => it.cashCollections).filter(it => it.paymentMethod != 'NONE' && it.paymentMethod != "RECONCILE")
    const totalPaidAmount = cashCollections.map(it => it.paidAmount).reduce((p, c) => p + c, 0)

    const layout = <div>
        <table width={'100%'} >
            <tr>
                <td width={150}> <img src={LogoIcon} /> </td>
                <td align="center">
                    <div style={{ fontSize: 25, fontFamily: 'Moul', fontSizeAdjust: 'from-font' }}>បង្កាន់ដៃទទួលប្រាក់</div>
                    <div style={{ fontSize: 20, fontSizeAdjust: 'from-font' }}>OFFICIAL RECEIPT</div>

                </td>
                <td width={250}>
                    <table width={'100%'} style={{ border: 0, fontSize: 15 }}>
                        <tr>
                            <td align='right'>លេខរៀង/Receipt No :</td>
                            <td width={90} style={{ borderBlockStyle: 'dotted', borderTopWidth: 0, borderBottomWidth: 1 }} ></td>
                        </tr>
                        <tr>
                            <td align='right'>កាលបរិច្ឆេត/Date :</td>
                            <td width={90} style={{ borderBlockStyle: 'dotted', borderTopWidth: 0, borderBottomWidth: 1 }} > {formatDate(detail.settledDate)}</td>
                        </tr>
                    </table>
                </td>

            </tr>
            <tr>
                <td colSpan={3}>
                    <table style={{ border: 0, fontSize: 13 }}>
                        <tr>
                            <td width={150} align='right' >
                                បានទទួលពី<br />
                                Received from
                            </td>
                            <td><input style={{ height: '30px', width: '230px' }} type={'text'} value={[selectedItem.delivery.driver.firstName, selectedItem.delivery.driver.lastName].join(" ")} /></td>
                            <td align='left' colSpan={3}>
                                <input type={'checkbox'} name='cash' checked={cashCollections.some(it => it.paymentMethod == 'CASH')} /> <label htmlFor='cash' >Cash</label>
                                <input type={'checkbox'} name='aba' checked={cashCollections.some(it => it.paymentMethod == 'BANK' && it.bank == 'ABA')} /> <label htmlFor='aba'>ABA</label>
                                <input type={'checkbox'} name='wing' checked={cashCollections.some(it => it.paymentMethod == 'BANK' && it.bank == 'WING')} /> <label htmlFor='wing'>Wing</label>
                                <input type={'checkbox'} name='trueMoney' checked={cashCollections.some(it => it.paymentMethod == 'BANK' && it.bank == 'TRUE_MONEY')} /> <label htmlFor='trueMoney'>True Money</label>
                            </td>
                        </tr>
                        <tr>
                            <td width={150} align='right' >
                                ចំនួនទឹកប្រាក់ជាលេខ<br />
                                Amount received
                            </td>
                            <td ><input style={{ height: '30px', width: '230px' }} type={'text'} value={formatter.format(totalPaidAmount)} /></td>
                            <td><input type={'checkbox'} name='cheque' checked={cashCollections.some(it => it.paymentMethod == 'CHEQUE')} /> <label htmlFor='cheque'>Cheque No</label></td>
                            <td><input style={{ height: '30px', width: '100px', }} type={'text'} value={cashCollections.find(it => it.paymentMethod == 'CHEQUE')?.ref || ''} /></td>
                            <td><input style={{ height: '30px', width: '80px' }} type={'text'} value={`Bank: ${cashCollections.find(it => it.paymentMethod == 'CHEQUE')?.bank || ''}`} /></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input style={{ height: '30px', width: '230px' }} type={'text'} /></td>
                            <td><input type={'checkbox'} name='ref' checked={cashCollections.some(it => it.paymentMethod !== 'CHEQUE' && it.ref != null)} /> <label htmlFor='ref'>Ref.  No</label></td>
                            <td colSpan={2}><input style={{ height: '30px', width: '190px' }} type={'text'} value={cashCollections.find(it => it.paymentMethod !== 'CHEQUE' && it.ref != null)?.ref || ''} /></td>
                        </tr>
                        <tr>
                            <td width={150} align='right' >
                                ចំនួនទឹកប្រាក់ជាអក្សរ<br />
                                In words
                            </td>
                            <td colSpan={4}><input style={{ height: '30px', width: '530px' }} type={'text'} value={`${Num2Word(totalPaidAmount.toString(), "")} ដុល្លា`} /></td>

                        </tr>
                        <tr>
                            <td width={150} align='right' >
                                សម្រាប់<br />
                                In payment of
                            </td>
                            <td colSpan={4}><input style={{ height: '60px', width: '530px' }} type={'text'} /></td>
                        </tr>

                    </table>
                </td>
            </tr>
            <tr>
                <td colSpan={3} align='center'>
                    <table style={{ border: 0, fontSize: 15 }}>
                        <tr >
                            <td align='center'>អ្នកបង់ប្រាក់ / Payer</td>
                            <td align='center'>ទទួលប្រាក់ដោយ / Collector</td>
                            <td align='center'>បេឡា / CoCashier</td>
                            <td align='center'>គណនេយ្យ / Account</td>
                        </tr>
                        <tr>
                            <td><input style={{ height: '30px', width: '165px' }} type={'text'} /></td>
                            <td><input style={{ height: '30px', width: '165px' }} type={'text'} /> </td>
                            <td><input style={{ height: '30px', width: '165px' }} type={'text'} /></td>
                            <td><input style={{ height: '30px', width: '165px' }} type={'text'} /></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
    return <span style={{ visibility: 'hidden' }}>
        <div ref={ref}>
            {layout}
            <br />
            <br />
            <br />
            <hr style={{ borderBlockStyle: 'dashed', borderBlockColor: 'gray' }} />
           
            {layout}
            
            
        </div>
    </span>
})