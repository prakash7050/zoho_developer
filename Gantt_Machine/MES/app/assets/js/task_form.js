const taskForm = async(reportName,fieldData) =>{
    const data = window?.app_consumer?.form_data
    let allFields = Object.keys(data || fieldData);
    const index = allFields.indexOf("ID")
    allFields.splice(index,1);
    if(reportName === "All_Machines"){
        await machineFormField(allFields,fieldData)
    }else if(reportName === "room_inventory_Report"){
        await roomInventoryFormField(allFields,fieldData)
    }else if(reportName === "DAP_Report"){
        dapFormField(allFields,fieldData)
    }
}

let operatorOption = []
let fieldList = []
let toolsOption = []

const dapFormField = (allFields,fieldData) =>{
    const formField = ["Production_Number","Machine","Production_Date","Operator","BOM","Items","Tools","Qty_Produce","Strokes_Left","From_Date","To_Date","RM"]
    let formData = {}
    
    const data = window?.app_consumer?.form_data
    const machineOption = machineList()
    const itemsOption = itemsList()
    const bomOption = bomList();
    const operatorsList = allOperatorList()
    let rmDetails = [];
    if(fieldData){
        operatorOption = operatorList(fieldData?.Machine?.ID)
        toolsOption  = toolsList(fieldData?.Machine?.ID)
        getAllRMDetails(fieldData?.BOM?.ID,fieldData?.Qty_Produce)
        window.app_consumer.bom_id = fieldData?.BOM?.ID
    }
    const handleChange = async(name, new_value) => {
        const isList =data && typeof(data[`${name}`]) === 'object'
        formData = {...formData,[`${name}`] : isList ? [new_value] : new_value}
        let task = gantt._taskForm.getValue();
        if(name === "Machine" && new_value){
            operatorOption = operatorList(new_value)
            toolsOption  = toolsList(new_value)
            gantt._taskForm.getItem("Operator").combobox.data._initOrder=operatorOption
            gantt._taskForm.getItem("Tools").combobox.data._initOrder=toolsOption
        }else if(name === "RM"){
            if(!task?.BOM){
                alert("Please select BOM Details")
            }else if(!task?.Qty_Produce){
                alert("Please enter quantity produce")
            }
            else{
                let dap_rm_id = fieldData.DAP_RM_ID
                if(!dap_rm_id){
                    const d = new Date();
                    let time = d.getTime();
                    dap_rm_id =time
                    fieldData.DAP_RM_ID=time
                }
                task.DAP_RM_ID=dap_rm_id;
                window.app_consumer.DAP_RM_ID = dap_rm_id
                rmForm(dap_rm_id,task?.Qty_Produce)
            }
        }else if(name === "BOM"){
            getAllRMDetails(new_value,task?.Qty_Produce)
            window.app_consumer.bom_id = new_value
        }
    }

    const toolList = allToolsList()
    
    const refreshForm = (refresh=false) =>{
        let taskFormRows = {};
        let taskFormRowsForGrid = []
        formField.map(field=> {
            let fieldValue = ""
            const isDate = [window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,"Production_Date"].includes(field)
            const isTime = [window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name].includes(field)
            const isDisable = fieldData ?  ![window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,"Machine","Operator","BOM","Items","Tools","Qty_Produce",,"RM"].includes(field) : false;
            const isRemove = !fieldData && ["Production_Number"].includes(field) || ["Strokes_Left"].includes(field)
            let isCheckbox = ["RM"].includes(field)
            let isObject = false
            let isNumber = ["Qty_Produce"].includes(field)
            const objectList = ["Machine","Operator","BOM","Items","Tools"]
            if(data && typeof(data[`${field}`]) === 'object' || objectList.includes(field)){
                isObject = true
            }
            let date = "";
            if(isDate && fieldData){
                date =isTime ? moment(fieldData[`${field}`],window?.app_consumer?.creator_date_format).format("DD-MM-YYYY HH:mm") : moment(fieldData[`${field}`],window?.app_consumer?.creator_date_format).format("DD-MM-YYYY")
                fieldValue = date
            }else if(isDate && formData){
                date = formData[`${field}`]
                fieldValue = date
            }
            if(Object.keys(formData).includes(field)){
                if(isObject){
                    fieldValue = [formData[`${field}`]]
                }else{
                    fieldValue = formData[`${field}`]
                }
            }else if(Object.keys(fieldData).includes(field)){
                if(isDate){
                    date =fieldData[`${field}`] ? isTime ? moment(fieldData[`${field}`],window?.app_consumer?.creator_date_format).format("DD/MM/YYYY HH:mm") : moment(fieldData[`${field}`],window?.app_consumer?.creator_date_format).format("DD/MM/YYYY") : ""
                    fieldValue = date
                }else if(isObject){
                    if(isDisable){
                        fieldValue =fieldData[`${field}`] ? fieldData[`${field}`]['display_value'] : ""
                    }else{
                        fieldValue = fieldData[`${field}`] ? [fieldData[`${field}`]['ID']] : ""
                    }
                }else{
                    fieldValue = fieldData[`${field}`] || ""
                }
            }else{
                fieldValue = ""
            }
            let option = []
            if(field === "Machine"){
                option = machineOption
            }else if(field === "Operator"){
                option = operatorsList
            }else if(field === "BOM"){
                option = bomOption
            }else if(["Items"].includes(field)){
                option = itemsOption
            }else if(["Tools"].includes(field)){
                option = toolList
            }
            if(isCheckbox){
                if(fieldData && fieldData?.DAP_RM_ID){
                    fieldValue=true
                }else{
                    fieldValue=false
                }
            }
            const isValue = Object.keys(formData).includes(field)
            console.log(field,fieldValue,"<<<<<<<<<<<<<",fieldData?.DAP_RM_ID)
            if(!isRemove){
                taskFormRows = { 
                    ...taskFormRows,
                    [`${field}`] :{
                        name: field,
                        type: isDate ? "datepicker" : isDisable ? "text" : isObject ? "combo" : isCheckbox ? "checkbox" : isNumber ? "input" : "input",
                        timePicker:isTime,
                        dateFormat: isDate ? isTime ? "%d/%m/%Y %H:%i" : "%d/%m/%Y" : "",
                        label:field === "Items" ? "WIP" : field.split("_").join(" "),
                        id:field,
                        labelPosition: "left", 
                        labelWidth: 150,
                        alignItems:"left",
                        required: true,
                        // for drop down.............
                        multiselection: false,
                        data: option,
                        // ...................
                        checked:fieldValue,
                        value: fieldValue,
                    }
                }
                taskFormRowsForGrid.push(taskFormRows[field])
            }
        })
        fieldList = {taskFormRows,taskFormRowsForGrid,handleChange}
        initResourceEditForm(fieldList)
    }
    refreshForm()
    if(gantt._taskForm){
        gantt._taskForm.getItem("Operator").combobox.data._initOrder=operatorOption
        gantt._taskForm.getItem("Tools").combobox.data._initOrder=toolsOption
    }
}

