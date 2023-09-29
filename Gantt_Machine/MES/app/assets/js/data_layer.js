function set_app(app_name,
    c_report_name, c_consumables_dispaly_link_name, c_fetch_criteria = "",
    t_report_name, t_consumables_dispaly_link_name, t_fetch_criteria = "",
    t_start_link_name, t_end_link_name, fetch_from, fetch_till, creator_date_format,
    line_conversion_function, consumable_timeline_relation, zoom_frame,
    t_form_name, fetch_functions,task_dbl_click,update_task,onTaskClick,is_other_task,other_project_key,otherTaskDetails
) {

    window.app_consumer = {};
    window.app_consumer.app_name = app_name;
    window.app_consumer.c_report_name = c_report_name;
    window.app_consumer.c_cdlm = c_consumables_dispaly_link_name;
    window.app_consumer.c_fetch_criteria = c_fetch_criteria;
    window.app_consumer.t_report_name = t_report_name;
    window.app_consumer.t_cdlm = t_consumables_dispaly_link_name;
    window.app_consumer.t_start_link_name = t_start_link_name;
    window.app_consumer.t_end_link_name = t_end_link_name;
    window.app_consumer.creator_date_format = creator_date_format;
    window.app_consumer.line_conversion_function = line_conversion_function;
    window.app_consumer.consumable_timeline_relation = consumable_timeline_relation;
    window.app_consumer.zoom_frame = zoom_frame;
    window.app_consumer.fetch_from = fetch_from != null ? fetch_from : moment().startOf('month').format("YYYY-MM-DD");
    window.app_consumer.fetch_till = fetch_till != null ? fetch_till : moment().endOf('month').format("YYYY-MM-DD");
    window.app_consumer.time_frame = `(${t_start_link_name} >= "${window.app_consumer.fetch_from}" || ${t_end_link_name} <= "${window.app_consumer.fetch_till}")`;
    window.app_consumer.t_fetch_criteria = t_fetch_criteria;
    window.app_consumer.task_dbl_click = (gantt_task) => taskForm(window.app_consumer.t_report_name, gantt_task);
    window.app_consumer.get_fetch_frame = () => {
        return window.app_consumer.t_fetch_criteria == "" ? window.app_consumer.time_frame : `(${window.app_consumer.t_fetch_criteria} && ${window.app_consumer.time_frame})`;
    };
    window.app_consumer.t_form_name = t_form_name;
    window.app_consumer.fetch_functions = fetch_functions;
    window.app_consumer.update_task = update_task;
    window.app_consumer.on_task_click = onTaskClick;
    window.app_consumer.is_other_task = is_other_task || false
    window.app_consumer.other_project_key = other_project_key
    window.app_consumer.other_task_details = otherTaskDetails;




    first_load();
    getAllData()
}


async function first_load() {

    try {

        let consumables_data = await fetch_consumables()
            consumables_filtered = await parse_consumables(consumables_data)
            let timeline_data = await fetch_timeline()
           let gantt_timeline_data = []
            if(window.app_consumer.is_other_task){
                let all_time_data = []
                for(const key of window.app_consumer.other_project_key){
                    const findDetails = window.app_consumer.other_task_details.find(details=>details.key===key)
                    let tmeLineDetails= {}
                    if(findDetails){
                        const otherDetails = await get_other_timeline(findDetails)
                        tmeLineDetails = await gantt_parse_timeline(otherDetails,key)
                        tmeLineDetails = tmeLineDetails.map(timeLine=>{return {...timeLine,color:'red'}})
                    }else{
                        tmeLineDetails = await gantt_parse_timeline(timeline_data,key)
                    }
                    
                    all_time_data.push(...tmeLineDetails)
                }
                gantt_timeline_data = all_time_data;
            }else{
                gantt_timeline_data = await gantt_parse_timeline(timeline_data,"")
            }
            window.app_consumer.gantt_timeline_data = gantt_timeline_data;
            gantt_consumables_data = await gantt_parse_consumables(consumables_filtered);
        window.app_consumer.load_data = gantt_consumables_data.concat(gantt_timeline_data);

        gantt.parse({
            data:gantt_consumables_data.concat(gantt_timeline_data)
        });
        lightboxConfig()


    } catch (error) {

    }





}


function set_gantt_start_end() {

    gantt.config.start_date = window.app_consumer.load_start_point.toDate();
    gantt.config.end_date = window.app_consumer.load_start_point.toDate();
}

