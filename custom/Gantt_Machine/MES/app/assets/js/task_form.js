// task form to create Form input field with value 
// pass props reportName to create which report Form and fieldData to pass if report form updated
const taskForm = async(reportName,fieldData) =>{
    // when click on task then window.app_consumer to store reportForm data from task
    const data = window?.app_consumer?.form_data
    // all key of report form field
    let allFields = Object.keys(data || fieldData);
    // find index key to remove from report form field
    const index = allFields.indexOf("ID")
    const appName = window.app_consumer.app_name
    // remove field
    allFields.splice(index,1);
    // check which report form to created or updated
    if(reportName === "All_Machines"){
        await machineFormField(allFields,fieldData)
    }else if(reportName === "room_inventory_Report"){
        await roomInventoryFormField(allFields,fieldData)
    }else if(reportName === "DAP_Report"){
        // create report form
        const formField = dapsFormField(fieldData)
        createForm(formField,fieldData)
    }
}

const createForm = (allFields,fieldData) =>{
    // task field for taskForm row
    let taskFormRows = {}
    // task field for taskFormRowsForGrid
    let taskFormRowsForGrid = []
    // depend key is define which field depend on other key in form field.
    let dependkey = {}
    let popupkey = {}
    // input change function for Report Form
    const handleChange = (name,new_value) =>{
        // get task form value 
        let task = gantt._taskForm.getValue();
        // check name of field is dependent or not
        if(new_value){
            if(Object.keys(dependkey).includes(name)){
                // get dependent list in dependkey by input field key as name
                const dependList = dependkey[`${name}`]
                for(const list of dependList){
                    // check dependent key type is text or combo(option || list)
                    if(list.type === "combo"){
                        const option = getFormValueList(list.reportName,keyName={value:"display_value",id:"ID"},listCriteria={type:"find",key:list?.parent,value:new_value},otherReport={name:list?.include,keyName:{value:"Name",id:"ID"}})
                        if(option){
                            gantt._taskForm.getItem(`${list?.name}`).combobox.data._initOrder=option
                        }
                    }
                }
            }
            if(Object.keys(popupkey).includes(name)){
                popupkey[`${name}`](task)
            }
        }
    }
    allFields.map((field,i)=>{
        // check any dependent key if this field changes then dependent key also changes on handleChange function
        if(field?.dependkey){
            dependkey = {...dependkey,[`${field.name}`]:field?.dependkey}
        }
        // check popup field if click on field then handleChanges function call then new value of this field is true then popup is show 
        if(field?.popup){
            popupkey = {...popupkey,[`${field.name}`]:field.popupForm}
        }
        taskFormRows = {
            ...taskFormRows,
            [`${field.name}`] :{
                ...field,
                id:field.name,
                labelPosition: "left",
                labelWidth: 150,
                alignItems:"left",
                required: true,
            }
        }
        taskFormRowsForGrid.push(taskFormRows[field.name])
    })
    initResourceEditForm({taskFormRows,taskFormRowsForGrid,handleChange})
    if(Object.keys(dependkey).length !==0 && fieldData){
        for(const key of Object.keys(dependkey)){
            for(const list of dependkey[`${key}`]){
                // check dependent key type is text or combo(option || list)
                if(list.type === "combo" && gantt._taskForm){
                    const option = getFormValueList(list.reportName,keyName={value:"Name",id:"ID"},listCriteria={type:"find",key:list?.parent,value:fieldData[`${key}`]["ID"]},otherReport={name:list?.include,keyName:{value:"Name",id:"ID"}})
                    if(option){
                        gantt._taskForm.getItem(`${list?.name}`).combobox.data._initOrder=option
                    }
                }
            }
        }
    }
}