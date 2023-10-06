function initResourceEditForm({taskFormRows,taskFormRowsForGrid,handleChange}) {
	gantt.$lightboxControl.details.addForm = function (id) {
        let task = {}
		if(gantt._lightbox_id){
			gantt.getTask(gantt._lightbox_id);
		}
        
		if (gantt._lightbox_task) {
			task = gantt._lightbox_task;
		}

		if (gantt._taskForm){
			gantt._taskForm.destructor();
		}
		gantt._taskForm = new dhx.Form(null, {
			css: "dhx_widget--bordered",
			rows:taskFormRowsForGrid,
		});
		gantt._tabbar.getCell("details").attach(gantt._taskForm);

		gantt._taskForm.events.on("Change", handleChange);
		
	};
}