import React, { useEffect, useRef } from 'react'
import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import styles from './index.less';

export interface DiagramActivity {
    id: string;
    taskId: string;
    status: 'current' | 'completed';
}

export interface DiagramData {
    xml?: string,
    status?: string;
    drawing?: {
        activities?: DiagramActivity[]
    }
}


const DiagramViewComp: React.FC<{
    drawingData?: DiagramData,
    onEventHandler?: (el?: any) => void;

}> = ({
    drawingData,
    onEventHandler
}) => {

        const container = useRef<HTMLDivElement>()

        const createView = async () => {

            if(!drawingData) return
            
            container.current?.childNodes.forEach(ite => ite.remove())
            
            const viewer = new BpmnJS({ container: '#diagram' });
            const canvas = viewer.get('canvas');
            var eventBus = viewer.get('eventBus');

            var events = [
                // 'element.hover',
                // 'element.out',
                'element.click',
                // 'element.dblclick',
                // 'element.mousedown',
                // 'element.mouseup'
            ];

            if (onEventHandler)
                events.forEach(function (event) {
                    eventBus.on(event, (e: any) => {
                        onEventHandler(e.element)
                    });
                });
            await viewer.importXML(drawingData?.xml);
        
            canvas.zoom('fit-viewport')
            drawingData?.drawing && drawingData.drawing.activities?.forEach(item => {
                canvas.addMarker(item.id, item.status =='current'?'highlight': 'highlight-done')
            })

            if(drawingData.status == 'REJECTED') {
                const els: {id: string}[] = viewer.get('elementRegistry').filter((el: { type: string; id: string; }) => el.type == 'bpmn:UserTask' &&  !drawingData.drawing?.activities?.some(it=> it.id === el.id) )
                els.forEach(it => {
                    canvas.addMarker(it.id, 'highlight-rejected')
                })
            }

        }

        useEffect(() => {
            createView().then().catch(v => console.log(v))
        }, [drawingData])

        return <div  id='diagram' ref = {container as any} className={styles.diagram}  />

    }

export default DiagramViewComp