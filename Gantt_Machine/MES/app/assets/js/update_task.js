

const zoho_update_record = async(id,data,reportName,formName) =>{
    let formDetails = {
        appName:  window.app_consumer.app_name,
        formName: formName,
        reportName:reportName,
        data:{data:data}
    };
    let updateResult;
    try{
        if(id){
            updateResult = await ZOHO.CREATOR.API.updateRecord({id:id,...formDetails})
        }else{
            updateResult = await ZOHO.CREATOR.API.addRecord(formDetails)
        }
        return updateResult.error ? {error : updateResult.error} : {message : updateResult.message}
    }catch(err){
        return {error: err}
    }
}

const updateTask = async(formId,newTaskData,reportName=window.app_consumer.t_report_name,formName=window.app_consumer.t_form_name) =>{
    if(confirm("Do you want to be update task ?")){
        try{
            const result = await zoho_update_record(formId,newTaskData,reportName,formName)
            if(result.message){
                gantt.message({type:'info', text:`${result.message}`, expire: 10000});
            }else if(result.error){
                gantt.message({type:'error', text:`${result.error}`, expire: 10000});
            }
        }catch(err){
            gantt.message({type:'error', text:`${err}`, expire: 10000});
        }
    }else{
        gantt.message({type:'warning', text:`Task not update`, expire: 10000});
    }
    gantt.$lightboxControl.initiate()
    // gantt.refreshData();
    // gantt.refreshData();
}

const zoho_delete_record = async(id) =>{
    let formDetails = {
        appName:  window.app_consumer.app_name,
        formName: window.app_consumer.t_form_name,
        reportName: window.app_consumer.t_report_name,
        criteria:`(ID=${id})`
    };
    let deleteResult;
    try{
        deleteResult = await ZOHO.CREATOR.API.deleteRecord(formDetails)
        return deleteResult.result[0] ? {message : deleteResult.result[0]['message']} :{error : deleteResult.code}
    }catch(err){
        return {error : err}
    }
}

const findOneList = async(key,value) =>{
    switch(key){
        case "Machine":
            const machines = await machineList();
            const machineData = machines.find(ele=> ele.id === value)
            return machineData;
        case "Operator":
            const operators = allOperatorList()
            const operatorsDetails = operators.find(ele=> ele?.id === value)
            return operatorsDetails;
        case "BOM":
            const boms = await bomList()
            const bomDetails = boms.find(ele=> ele?.id === value)
            return bomDetails;
        case "UoM_Input":
        case "UoM_Output":
            const uoms = await uomList()
            const uom = uoms.find(ele=> ele.id === value)
            return uom;
        case "Guests":
            const guests = await getList("All_Guests",{value:"Name",id:"ID"})
            const guest = guests.find(ele=> ele.id === value)
            return guest;
        case "Room_No":
            const rooms = await getList(window.app_consumer.c_report_name,{value:"Name",id:"ID"})
            const room = rooms.find(ele=> ele.id === value)
            return room;
        case "Items":
            const items = await itemsList()
            const item = items.find(ele=> ele.id === value)
            return item;
        case "Tools ":
            const tools = await allToolsList()
            const tool = tools.find(ele=> ele.id === value)
            return tool;
    }
}

async function addFormData(preData){
    let id = preData.ID;
    let recordData = window?.app_consumer?.form_data
    let updatedTask = gantt._taskForm.getValue();

    let formData = {...updatedTask,ID:id}
    let details = {}
    if(window.app_consumer.c_report_name === "DAP_Report"){
        details = await formatTaskData(formData,["Machine","Operator"])
    }else if(window.app_consumer.c_report_name === "room_inventory_Report"){
        details = await formatTaskData(formData,["Guests","Room_No"])
    }else if(window.app_consumer.t_report_name === "DAP_Report"){
        details = await formatTaskData(formData,["Tools","Machine","Items","BOM","Operator","Qty_Produce","RM","DAP_RM_ID","Production_Date"],{date_key:["Production_Date"],date_time_key:[]})
        if(window.app_consumer?.DAP_RM_ID){
            details = {...details,"DAP_RM_ID":window.app_consumer.DAP_RM_ID,"RM":true}
        }
    }
    const result = await zoho_update_record(id,details,window.app_consumer.t_report_name,window.app_consumer.t_form_name)
    return  result;
}

async function formatTaskData(preData,keys,other={}){
    let recordData = window?.app_consumer?.form_data || preData
    let updatedTask = gantt._taskForm.getValue();
    let formData = {...updatedTask}
    for(let key of Object.keys(updatedTask)){
        const isDate = [window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,...other?.date_key].includes(key)
        const isTime = [window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,...other?.date_time_key].includes(key)
        const isDisable = preData?.ID ?  ![window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,...keys].includes(key) : false;
        if (updatedTask[`${key}`] === undefined || isDisable) {
           const deleteKey = delete formData[`${key}`];
        }else if(typeof(recordData[`${key}`]) === 'object'){
            const fieldValue = await findOneList(key,formData[`${key}`])
            const value = {display_value:fieldValue?.value.trim(),ID:formData[`${key}`]}
            formData = {...formData,[`${key}`]:value?.ID }
        }else if(isDate){
            
            let dateValue = gantt.date.parseDate(formData[`${key}`],isTime ? "%d/%m/%Y %H:%i" : "%d/%m/%Y");
            dateValue = moment(dateValue).format(isTime ? "DD-MMM-YYYY HH:mm:ss" : "DD-MMM-YYYY")
            formData = {...formData,[`${key}`]:dateValue }
        }
    }
    if(Object.keys(formData).length !==0){
        return formData;
    }
}

async function deleteFormData(data){
    if(data.ID){
        return await zoho_delete_record(data.ID)
    }
}

async function updateDapRMDetails(id,data){
    try{
        const result = await zoho_update_record(id,data,"DAP_RM_FORM_Report","DAP_RM_FORM")
        if(result.message){
            gantt.message({type:'info', text:`${result.message}`, expire: 10000});
            return {status:"success"}
        }else if(result.error){
            gantt.message({type:'error', text:`${result.error}`, expire: 10000});
            return {status:"error"}
        }
    }catch(err){
        gantt.message({type:'error', text:`${err}`, expire: 10000});
        return {status:"error"}
    }
}