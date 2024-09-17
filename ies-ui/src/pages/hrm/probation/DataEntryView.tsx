import { simpleRequestActions } from '@/services/model';
import { createService } from "./services";
import { Spin } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import ProbationSumbitter from '@/pages/process-flow/components/Submitter/ProbationSumbitter';
import { useForm } from 'antd/lib/form/Form';
import AppraisalInstruction from './components/AppraisalInstruction';
import { useState } from 'react';
import { AppraisalDataLookup, ProbationEvaluation } from './data.types';
import { Model } from './model';
import Section2Card from './components/Section2Card';
import Section1Table from './components/Section1Table';

type DataFormType = {
  requestorId: number;
  requestorBuId: number;
};
interface Props {
  open?: boolean;
  onOpenModalChange: (v: boolean) => void;
  refreshTable: () => void;
}


export default ({
    id,
    type,
    onBack,
  }: {
    id?: number;
    type: 'CREATE' | 'EDIT';
    onBack: () => void;
  }) => {
    const [lang, setLang] = useState<string>('ENG');
    const requestActions = simpleRequestActions();
    const services =  createService({ request: requestActions });
    const [formSubmittor] = useForm<DataFormType>();
    const [dataLookup, setDataLookup] = useState<AppraisalDataLookup[]>();
    const { actions } = Model();
    const [addedSection2, setAddedSection2] = useState<ProbationEvaluation[]>([]);
    const [addedSection1, setAddedSection1] = useState<ProbationEvaluation[]>([]);

    const onChangeLanglauge = () => {
      setLang((v) => actions.getLangauge(v));
    };
    const getLable = (key: string) => {
      var label = dataLookup?.find((it) => it.code === key);
      return lang == 'KH' ? label?.value1 : label?.value;
    };
  

  return <Spin spinning={requestActions.request?.loading || false}>
    <PageContainer title="New Probation Evaluation Request Form" onBack={() => history.back()}>
      <ProbationSumbitter
          form={formSubmittor}
          title={
            <div> this
              {/* Employee {checkingForm && <span style={{ color: 'red' }}>: {checkingForm}</span>} */}
            </div>
          }
          // onSetSubmitter={onChangeSubmitterHandler}
        />
      <AppraisalInstruction
        lang={lang}
        getLableName={getLable}
        onChangeLanglauge={onChangeLanglauge}
        appraisalPerformanceId={-1}
      />
      <ProCard title="EVALUATION" 
        collapsible  
        size="small"
        bordered headerBordered 
      >
        {/*---------------------------- SECTION I. PERFORMANCE (Weightage: 50%)----------------------------------*/}
        <div>
          <span>Please choose rating of each criterion that describes best of your employee’s performance compares to the job expectations and goals/work priorities.</span>
          <div style={{paddingTop:5}}>
            <div><b>SECTION I. PERFORMANCE (Weightage: 50%)</b></div>
            <div>What employee is expected to do/achieved during probation period.</div>
            <div><span style={{color:'red'}}>*</span> At least 3 items are required.</div>
          </div>
        </div>
        <Section1Table addedItems={addedSection1} onSetAddedItems={setAddedSection1}/>
        {/*---------------------------- SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)----------------------------------*/}
        <div>
          <div style={{paddingTop:5}}>
            <div><b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b></div>
            <div>What relevant knowledge and skills that employee possesses and applies effectively in the job.</div>
          </div>
        </div>
        <Section2Card addedItems={addedSection2} onSetAddedItems={setAddedSection2}/>
        {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
        <div>
          <div style={{paddingTop:5}}>
            <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
            <div>How employee is expected to behave in a proper manner.</div>
          </div>
        </div>

      </ProCard>  
    </PageContainer>
  </Spin>

}