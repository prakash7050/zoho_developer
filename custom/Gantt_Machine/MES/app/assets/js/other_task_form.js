


const otherTaskForm = async() =>{
    var taskFormRows = {
        Quantity: {
            name: "Quantity",
            type: "input",
            label: "Quantity",
            id: "Quantity",
            labelPosition: "left",
            labelWidth: 100,
            required: true,
            value: "",
        },
        Movement: {
            name: "Movement",
            type: "combo",
            label: "Movement",
            id: "Movement",
            labelPosition: "left",
            labelWidth: 100,
            multiselection: false,
            value: [],
            data: getFormValueList("All_Movements",keyName={value:"Movement_ID",id:"ID"}),
            value: "",
        },
    };

    const handleChange = (name, new_value) =>{
    }

    var taskFormRowsForGrid = [
        taskFormRows["Quantity"],
        taskFormRows["Movement"],
    ];

    gantt.$lightboxControl.other_form.addForm = function (id) {
        let task = {}
		if(gantt._lightbox_id){
			gantt.getTask(gantt._lightbox_id);
		}
        
		if (gantt._lightbox_task) {
			task = gantt._lightbox_task;
		}

		// if (gantt._taskForm) gantt._taskForm.destructor();
		gantt._taskForm = new dhx.Form(null, {
			css: "dhx_widget--bordered",
			rows:taskFormRowsForGrid,
		});
		gantt._tabbar.getCell("other_form").attach(gantt._taskForm);

		gantt._taskForm.events.on("Change", handleChange);
		
	};
}