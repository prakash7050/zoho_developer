// https://docs.dhtmlx.com/gantt/samples/index.html?sample=%2704_customization/23_integration_with_suite.html%27&filter=%27%27
     // Add Modal on Double click and Add new task 
    async function lightboxConfig(){
        

        // DHTMLX lightbox Components configuration 
        var slider = new dhx.Slider("slider", {
            min: 0,
            max: 4,
            value: 2,
            tooltip: true,
            step: 1
        });
        slider.events.on("Change", function (newValue, oldValue, isRange) {
            const d = gantt.ext.zoom.setLevel(newValue);
            document.querySelector("#zoom_level").innerHTML = zoomConfig.levels[newValue].name.replace(/(^\w|\s\w)/g, function (m) { return m.toUpperCase() })
        });
        //Custom lightbox configuration
        var dhxWindow = new dhx.Window({
            title: "DHX Window",
            modal: false,
            resizable: true,
            movable: true,
            closable: true,
            header: true,
            footer: true,
            viewportOverflow: true,
            height: 500,
            width: 700,
            minWidth: 400,
            minHeight: 300
        });
    
        dhxWindow.footer.data.add({
            type: "button",
            view: "flat",
            size: "medium",
            color: "primary",
            value: "Save",
            id: "save",
        });
        dhxWindow.footer.data.add({
            type: "button",
            view: "link",
            size: "medium",
            color: "primary",
            value: "Cancel",
            id: "cancel",
        });
        dhxWindow.footer.data.add({
            type: "button",
            view: "link",
            size: "medium",
            color: "danger",
            value: "Delete",
            id: "delete",
        });
    
        dhxWindow.footer.events.on("click", function (id) {
            if (id === "save") {
                saveTask()
            }
            if (id === "cancel") {
                window.app_consumer.is_edit = false
                dhxWindow.hide()
            }
            if (id === "delete") {
                deleteTask()
            }
        });
    
        gantt.showLightbox = function (id) {
            dhxWindow.show();
            gantt._lightbox_id = id;
            let task = gantt.getTask(id);
            gantt._lightbox_task = gantt.copy(task);
            gantt._lightbox_links = "load";
            gantt._removed_links = [];
            var title = document.querySelector(".dhx_navbar-title")
            title.innerHTML = `${task?.text}` || "New task"
            addTabBar(id)
        }
    
        dhxWindow.handLightboxClick = function (e) {
            var tab = gantt?._tabbar?.getActive();
            var functionName = e.target.dataset.onclick;
            var functionArgument = e.target.dataset.onclick_argument;
            if (functionName) {
                gantt.$lightboxControl[tab][functionName](functionArgument);
            }
        }
    
        dhxWindow.events.on("AfterShow", function (position) {
            gantt.event(dhxWindow._popup, "click", dhxWindow.handLightboxClick);
        });
        dhxWindow.events.on("BeforeHide", function (position, events) {
            gantt.hideLightbox();
            gantt.eventRemove(dhxWindow._popup, "click", dhxWindow.handLightboxClick);
        });
    
        gantt.hideLightbox = async function (refresh=false) {
            if (gantt._lightbox_task.$new || refresh) {
                await deleteTask()
            }
            gantt._lightbox_task = null;
            gantt._lightbox_id = null;
        }

        function showMessage(message,type) {
			let text = message;
			gantt.message({type:type, text:text, expire: 10000});

		}

        async function saveTask() {
            let task = gantt.getTask(gantt._lightbox_id);
            const updateTaskResult = await gantt.$lightboxControl.addFormDetails(task.data ? task.data : {ID:''})
            const message = updateTaskResult?.message
            if(message){
                window.app_consumer.is_edit = false
                showMessage(updateTaskResult.message,'info')
                dhxWindow.hide()
                gantt.$lightboxControl.initiate()
                gantt.refreshData();
                
            }else if(updateTaskResult?.error){
                let errorMessage = updateTaskResult.error
                if(typeof(updateTaskResult.error) === "object"){
                    errorMessage = ""
                    Object.keys(updateTaskResult.error).map(key=>{
                        errorMessage = errorMessage + '</br>' + updateTaskResult.error[`${key}`]
                    })
                }
                showMessage(errorMessage,'error')
            }
        }
        async function deleteTask() {
            const id = gantt.getState().lightbox;
            if(id){
                let task = gantt.getTask(id) ? gantt.getTask(id) : {}
                const deleteTaskResult = await gantt.$lightboxControl.deleteFormDetails(task.data ? task.data : {ID:''})
                if(task.data){
                    if(deleteTaskResult.message){
                        window.app_consumer.is_edit = false
                        showMessage(deleteTaskResult.message,'info')
                        gantt.deleteTask(id)
                        dhxWindow.hide()
                        gantt.$lightboxControl.initiate()
                        gantt.refreshData();
                        
                    }else if(deleteTaskResult.error){
                        showMessage(deleteTaskResult.error,'error')
                    }
                }else{
                    window.app_consumer.is_edit = false
                    gantt.deleteTask(id)
                    dhxWindow.hide()
                }
            }
        }
    
        async function addTabBar(id) {
            let task = gantt.getTask(id)
            if(task?.text === "New task"){
                const filledData = task.data ? task.data : ""
                await window.app_consumer.task_dbl_click(filledData)
                otherTaskForm()
            }
            if (gantt._tabbar) gantt._tabbar.destructor();
    
            gantt._tabbar = new dhx.Tabbar(null, {
                views: [
                    { id: "details", tab: task?.text === 'New task' ? "Add Form Details" : "Update Form Details", css: "panel flex" },
                    { id: "other_form", tab: task.text === 'New task' ? "Add Other Details" : "Update Other Details", css: "panel flex" },
                ]
            });
            dhxWindow.attach(gantt._tabbar)
    
            dhx.awaitRedraw().then(function () {
                gantt.$lightboxControl.fillTabContent()
            })
    
            gantt._tabbar.events.on("Change", function (activeId, prevId) {
                gantt.$lightboxControl.fillTabContent(activeId)
                gantt.toggle_name = activeId
                if(activeId === "other_form"){
                    otherTaskForm()
                }
            });
        }

        function hideLightBox (){
            dhxWindow.hide()
        }
    
        gantt.$lightboxControl = {
            initiate: ()=>first_load(),
            details: {},
            other_form:{},
            addFormDetails:async(preData)=>{return await addFormData(preData)},
            deleteFormDetails:async(value)=>{return await deleteFormData(value)},
        };
    
        gantt.$lightboxControl.fillTabContent = function (id) {
            id = id || "details"
            gantt.$lightboxControl[id].addForm(id);
        }

        let taskData = []
        gantt.attachEvent("onTaskDblClick", async function(id,e){
             let task = gantt.getTask(id)
             window.app_consumer.is_edit = true
            taskData = task?.data
            window.app_consumer.form_data = taskData
            await window.app_consumer.task_dbl_click(task?.data)
            otherTaskForm()
            gantt.showLightbox(id)
             if(!task?.parent.split(" #").includes("Breakdown")){
                return true;
             }else{
                
                hideLightBox()
                return false;
             }
             
        });

        
    }