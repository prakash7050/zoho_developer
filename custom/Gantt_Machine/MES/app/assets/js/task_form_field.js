// created by Prakash on 29/09/2023

// data fetch function 
const fetchPopupData = async(reportList) =>{
    await setReportDataByReportName(reportList)
}

// create task form field for lightbox
const dapsFormField = (fieldDataValue) =>{
    
    // fetch all data for popup form value
    let popupReportList = [
        {reportName:"DAP_RM_FORM_Report",criteria:"",is_fetch:true},
        {reportName:"DAP_RM_SUB_FORM_Report",criteria:"",is_fetch:true},
        {reportName:"RM_Required_Report",criteria:""},
    ]
    // popup form field list
    const popupFormField=[
        {
            name:"Items",
            multiselection:false,
            type:"combo",
            data:getFormValueList("All_Items",keyName={value:"Name",id:"ID"}),//get items list in format {value:itemName,id:itemId}
        },
        {
            name:"Batch_Map",
            multiselection:false,
            type:"combo",
            data:getFormValueList("All_Batch_Maps",keyName={value:"Batch_Alloted",id:"ID"}),//get items list in format {value:itemName,id:itemId}
        },
        {name:"Quantity",type:"input",inputType: "number"},
        {
            name:"Warehouses",
            multiselection:false,
            type:"combo",
            data:getFormValueList("All_Warehouses",keyName={value:"Name",id:"ID"}),
        },
    ]

    let dap_rm_id = ""; // id for reference of report dap report, dap_rm_form and dap_rm_sub_form
    let dap_rm_form_id = null // dap rm form id
    let popupData = []
    if(fieldDataValue){
        dap_rm_id = fieldDataValue?.DAP_RM_ID
    }

    // get Dap RM details by dap_rm_id from DAP_RM_FROM_Report
    const getDapRMDataById = (dapRMId) =>{
        dapRMDetails = window.app_consumer?.DAP_RM_FORM_Report.find(dap=>dap.DAP_RM_ID === dapRMId)
        return dapRMDetails
    }

    // if DAP's RM ID present then fetch DAP RM Details from function getDapRMDataById then filter allDAP RM Details from report DAP_RM_SUB_FORM_report
    const getAllDapRMData = (allDapRM) =>{
        const dapRM = window.app_consumer?.DAP_RM_SUB_FORM_Report
        let allData = []
        for(const dap of allDapRM){
            const dapRmData = dapRM.find(ele=>ele.ID===dap.ID)
            allData = [...allData,dapRmData]
        }
        return allData;
    }

    // get all DAP's RM Details for popup form value if DAP's RM Details not found then DAP's RM data get form BOM RM Details
    const getAllRMDetails = (bomId,baseQty) =>{
        const bom = window.app_consumer.BOM_Report.find(b=>Number(b.ID) === Number(bomId))
        let bom_rm = window.app_consumer?.RM_Required_Report?.filter(rm=> rm.BOM_ID === String(bomId))
        let rmData = []
        for(const rm of bom_rm){
            const qty = (baseQty*bom.Base_Qty/rm.Qty).toFixed(2)
            rmData.push({Items:rm.Items,Batch_Map:"",Quantity:qty,Warehouses:rm?.Default_Warehouses})
        }
        return rmData;
    }

    // DAP's Form Submit action function
    const dapRMFormSubmit = async(dapRMId,task,dapRMData) =>{
        console.log(dapRMId,task,dapRMData)
        const updateDapRMFormData = [];
        dapRMData.map((rm,i)=>{
                updateDapRMFormData.push({
                    Items:task[`Items${i}`],
                    Batch_Map:task[`Batch_Map${i}`],
                    Quantity:task[`Quantity${i}`],
                    Warehouses:task[`Warehouses${i}`]
                })
            })
            const formData = {"DAP_RM_ID":String(dapRMId),"BOM_ID":window.app_consumer.bom_id,"Base_Qty":window.app_consumer.qty, "RM_Details":updateDapRMFormData}
            const result = await updateTask(dap_rm_form_id,formData,"DAP_RM_FORM_Report","DAP_RM_FORM")
            return result
    }

    // popup show function
    const showPopupForm = async(task,isShow) =>{
        console.log(fieldDataValue)
        // fetch all data form popup form value 
        await fetchPopupData(popupReportList)
        // get bom id in task details
        const bomId = task?.BOM
        // check show popup form validation
        if(!task?.BOM){
            alert("Please select BOM Details")
        }else if(!task?.Qty_Produce){
            alert("Please enter quantity produce")
        }else{
            if(!dap_rm_id){
                const d = new Date();
                let time = d.getTime();
                dap_rm_id =time
                fieldDataValue.DAP_RM_ID=time
            }
            if(dap_rm_id && String(bomId) === String(fieldDataValue?.BOM?.ID)){
                // dap_rm_data is DAP's RM Details by dap_rm_id
                const dap_rm_data = getDapRMDataById(dap_rm_id)
                // DAP's RM Details present
                if(dap_rm_data?.RM_Details){
                    popupData = getAllDapRMData(dap_rm_data?.RM_Details)
                    // dap_rm_id = dap_rm_data.ID
                    dap_rm_form_id = dap_rm_data.ID
                }else{
                    // if DAP's RM Details is Empty then popup Form value is BOM RM Details
                    popupData = getAllRMDetails(bomId,task?.Qty_Produce)
                }
            }else{
                popupData = getAllRMDetails(bomId,task?.Qty_Produce)
            }
            window.app_consumer.DAP_RM_ID = dap_rm_id
            window.app_consumer.bom_id = bomId
            window.app_consumer.qty = task?.Qty_Produce
            // create popup form pass props as (id,form_title_name, form_name, popup_form_field, popup_form_value,target_key(show popup on relative))
            createPopupForm(dap_rm_id,"RM Details",onFormSubmit=dapRMFormSubmit,"RMDetailsForm",popupFormField,popupData,"RM")
        }
    }

    const formField = [
        {
            name:"Production_Number",
            label:"Production Number",
            value:fieldDataValue?.Production_Number || "",
            type:"text",
            hidden:fieldDataValue?.ID ? false : true
        },
        {
            name:"Machine",
            label:"Machine",
            value:fieldDataValue?.Machine ? [fieldDataValue?.Machine?.ID] : "",
            type:"combo",
            multiselection:false,
            data:getFormValueList("All_Machines",keyName={value:"Name",id:"ID",machine_id:"Machine_ID", Operators:"Operators"}),
            dependkey:[{name:"Operator",type:"combo",parent:"Operators",reportName:"All_Machines",include:"unSigned_All_Operators"},{name:"Tools",type:'combo',parent:"Tools",reportName:"All_Machines",include:"unSigned_All_Tools"}]
        },
        {
            name:"Production_Date",
            label:"Production Date",
            value: fieldDataValue?.Production_Date ? moment(fieldDataValue?.Production_Date,window?.app_consumer?.creator_date_format).format("DD/MM/YYYY") : "",
            type:"datepicker",
            timePicker:false,
            dateFormat: "%d/%m/%Y",
        },
        {
            name:"Operator",
            label:"Operator",
            value:fieldDataValue?.Operator ? [fieldDataValue?.Operator?.ID] : "",
            type:"combo",
            multiselection:false,
            data:getFormValueList("All_Operators",keyName={value:"Name",id:"ID"}),
        },
        {
            name:"BOM",
            label:"BOM",
            value:fieldDataValue?.BOM ? [fieldDataValue?.BOM?.ID] : "",
            type:"combo",
            multiselection:false,
            data:getFormValueList("BOM_Report",keyName={value:"Name",id:"ID"}),
        },
        {
            name:"Items",
            label:"WIP",
            value:fieldDataValue?.Items ? [fieldDataValue?.Items?.ID] : "",
            type:"combo",
            multiselection:false,
            data:getFormValueList("All_Items",keyName={value:"Name",id:"ID"}),
        },
        {
            name:"Tools",
            label:"Tools",
            value:fieldDataValue?.Tools ? [fieldDataValue?.Tools?.ID] : "",
            type:"combo",
            multiselection:false,
            data:getFormValueList("All_Tools",keyName={value:"Name",id:"ID"}),
        },
        {
            name:"Qty_Produce",
            label:"Qty Produce",
            value:fieldDataValue?.Qty_Produce || "",
            type:"input",
            inputType: "number"
        },
        {
            name:"From_Date",
            label:"From Date",
            value: fieldDataValue?.From_Date ? moment(fieldDataValue?.From_Date,window?.app_consumer?.creator_date_format).format("DD/MM/YYYY HH:mm") : "",
            type:"datepicker",
            timePicker:true,
            dateFormat: "%d/%m/%Y %H:%i",
        },
        {
            name:"To_Date",
            label:"To Date",
            value: fieldDataValue?.To_Date ? moment(fieldDataValue?.To_Date,window?.app_consumer?.creator_date_format).format("DD/MM/YYYY HH:mm") : "",
            type:"datepicker",
            timePicker:true,
            dateFormat: "%d/%m/%Y %H:%i",
        },
        {
            name:"RM",
            label:"RM",
            value: false,
            type:"checkbox",
            checked:false,
            popup:true,
            popupForm:(task,isShow=false)=>showPopupForm(task,isShow),
        }
    ]
    return formField;
}

// (id=null,title="Popup Form",formName="popup_form",formField={name:"Name",type:"input"},data,targetName="RM")