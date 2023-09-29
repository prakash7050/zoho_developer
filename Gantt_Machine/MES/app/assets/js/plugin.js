//plugins attached
gantt.plugins({
    marker: true, //horizontal Marker
    quick_info: false, //small edit delete dialouge
    tooltip: true, //on hover description 
    drag_timeline: true, //freezed scales on scroll
});


//drag configuration
gantt.config.drag_timeline = {
    ignore: ".gantt_task_line, .gantt_task_link",
    useKey: false
};




//columns to be added
gantt.config.columns = [
    { name: "wbs", label: "WBS", width: 50, template: gantt.getWBSCode, resize: true },
    { name: "text", label: "Machines", tree: true, width: "fit-content", resize: true, min_width: 10 },
    // { name: "toggle", label: "Breakdown history",width:40 },
    { name: "add", width: 40 }
];



//milestone text render method
gantt.templates.rightside_text = function(start, end, task) {
    if (task.type == gantt.config.types.milestone)
        return task.text + " / ID: #" + task.id;
    return "";
};





//calender conffiguration
gantt.config.start_on_monday = false;
gantt.config.open_split_tasks = true;
gantt.config.scale_height = 36 * 3;






//zoom configuration
gantt.config.show_markers = true;
gantt.config.min_column_width = 100;


//zoom helper functions
let hourToStr = gantt.date.date_to_str("%H:%i");
let hourRangeFormat = function(step) {
    return function(date) {
        var intervalEnd = new Date(gantt.date.add(date, step, "hour") - 1)
        return hourToStr(date) + " - " + hourToStr(intervalEnd);
    };
};




//zoom scale configuration
var zoomConfig = {
    minColumnWidth: 100,
    maxColumnWidth: 150,



    levels: [
        [
            { unit: "hour", format: hourRangeFormat(12), step: 12  },
            { unit: "day", format: "%d %M", step: 1 },
            {
                unit: "week",
                step: 1,
                format: function(date) {
                    var dateToStr = gantt.date.date_to_str("%d %M");
                    var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                    return dateToStr(date) + " - " + dateToStr(endDate);
                }
            },
            { unit: "month", format: "%M %Y", step: 1 },
        ],
        [
            { unit: "month", format: "%M %Y", step: 1 },
            { unit: "day", format: "%d %M", step: 1 },
            { unit: "hour", format: hourRangeFormat(12), step: 12 }
        ],
        [
            { unit: "day", format: "%d %M", step: 1 },
            { unit: "hour", format: hourRangeFormat(12), step: 12 },
            { unit: "hour", format: "%H:%i", step: 1 }
        ],
        [
            { unit: "hour", format: hourRangeFormat(12), step: 12 },
            { unit: "hour", format: "%H:%i", step: 6 },
            { unit: "hour", format: "%H:%i", step: 1 }
        ],
        [
            { unit: "hour", format: "%H:%i", step: 6 },
            { unit: "hour", format: "%H:%i", step: 1 },
            { unit: "minute", format: "%H:%i", step: 30 },
        ],
    ],

    useKey: "ctrlKey",
    trigger: "wheel",
    element: function() {
        return gantt.$root.querySelector(".gantt_task");
    }
}

gantt.ext.zoom.init(zoomConfig);

gantt.config.fit_tasks = true;



//marker for today
let today = new Date();
gantt.addMarker({
    start_date: today,
    css: "today",
    text: "Today"

});
//gant initialization
gantt.init("charts");