const roomInventoryFormField = async(allFields,fieldData) =>{
    let formData = {}
    let taskFormRows = {};
    let taskFormRowsForGrid = []
    const data = window?.app_consumer?.form_data
    const handleChange = async(name, new_value) => {
        const isList = typeof(data[`${name}`]) === 'object'
        formData = {...formData,[`${name}`] : isList ? [new_value] : new_value}
        let task = gantt._lightbox_task;
    }
    const roomList = await getList(window.app_consumer.c_report_name,{value:"Room_No",id:"ID"})
    const guestList = await getList("All_Guests",{value:"Name",id:"ID"})
    allFields.map(field=> {
        const isDate = [window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name].includes(field)
        const isDisable = fieldData ?  ![window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,"Guests","Room_No"].includes(field) : false;
        const isRemove = !fieldData && ["Booking_No","Reservation_Number","Adult","Class"].includes(field)
        const isMulti = ["Guests"].includes(field)
        let isObject = false
        if(typeof(data[`${field}`]) === 'object'){
            isObject = true
        }
        let date = "";
        if(isDate && fieldData){
            date = moment(fieldData[`${field}`],window?.app_consumer?.creator_date_format).format("DD/MM/YY")
        }else if(isDate && formData){
            date = formData[`${field}`]
        }
        let option = []
        if(field === "Room_No"){
            option = roomList
        }else if(field === "Guests"){
            option = guestList
        }
        const isValue = Object.keys(formData).includes(field)
        if(!isRemove){
            taskFormRows = {
                ...taskFormRows,
                [`${field}`] :{
                    name: field,
                    type: isDate ? "datepicker" : isDisable ? "text" : isObject ? "combo" : "input",
                    label: field.split("_").join(" "),
                    id: field,
                    labelPosition: "left",
                    labelWidth: 150,
                    alignItems:"left",
                    required: true,
                    // for drop down.............
                    multiselection: isMulti,
                    data: option,
                    // ...................
                    value: fieldData ? (isDisable && isObject) ? fieldData[`${field}`]['display_value'] : isObject ? isValue ? [formData[`${field}`]] :isMulti ? fieldData[`${field}`].map(value=>{return value.ID})  : [fieldData[`${field}`]['ID']] : isDate ? isValue ? [formData[`${field}`]] : date : fieldData[`${field}`] : isValue ? formData[`${field}`] : "",
                }
            }
            taskFormRowsForGrid.push(taskFormRows[field])
        }
    })
    
    fieldList = {taskFormRows,taskFormRowsForGrid,handleChange}
    initResourceEditForm(fieldList)
    return fieldList
}


