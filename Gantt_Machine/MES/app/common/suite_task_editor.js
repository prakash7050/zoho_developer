function initTaskEditForm() {
	gantt.$lightboxControl.task.addForm = function () {
		var task = gantt.getTask(gantt._lightbox_id);
		if (gantt._lightbox_task) {
			task = gantt._lightbox_task;
		}

		var taskFormRows = {
			text: {
				name: "text",
				type: "input",
				label: "Task name",
				id: "text",
				labelPosition: "left",
				labelWidth: 100,
				required: true,
				value: task.text,
			},
			description: {
				name: "description",
				type: "textarea",
				label: "Description",
				id: "description",
				labelPosition: "left",
				labelWidth: 100,
				value: task.description,
			},
			start_date: {
				name: "start_date",
				type: "datepicker",
				label: "Start Date",
				id: "start_date",
				required: true,
				labelPosition: "left",
				labelWidth: 100,
				value: task.start_date,
			},
			end_date: {
				name: "end_date",
				type: "datepicker",
				label: "End Date",
				id: "end_date",
				required: true,
				labelPosition: "left",
				labelWidth: 100,
				value: task.end_date,
			},
			duration: {
				name: "duration",
				type: "input",
				inputType: "number",
				label: "Duration",
				id: "duration",
				labelPosition: "left",
				labelWidth: 100,
				required: true,
				value: task.duration,
			},
			tags: {
				name: "tags",
				type: "combo",
				label: "Tags",
				id: "end_date",
				labelPosition: "left",
				labelWidth: 100,
				multiselection: true,
				value: ["1", "4"],
				data: [
					{ value: "Important", id: "1" },
					{ value: "Urgent", id: "2" },
					{ value: "External", id: "3" },
					{ value: "Planned", id: "4" },
					{ value: "Teamwork", id: "5" },
				],
				value: task.tags,
			},
			progress: {
				name: "progress",
				type: "slider",
				id: "progress",
				label: "Progress",
				labelPosition: "left",
				labelWidth: 100,
				min: 0,
				max: 100,
				value: task.progress * 100,
			},
		};

		var taskFormRowsForGrid = [
			taskFormRows["text"],
			taskFormRows["description"],
			taskFormRows["start_date"],
			taskFormRows["end_date"],
			taskFormRows["duration"],
			taskFormRows["tags"],
			taskFormRows["progress"],
		];

		if (gantt._taskForm) gantt._taskForm.destructor();
		gantt._taskForm = new dhx.Form(null, {
			css: "dhx_widget--bordered",
			rows: taskFormRowsForGrid,
		});
		gantt._tabbar.getCell("task").attach(gantt._taskForm);

		gantt._taskForm.events.on("Change", function (name, new_value) {
			var task = gantt._lightbox_task;

			var updatedTask = gantt._taskForm.getValue();

			task.text = updatedTask.text;
			task.description = updatedTask.description;
			task.tags = updatedTask.tags;
			task.progress = updatedTask.progress / 100;

			var new_start_date = updatedTask.start_date;
			var new_end_date = updatedTask.end_date;
			var new_duration = updatedTask.duration;
			var old_end_date = +new Date(task.end_date);

			if (new_start_date instanceof Date) {
				// do nothing
			} else {
				task.start_date = gantt.date.parseDate(new_start_date, "%d/%m/%y");
			}

			if (task.duration != new_duration) {
				task.duration = new_duration;
				task.end_date = gantt.calculateEndDate({ start_date: task.start_date, duration: task.duration, task: task });
				new_end_date = task.end_date;
			}

			if (new_end_date instanceof Date && +old_end_date == +new_end_date) {
				// do nothing
			} else {
				new_end_date = gantt.date.parseDate(new_end_date, "%d/%m/%y");
				if (+old_end_date != +new_end_date) {
					task.end_date = new_end_date;
					task.duration = gantt.calculateDuration({ start_date: task.start_date, end_date: task.end_date, task: task });
				}
			}
		});
	};



	let popRow = []
    let rowInput = {}
    if(rmDetails.length !== 0){
        rmDetails.map((rm,i)=>{
            rowInput={
                ...rowInput,
                [`Items-${i}`]: {
                    name: "Items",
                    type: "combo",
                    label: "Items",
                    id: "items+i",
                    labelPosition: "left",
                    labelWidth: 100,
                    multiselection: false,
                    value: [rm?.ID],
                    data: itemsOption,
                },
                [`Quantity-${i}`]: {
                    name: "Quantity",
                    type: "input",
                    inputType: "number",
                    label: "Quantity",
                    id: "Quantity"+i,
                    labelPosition: "left",
                    labelWidth: 100,
                    required: true,
                    // value: task.duration,
                },
                [`Warehouse-${i}`]: {
                    name: "Warehouse",
                    type: "combo",
                    label: "Warehouse",
                    id: "Warehouse"+i,
                    labelPosition: "left",
                    labelWidth: 100,
                    multiselection: false,
                    value: [rm?.ID],
                    data: itemsOption,
                },
            }
            popRow = [
                ...popRow,
                rowInput[`Items-${i}`],
                rowInput[`Quantity-${i}`],
                rowInput[`Warehouse-${i}`],
                
            ];
        })
    }

    const popupForm = new dhx.Form("form_container", {
        padding: 400,
        width: 400,
        top: -600,
        left:-200,
        position:'absolute',
        'background-color':'aliceblue',
        css: "custom",
        rows:popRow,
    });
}