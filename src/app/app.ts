import { Schedule, Month, PopupOpenEventArgs } from '@syncfusion/ej2-schedule';
import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';

/**
 * Inject only month view alone here
*/
Schedule.Inject(Month);


   interface TemplateFunction extends Window {
     getImage?: Function;
     getName?: Function;
   }

// Template function call   
 (window as TemplateFunction).getImage = (value: number) => {
     return (value === 1) ? 'air1' : (value === 2) ? 'air2' : 'air3';
 };

 (window as TemplateFunction).getName=(value:number)=>{
     return (value === 1) ? 'Airways 1' : (value === 2) ? 'Airways 2' : 'Airways 3';
 };

/**
 * Schedule defined with readonly mode as we are simply displaying the fare details and no interactions on it
*/
    let scheduleObj: Schedule = new Schedule({
        height: '550px',
        views: ['Month'],
        readonly: true,
        selectedDate: new Date(2018, 3, 1),
        showHeaderBar: false,
        eventSettings: {
            template: "#apptemplate",
            dataSource: generateEvents(),
            fields: {
                id: {name:"Id"},
                startTime: {name: "Departure"},
                endTime: {name:"Arrival"},
                subject: {name:"Fare"}
            }
        },
		popupOpen: (args: PopupOpenEventArgs) => {
			args.cancel = true;
		},
        dataBound: () => {
            let eventCollections: Object[] = scheduleObj.getCurrentViewEvents();
            eventCollections.sort((a: { [key: string]: Object }, b: { [key: string]: Object }) =>
                ((<number>a.Fare) - (<number>b.Fare)));
            let indexDate: Date = new Date((<Date>(<{ [key: string]: Object }>eventCollections[0]).Departure).getTime());
            indexDate.setHours(0, 0, 0, 0);
            let index: number = scheduleObj.getIndexOfDate(scheduleObj.activeView.renderDates, indexDate);
            let target: HTMLElement = scheduleObj.element.querySelectorAll('.e-work-cells')[index] as HTMLElement;
            target.style.background = '#FFFBDF';
        }
    });
    scheduleObj.appendTo('#Schedule');

    function generateEvents(): Object[] {
        let collections: Object[] = [];
        let dataCollections: { [key: string]: Object }[] = [
            {
                Id: 100,
                Departure: new Date(2018, 3, 1, 8, 30),
                Arrival: new Date(2018, 3, 1, 10, 0),
                AirlineId: 1
            }, {
                Id: 102,
                Departure: new Date(2018, 3, 1, 11, 0),
                Arrival: new Date(2018, 3, 1, 12, 0),
                AirlineId: 2
            }, {
                Id: 103,
                Departure: new Date(2018, 3, 1, 14, 0),
                Arrival: new Date(2018, 3, 1, 15, 0),
                AirlineId: 3
            }
        ];
        let start: Date = new Date(2018, 3, 1);
        let dateCollections: Date[] = Array.apply(null, { length: 30 })
            .map((value: number, index: number) => { return new Date(start.getTime() + (1000 * 60 * 60 * 24 * index)); });
        let id: number = 1;
        let day: number = 0;
        for (let date of dateCollections) {
            let resource: number = 1;
            for (let data of dataCollections) {
                let strDate: Date = new Date((<Date>data.Departure).getTime());
                let endDate: Date = new Date((<Date>data.Arrival).getTime());
                collections.push({
                    Id: id,
                    Departure: new Date(strDate.setDate(strDate.getDate() + day)),
                    Arrival: new Date(endDate.setDate(endDate.getDate() + day)),
                    AirlineId: resource,
                    Fare: ((Math.random() * 500) + 100).toFixed(2)
                });
                resource += 1;
                id += 1;
            }
            day += 1;
        }
        let filteredCollection: Object[] = filterByFare(start, dateCollections, collections);
        return filteredCollection;
    }

     function filterByFare(start: Date, dateCollections: Date[], appointments: Object[]): Object[] {
        let finalData: Object[] = [];
        for (let date of dateCollections) {
                let strTime: Date = new Date(+date);
                let endTime: Date = new Date(new Date(strTime.getTime()).setHours(23, 59, 59, 59));
                let predicate: Predicate = new Predicate('Departure', 'greaterthanorequal', strTime).
                    and(new Predicate('Arrival', 'greaterthanorequal', strTime)).
                    and(new Predicate('Departure', 'lessthan', endTime)).
                    or(new Predicate('Departure', 'lessthanorequal', strTime).
                    and(new Predicate('Arrival', 'greaterthan', strTime)));
                let filteredEvents: Object[] = new DataManager({ json: appointments }).executeLocal(new Query().where(predicate));
                let perDayData: Object[] = filteredEvents;
                if (perDayData.length > 0) {
                    perDayData.sort((a: { [key: string]: Object }, b: { [key: string]: Object }) => ((<number>a.Fare) - (<number>b.Fare)));
                    finalData.push(perDayData[0]);
                }
        }
        return finalData;
    }