const machineFormField = async(allFields,fieldData) =>{
    let formData = {}
    let taskFormRows = {};
    let taskFormRowsForGrid = []
    const data = window?.app_consumer?.form_data
    const machineOption = await machineList()
    if(fieldData){
        operatorOption = operatorList(fieldData?.Machine?.ID)
    }
    const handleChange = async(name, new_value) => {
        const isList = typeof(data[`${name}`]) === 'object'
        formData = {...formData,[`${name}`] : isList ? [new_value] : new_value}
        let task = gantt._lightbox_task;
        // let updatedTask = gantt._taskForm.getValue();
        // task["updatedData"] = updatedTask
        if(name === "Machine" && new_value){
            operatorOption = operatorList(new_value)
            await refreshForm(task?.id)
        }
    }
    
    
    
    const refreshForm = async(id="") =>{
        const bomOption = await bomList();
        const operatorsList = allOperatorList()
        const uomOption = await uomList()
        allFields.map(field=> {
            const isDate = [window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name].includes(field)
            const isDisable = fieldData ?  ![window?.app_consumer?.t_start_link_name,window?.app_consumer?.t_end_link_name,"Machine","Operator"].includes(field) : false;
            const isRemove = !fieldData && ["Production_Schedule"].includes(field)
            let isObject = false
            if(typeof(data[`${field}`]) === 'object'){
                isObject = true
            }
            let date = "";
            if(isDate && fieldData){
                date = moment(fieldData[`${field}`],window?.app_consumer?.creator_date_format).format("DD/MM/YY")
            }else if(isDate && formData){
                date = formData[`${field}`]
            }
            let option = []
            if(field === "Machine"){
                option = machineOption
            }else if(field === "Operator"){
                option = operatorOption.length !==0 ? operatorOption : operatorsList
            }else if(field === "BOM"){
                option = bomOption
            }else if(["UoM_Input","UoM_Output"].includes(field)){
                option = uomOption
            }
            const isValue = Object.keys(formData).includes(field)
            if(!isRemove){
                taskFormRows = {
                    ...taskFormRows,
                    [`${field}`] :{
                        name: field,
                        type: isDate ? "datepicker" : isDisable ? "text" : isObject ? "combo" : "input",
                        label: field.split("_").join(" "),
                        id: field,
                        labelPosition: "left",
                        labelWidth: 150,
                        alignItems:"left",
                        required: true,
                        // for drop down.............
                        multiselection: false,
                        data: option,
                        // ...................
                        value: fieldData ? (isDisable && isObject) ? fieldData[`${field}`]['display_value'] : isObject ? isValue ? [formData[`${field}`]] : [fieldData[`${field}`]['ID']] : isDate ? isValue ? [formData[`${field}`]] : date : fieldData[`${field}`] : isValue ? formData[`${field}`] : "",
                    }
                }
                taskFormRowsForGrid.push(taskFormRows[field])
            }
        })
        // if(id){
        //     gantt.hideLightbox(true);
        // }
        
        fieldList = {taskFormRows,taskFormRowsForGrid,handleChange}
        initResourceEditForm(fieldList)
        if(id){
            gantt._taskForm.destructor();
            gantt._taskForm = new dhx.Form(null, {
                css: "dhx_widget--bordered",
                rows:taskFormRowsForGrid,
            });
            gantt._tabbar.getCell("details").attach(gantt._taskForm);
        }
    }
    refreshForm()
    return fieldList
}