/* 
let load_data = [
    { id: 1, text: "Office itinerancy", render: "split", type: "project", progress: 0.4, open: true, start_date: "02-04-2023 00:00:00", duration: 17, parent: 0 },
    { id: 2, text: "Office facing", render: "split", type: "project", start_date: "02-04-2023 00:00:00", duration: 5, progress: 0.6, parent: 1, open: true },
    { id: 5, text: "Interior office", type: "task", start_date: "02-04-2023 00:00:00", duration: 3, parent: 2, progress: 0.6, open: true },
    { id: 6, text: "Air conditioners check", type: "task", start_date: "05-04-2023 00:00:00", duration: 2, parent: 2, progress: 0.29, open: true },
    { id: 3, text: "Furniture installation", render: "split", type: "project", start_date: "08-04-2023 00:00:00", duration: 2, parent: 1, progress: 0.6, open: false },
    { id: 7, text: "Workplaces preparation", type: "task", start_date: "08-04-2023 00:00:00", duration: 2, parent: 3, progress: 0.6, open: true },
    { id: 4, text: "The employee relocation", render: "split", type: "project", start_date: "10-04-2023 00:00:00", duration: 9, parent: 1, progress: 0.5, open: true },
    { id: 8, text: "Preparing workplaces", type: "task", start_date: "10-04-2023 00:00:00", duration: 3, parent: 4, progress: 0.5, open: true },
    { id: 9, text: "Workplaces importation", type: "task", start_date: "13-04-2023 00:00:00", duration: 3, parent: 4, progress: 0.5, open: true },
    { id: 10, text: "Workplaces exportation", type: "task", start_date: "16-04-2023 00:00:00", duration: 3, parent: 4, progress: 0.5, open: true },
    { id: 11, text: "Product launch", render: "split", type: "project", progress: 0.6, open: true, start_date: "02-04-2023 00:00:00", duration: 17, parent: 0 },
    { id: 12, text: "Perform Initial testing", type: "task", start_date: "02-04-2023 00:00:00", duration: 5, parent: 11, progress: 1, open: true },
    { id: 13, text: "Development", render: "split", type: "project", start_date: "03-04-2023 00:00:00", duration: 16, parent: 11, progress: 0.5, open: true },
    { id: 17, text: "Develop System", type: "task", start_date: "03-04-2023 00:00:00", duration: 5, parent: 13, progress: 1, open: true },
    { id: 25, text: "Beta Release", type: "milestone", start_date: "08-04-2023 00:00:00", duration: 0, parent: 13, progress: 0, open: true },
    { id: 18, text: "Integrate System", type: "task", start_date: "08-04-2023 00:00:00", duration: 4, parent: 13, progress: 0.8, open: true },
    { id: 19, text: "Test", type: "task", start_date: "12-04-2023 00:00:00", duration: 3, parent: 13, progress: 0.2, open: true },
    { id: 20, text: "Marketing", type: "task", start_date: "15-04-2023 00:00:00", duration: 4, parent: 13, progress: 0, open: true },
    { id: 14, text: "Analysis", type: "task", start_date: "02-04-2023 00:00:00", duration: 4, parent: 11, progress: 0.8, open: true },
    { id: 15, text: "Design", render: "split", type: "project", start_date: "06-04-2023 00:00:00", duration: 6, parent: 11, progress: 0.2, open: true },
    { id: 21, text: "Design database", type: "task", start_date: "06-04-2023 00:00:00", duration: 4, parent: 15, progress: 0.5, open: true },
    { id: 22, text: "Software design", type: "task", start_date: "08-04-2023 00:00:00", duration: 4, parent: 15, progress: 0.1, open: true },
    { id: 16, text: "Documentation creation", type: "task", start_date: "11-04-2023 00:00:00", duration: 5, parent: 11, progress: 0, open: true },
    { id: 24, text: "Release v1.0", type: "milestone", start_date: "19-04-2023 00:00:00", duration: 0, parent: 11, progress: 0, open: true }
];
 */
/* let time_store = [];
load_data.forEach((element) => {

    let start_date = moment(element.start_date, "DD-MM-YYYY").toDate(),
        end_date = element.duration != null ? new Date(start_date.getTime() + (element.duration * 86400000)) : moment(element.end_date, "DD-MM-YYYY").toDate();


    time_store.push(start_date);
    time_store.push(end_date);
});


gantt.config.start_date = new Date(Math.min.apply(null, time_store));
gantt.config.end_date = new Date(Math.max.apply(null, time_store));

 */

//console.log(window.app_consumer.load_data);
/*

*/






//drag & drop configuration
$(".gantt-error").remove(); //illogical error due to fit-content width type


window.task = {};
window.task.y_movement = 0;
window.task.movement = false;
window.task.duplicate_node_ini = null;
window.task.moving = false;
window.task.drag_listner_off = () => {};
window.task.active_click = false;

//zoom available message
gantt.message({
    text: "Use <b>ctrl + mousewheel</b> in order to zoom",
    expire: 3000
});

gantt.attachEvent("onAfterTaskDrag", function(id, mode, e){
    //any custom logic here
    let task = gantt.getTask(id)
    const formData = task?.data

    // let startDate = gantt.date.parseDate(task.start_date, "%d/%m/%y");
    let startDate = moment(task?.start_date).format("DD-MMM-YYYY HH:mm:ss")
    // let endDate = gantt.date.parseDate(task.end_date, "%d/%m/%y");
    let endDate = moment(task?.end_date).format("DD-MMM-YYYY HH:mm:ss")
    if(mode === "move"){
        const day_between = moment(formData.To_Date).diff(formData.From_Date)
        endDate = moment(moment(startDate).add(day_between)).format("DD-MMM-YYYY HH:mm:ss");
        task.end_date = moment(moment(startDate).add(day_between)).format("DD-MM-YYYY HH:mm:ss");
    }
    // confirm("Do you want to be update task ?")
    window.app_consumer.update_task({...formData,parent:task.parent,[`${window.app_consumer.t_end_link_name}`]:endDate,[`${window.app_consumer.t_start_link_name}`]:startDate})
});

gantt.templates.tooltip_text = function(start,end,task){
    return "<b>Task:</b> "+task.text+"<br/><b>Duration:</b> " + moment(start).format("DD-MM-YYYY HH:mm:ss") +"<br/><b>End Date:</b> " + moment(end).format("DD-MM-YYYY HH:mm:ss");
};


/*
gantt.attachEvent("onTaskClick", function(id,e){
    //any custom logic here
    const task = gantt.getTask(id)
    const task_data = task?.data
    window.app_consumer.is_edit= false
    setTimeout(()=>{
        if(task_data && !window.app_consumer.is_edit){
            window.app_consumer.is_edit= false
            window.app_consumer.on_task_click(task_data)
        }
    },500)
});
*/
//set_app(app_name, report_name, consumables_dispaly_link_name, fetch_criteria = "")