

async function getList(reportName,keyName={value:"",id:"ID",other_id:""},criteria=""){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: reportName,
            criteria: criteria
        };
        try {
            let dataList = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.data_list = dataList?.data;
            let list = []
            dataList?.data?.map(element=>{
                let listValue = {}
                Object.keys(keyName).map(key=>{
                    const type = typeof(element[keyName[`${key}`]])
                    listValue = {...listValue,[`${key}`]:type !== "object" ? element[keyName[`${key}`]] : element[keyName[`${key}`]].display_value.trim()}
                })
                list.push(listValue)
            })
            return list;
        } catch (error) {
        }
    } catch (error) {
    }
}

async function machine_operators(){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "All_Operators",
            criteria: ""
        };
        try {
            let operator_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.operator_list = operator_data?.data;
            return operator_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

async function bom_list(){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "BOM_Report",
            criteria: ""
        };
        try {
            let bom_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.bom_list = bom_data?.data;
            return bom_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

async function bom_rm_list(bom_id){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "RM_Required_Report",
            criteria: ""
        };
        try {
            let bom_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            
            let filterData = []
            if(bom_data?.data.length !==0){
                filterData = bom_data?.data.filter(ele=> ele.BOM_ID === String(bom_id))
            }
            window.app_consumer.bom_rm_data = filterData;
            return filterData;
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
    }
}

async function items_list(){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "All_Items",
            criteria: ""
        };
        try {
            let items_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.items_list = items_data?.data;
            return items_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

async function tools_list(){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "All_Tools",
            criteria: ""
        };
        try {
            let tools_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.tools_list = tools_data?.data;
            return tools_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

async function uom_list(){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "UoM_Report",
            criteria: ""
        };
        try {
            let uom_list = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.uom_list = uom_list?.data;
            return uom_list?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

async function machines_list(){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: window.app_consumer.c_report_name,
            criteria: ""
        };
        try {
            let machine_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.machine_list = machine_data?.data;
            return machine_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

function machineList(){
    const data = window.app_consumer.machine_list
   let list = []
   data?.map(element=>{
    list.push({value:element?.Name, id: element?.ID, machine_id:element?.Machine_ID, Operators:element?.Operators})
   })
   return list;
}

function operatorList(machineId){
    const machineList = window.app_consumer.machine_list
    const operatorData = machineList?.find(ele=> String(ele?.ID) === String(machineId))
    let operatorArray= []
    operatorData?.Operators?.map(ele=>{
        operatorArray.push({value:ele?.display_value.trim(),id:ele?.ID})
    })
    const unSignedOperatorList = unSignedOperator()
    return [...operatorArray,...unSignedOperatorList];
}

const unSignedOperator = () =>{
    let unSignedOperators = []
    const allOperators = window.app_consumer.operator_list
    allOperators.map(ele=> {
        if(!ele?.Machines){
            unSignedOperators.push({
                value: `${ele?.Name?.display_value.trim()}`,
                id: ele.ID
            })
        }
    })
    return unSignedOperators;
}

const allOperatorList = () =>{
    let operators = []
    const allOperators = window.app_consumer.operator_list
    allOperators.map(ele=> {
        operators.push({
            value: `${ele?.Name?.display_value.trim()}`,
            id: ele.ID
        })
    })
    return operators;
}

const unSignedTools = () =>{
    let unSignedTools = []
    const allTools = window.app_consumer.tools_list
    allTools?.map(ele=> {
        if(!ele?.Machines?.ID){
            unSignedTools.push({
                value: `${ele?.Name}`,
                id: ele.ID
            })
        }
    })
    return unSignedTools;
}

function toolsList(machineId){
    const machineList = window.app_consumer.machine_list
    const toolsData = machineList?.find(ele=> String(ele?.ID) === String(machineId))
    let toolsArray= []
    toolsData?.Tools_Associated?.map(ele=>{
        toolsArray.push({value:`${ele?.display_value.trim()}`,id:ele?.ID})
    })
    const unSignedToolsList = unSignedTools()
    return [...toolsArray,...unSignedToolsList];
}

const bomList = () =>{
    let bom = window.app_consumer.bom_list
    let option = []
    bom.map(ele=>{
        option.push({
            value: ele?.Name,
            id: ele.ID
        })
    })
    window.app_consumer.bom_option = option
    return option;
}

const uomList = () =>{
    let uom = window.app_consumer.uom_list
    let option = []
    uom.map(ele=>{
        option.push({
            value: ele?.Name,
            id: ele.ID
        })
    })
    window.app_consumer.uom_option = option
    return option;
}

const itemsList = ()=>{
    let items = window.app_consumer.items_list
    let option = []
    items.map(ele=>{
        option.push({
            value: ele?.Name,
            id: ele.ID
        })
    })
    window.app_consumer.items_option = option
    return option;
}

const allToolsList = ()=>{
    let tools = window.app_consumer.tools_list
    let option = []
    tools?.map(ele=>{
        option.push({
            value: ele?.Name,
            id: ele.ID
        })
    })
    window.app_consumer.tools_option = option
    return option;
}

const movement_list = async() =>{
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "All_Movements",
            criteria: ""
        };
        try {
            let movement_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.movement_list = movement_data?.data;
            return movement_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

const movementList = ()=>{
    let movements = window.app_consumer.movement_list
    let option = []
    movements?.map(ele=>{
        option.push({
            value: ele?.Movement_ID,
            id: ele.ID
        })
    })
    window.app_consumer.movement_option = option
    return option;
}

const warehouse_list = async() =>{
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "All_Warehouses",
            criteria: ""
        };
        try {
            let warehouse_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.warehouse_list = warehouse_data?.data;
            return warehouse_data?.data;
        } catch (error) {
        }
    } catch (error) {
    }
}

const warehouseList = ()=>{
    let warehouse = window.app_consumer.warehouse_list
    let option = []
    warehouse?.map(ele=>{
        option.push({
            value: ele?.Name,
            id: ele.ID
        })
    })
    window.app_consumer.warehouse_option = option
    return option;
}

const getAllRMDetails = async(bomId,baseQty) =>{
    const bom = window.app_consumer.bom_list.find(b=>Number(b.ID) === Number(bomId))
    let bom_rm = await bom_rm_list(bomId)
    let rmData = []
    for(const rm of bom_rm){
        const qty = (baseQty*bom.Base_Qty/rm.Qty).toFixed(2)
        rmData.push({Items:rm.Items,Quantity:qty,Warehouses:rm?.Default_Warehouses})
    }
    window.app_consumer.dap_rm_list_value = rmData
    return rmData;
}

const getDapRMDetails = async(dapRMId) =>{
    const id = dapRMId;
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "DAP_RM_FORM_Report",
            criteria:"",
        };
        try {
            
            let dap_rm_data = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.dap_rm_list = dap_rm_data?.data;
            let dapRMDetails = {}
            if( dap_rm_data?.data){
                dapRMDetails =  dap_rm_data?.data.find(dap=>dap.DAP_RM_ID === id)
            }
            return dapRMDetails
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
    }
}

const getDapRM = async() =>{
    const id = "1695812089000";
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: window.app_consumer.app_name,
            reportName: "DAP_RM_SUB_FORM_Report",
            criteria:"",
        };
        try {
            
            let dap_rm = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            window.app_consumer.dap_rm = dap_rm?.data;
            return dap_rm?.data;
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
    }
}

const getDapRMData = async(allDapRM) =>{
    const dapRM = await getDapRM()
    let allData = []
    for(const dap of allDapRM){
        const dapRmData = dapRM.find(ele=>ele.ID===dap.ID)
        allData = [...allData,dapRmData]
    }
    return allData;
}