async function gantt_parse_consumables(consumables) {

    let gantt_consumable = [];


    Object.keys(consumables).forEach((consumables_zid,i) => {

        gantt_consumable.push({
            id: consumables_zid,
            text: consumables[consumables_zid],
            render: "split",
            type: "project",
            start_date: window.app_consumer.load_start_point.format("DD-MM-YYYY 00:00:00"),
            end_date: window.app_consumer.load_end_point.format("DD-MM-YYYY 23:59:59"),
            parent: 0,
            progress: 0,
            open: true
        });
        if(window.app_consumer.is_other_task && window.app_consumer.other_project_key.length !==0){
            for(const key of window.app_consumer.other_project_key){
                gantt_consumable.push({
                id: `${key} #${consumables_zid}`,
                text:`${key} #${consumables_zid}`,
                render: "split",
                type: "project",
                start_date: window.app_consumer.load_start_point.format("DD-MM-YYYY 00:00:00"),
                end_date: window.app_consumer.load_end_point.format("DD-MM-YYYY 23:59:59"),
                parent: consumables_zid,
                progress: 0,
                open: false
            });
            }
        }
    });

    return gantt_consumable;


}




async function gantt_parse_timeline(timeline,label="") {

    /* consumables = {zid: consumable_name}
     */

    let gantt_consumable = [],
        timeline_points = [];


    let timeList = [];
    let dayAvg = 0;
    let count = 0;
    let totalDay = 0;
    $.each(timeline.data, (index, slot_data) => {
        let start_date = moment(slot_data[window.app_consumer.t_start_link_name], window.app_consumer.creator_date_format),
            end_date = moment(slot_data[window.app_consumer.t_end_link_name], window.app_consumer.creator_date_format),
            line_text = window.app_consumer.line_conversion_function(slot_data,label);
           
        if (slot_data[window.app_consumer.t_start_link_name] != ""
             && slot_data[window.app_consumer.t_end_link_name] != ""
            && !line_text.includes("undefined")) {
            gantt_consumable.push({
                id: slot_data.ID,
                text: line_text,
                type: "task",
                start_date: start_date.format("DD-MM-YYYY HH:mm:ss"),
                end_date: end_date.format("DD-MM-YYYY HH:mm:ss"),
                parent:label ? `${label} #${window.app_consumer.consumable_timeline_relation(slot_data)}` : window.app_consumer.consumable_timeline_relation(slot_data),
                progress: 0,
                open: true,
                fieldTypes:Object.keys(slot_data),
                data:slot_data,
                // color:"red"
            });
            totalDay = totalDay + Number(end_date.diff(start_date, 'days'))




            timeline_points.push(start_date.toDate());
            timeline_points.push(end_date.toDate());

        }


    });
    
    



    let min_timeline_point = Math.min.apply(null, timeline_points),
        max_timeline_point = Math.max.apply(null, timeline_points);
    window.app_consumer.load_start_point = moment(min_timeline_point).startOf(window.app_consumer.zoom_frame);
    window.app_consumer.load_end_point = moment(max_timeline_point).endOf(window.app_consumer.zoom_frame);



    return gantt_consumable;




}


async function fetch_timeline() {


    try {

        await ZOHO.CREATOR.init();


        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: window.app_consumer.t_report_name,
            criteria: window.app_consumer.get_fetch_frame()
        };


        try {

            let timeline_date = await ZOHO.CREATOR.API.getAllRecords(fetch_map);

            return timeline_date;




        } catch (error) {




        }


    } catch (error) {



    }




}
async function get_other_timeline(details) {


    try {

        await ZOHO.CREATOR.init();


        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: details.report_name,
            criteria:details?.criteria
        };


        try {

            let timeline_date = await ZOHO.CREATOR.API.getAllRecords(fetch_map);

            return timeline_date;




        } catch (error) {




        }


    } catch (error) {



    }




}

async function parse_consumables(consumables_response) {


    let consumables = {};
    let data = consumables_response.data
    data = data.sort((a,b)=>{return a[window.app_consumer.c_cdlm] - b[window.app_consumer.c_cdlm]})
    data = data.sort((a,b)=>{return (!isNaN(b[window.app_consumer.c_cdlm]) && !isNaN(a[window.app_consumer.c_cdlm])) ? 1 : a[window.app_consumer.c_cdlm].toLowerCase() > b[window.app_consumer.c_cdlm].toLowerCase() ? 1
        : a[window.app_consumer.c_cdlm].toLowerCase() < b[window.app_consumer.c_cdlm].toLowerCase() ? -1 : 0
        })
    data.forEach((element) => {
        consumables[element.ID] = element[window.app_consumer.c_cdlm];
    });


    return consumables


}


async function fetch_consumables() {

    try {

        await ZOHO.CREATOR.init();

        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: window.app_consumer.c_report_name,
            criteria: window.app_consumer.c_fetch_criteria
        };

        try {

            let consumables_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);

            return consumables_data;




        } catch (error) {



        }


    } catch (error) {



    }



}



const getAllData = async() =>{
    await machines_list()
    await items_list()
    await bom_list()
    await tools_list()
    await machine_operators()
    await warehouse_list()
    await movement_list()
}