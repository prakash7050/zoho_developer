// created by Prakash on 29-09-2023

// fetch report data by app name, report name and criteria
async function getReportData(appName,reportName,criteria){
    try {
        await ZOHO.CREATOR.init();
        let fetch_map = {
            appName: appName,
            reportName: reportName,
            criteria: criteria
        };
        try {
            let reportData = await ZOHO.CREATOR.API.getAllRecords(fetch_map);
            return reportData?.data;
        } catch (error) {
            console.log(reportName,error)
        }
    } catch (error) {
        console.log(reportName,error)
    }
}

// set the fetch report data on window by key report name and value report data
// reportList = [{reportName:"report_name",criteria:"criteria"}]
async function setReportDataByReportName(reportList=[]){
    const appName=window.app_consumer.app_name
   
    if(reportList.length !== 0){
        for(const report of reportList){
            // check if is_fetch is true then again fetch the report data or if window.app_consumer[`${report.reportName}`] is empty then fetch report data
            if(!window.app_consumer[`${report.reportName}`] || report?.is_fetch){
                const result = await getReportData(appName,report.reportName,report.criteria)
                window.app_consumer[`${report.reportName}`] = result
                // if other details store then pass in report list as other:{name:"unSinged_reportName",relation:"Machine"}
                if(report?.other){
                    window.app_consumer[`${report?.other?.name}`] = result?.filter(list=> !list[`${report?.other?.relation}`])
                }
                // return result;
            }
        }
        // return;
    }
}

// format list data of report in form data list
// pass props reportName as string and keyName as object ex. keyName={value:"",id:"ID",other_id:""} and other_id to given to fetch other id if important id or optional
// other_id just pass key name as Machine or value is ID
// listCriteria is optional and pass properties as type(get,find,filter, ...other) and key value is depend other report list
function getFormValueList(reportName,keyName={value:"",id:"ID",other_id:""},listCriteria={type:"get",key:"",value:""},otherReport={name:"",keyName:{value:"",id:"ID"}}){
    let listData = window.app_consumer[`${reportName}`]
    let list = []
    if(listCriteria.type === "find"){
        listData = listData.find(list=> String(list.ID) === String(listCriteria.value))
        listData = listData[`${listCriteria.key}`]
    }
    // other report added
    if(otherReport?.name && window.app_consumer[`${otherReport?.name}`]){
        const otherReportList =  window.app_consumer[`${otherReport?.name}`]
        otherReportList?.map(element=>{
            let listValue = {}
            // map keyName with report data
            Object.keys(otherReport?.keyName).map(key=>{
                // check type of value
                const type = typeof(element[otherReport.keyName[`${key}`]])
                listValue = {...listValue,[`${key}`]:type !== "object" ? element[otherReport.keyName[`${key}`]] : element[otherReport.keyName[`${key}`]].display_value?.trim()}
            })
            list.push(listValue)
        })
    }
    // map report data 
    if(listData){
        listData?.map(element=>{
            let listValue = {}
            // map keyName with report data
            Object.keys(keyName).map(key=>{
                // check type of value
                const type = typeof(element[keyName[`${key}`]])
                listValue = {...listValue,[`${key}`]:type !== "object" ? element[keyName[`${key}`]] : element[keyName[`${key}`]].display_value?.trim()}
            })
            list.push(listValue)
        })
    }
    if(list.length !== 0){
        return list
    }else{
        return;
    }
}