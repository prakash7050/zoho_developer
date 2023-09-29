const rmForm = async(dapRMId,qty=0) =>{
    let rmData =  window.app_consumer.dap_rm_list_value
    let items = itemsList()
    let allWarehouse = warehouseList()
    let popRow = []
    let rowInput = {}
    let dap_rm_id=null
    if(dapRMId){
        const dap_rm_data = await getDapRMDetails(dapRMId)
        if(dap_rm_data?.RM_Details){
            rmData = await getDapRMData(dap_rm_data?.RM_Details)
            dap_rm_id = dap_rm_data.ID
        }

    }
    rmData.map((rm,i)=>{
        rowInput={
            ...rowInput,
            [i]:{
                padding: 10, 
                // sets alignment for columns
                margin:'10px',
                align: "between",  // "center", "end", "between", "around", "evenly",
                cols: [
                    {
                        name: "Items"+i,
                        type: "combo",
                        label: "Items",
                        id: "items"+i,
                        labelPosition: "top",
                        multiselection: false,
                        height: 'fit-content',
                        width:200,
                        autoWidth: true,
                        value: [rm?.Items?.ID],
                        data: items,
                    },
                    {
                        name:  "Quantity"+i,
                        type: "input",
                        inputType: "number",
                        label: "Quantity",
                        id: "Quantity"+i,
                        labelPosition: "top",
                        height: 'fit-content',
                        width:200,
                       autoWidth: true,
                        required: true,
                        value: rm?.Quantity,
                    },
                    {
                        name: "Warehouses"+i,
                        type: "combo",
                        label: "Warehouses",
                        id: "Warehouses"+i,
                        labelPosition: "top",
                        height: 'fit-content',
                       autoWidth: true,
                       width:200,
                        multiselection: false,
                        value: [rm?.Warehouses?.ID],
                        data: allWarehouse,
                    }
                ]
            }
        }
        popRow = [
            ...popRow,
            rowInput[i],
        ];
    })
    const handleChange = (name, new_value) =>{
    }

    const handleClick = async(name) =>{
        if(name === 'clear'){
            gantt.dap_rm_taskForm.setValue({"RM":false})
            popup.hide()
        }else if(name === 'submit'){
            const task = gantt.dap_rm_taskForm.getValue()
            const updateDapRMFormData = [];
            rmData.map((rm,i)=>{
                updateDapRMFormData.push({
                    Items:task[`Items${i}`],
                    Quantity:task[`Quantity${i}`],
                    Warehouses:task[`Warehouses${i}`]
                })
            })
            const formData = {"DAP_RM_ID":String(dapRMId),"BOM_ID":window.app_consumer.bom_id,"Base_Qty":qty, "RM_Details":updateDapRMFormData}
            const result = await updateDapRMDetails(dap_rm_id,formData)
            if(result?.status === "success"){
                popup.hide()
            }
        }
    }
   
    gantt.dap_rm_taskForm = new dhx.Form(null, {
        title:"RM Details",
        margin:10,
        width:700,
        height:350,
        css: "dhx_widget--bordered",
        rows:[...popRow,{ padding: 10, 
            margin:'10px',
            align: "between",cols:[
            {
                type: "button",
                name: "submit",
                text: "Save",
                size: "medium",
                view: "link",
                color: "success"
            },{
                type: "button",
                name: "clear",
                text: "Clear",
                size: "medium",
                view: "link",
                color: "danger"
            }
        ]}   ],
    });
    gantt.dap_rm_taskForm.events.on("Change", handleChange);
    gantt.dap_rm_taskForm.events.on("click", handleClick);
    const popup = new dhx.Popup({
        css: "dhx_widget--bordered",
    });
    const config = {
        centering: true,
        mode: "right",
        indent: 20,
        viewportOverflow: true,
    };
    
    const targetNode = document.getElementById("RM");
    popup.attach(gantt.dap_rm_taskForm)
    popup.show(targetNode,config);
}

    