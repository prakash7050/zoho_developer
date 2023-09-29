/* 
Version: 0.0.1
Author: Shivam

`gantt_bar_task`   internal div in task
`.gantt_task_row`  row of task
`.gantt_row`       row containing task name on y axis
`.gantt_task_cell` cell of task


 */




gantt.attachEvent("onGanttScroll", function(left, top) {

    let last_movement_pos = $(".gantt_hor_scroll > div").width() - $(".gantt_hor_scroll").width(),
        last_movement_trigger = last_movement_pos * 0.90;


    if (gantt.getScrollState().x > last_movement_trigger && gantt.config.start_date && gantt.config.end_date) {

        let start_date = new Date(gantt.config.start_date.valueOf()),
            end_date = new Date(gantt.config.end_date.valueOf()),
            time_delta = (end_date.getTime() - start_date.getTime()) * 0.30,
            new_end_date = new Date(end_date.getTime() + time_delta);




        gantt.config.end_date = new_end_date;
        gantt.render();

        gantt.scrollTo(gantt.getScrollState().x + 0.50, null);



    }

});




$("body").on("mousedown", ".gantt_bar_task", function(ee) {

    //mousedown evenet listner on body delegated in internal div in task.

    if (ee.ctrlKey) {
        gantt.config.drag_move = false;
        //disabling horizontal movement
    }


    if (window.task.y_movement == 0 && ee.ctrlKey) {

        //this checks that both contrl and left mouse are pressed


        let current_node = $(ee.currentTarget);
        window.task.duplicate_node_ini = true;
        //this is trigger that node has been duplicated and till the movement is going on there is no need to duplicate the same.
        window.task.moving_task = gantt.getTask(current_node.attr("data-task-id"));
        //making a global copy of the task that is in movement.

        //javascript operations to deuplicate the task
        //////////
        window.task.duplicate_node = $(current_node.clone());
        /////////
        duplicate_node = window.task.duplicate_node;
        duplicate_node.css("display", "absolute");
        duplicate_node.addClass("duplicate_task_element");
        duplicate_node.attr("data-task-id", "-");
        duplicate_node.attr("task_id", "-");
        duplicate_node.css("top", "0");
        duplicate_node.css("left", "0");
        duplicate_node.css("opacity", "0.6");
        $(duplicate_node).width(($(duplicate_node).width() - $(duplicate_node).width() * 0.1));
        //substrating the width of task so that ot can git well in task cells.



        $("body").on("mousemove", drag_trigger);
        window.task.drag_listner_off = () => $("body").off('mousemove', drag_trigger);

    }
}).on("mouseup", releaseCtrl_Click).on("keyup", releaseCtrl_Click);



function releaseCtrl_Click(e) {

    /* 
        Function for handling release of click or mouse button during vertical movement of tasks.
    */

    if (!e.ctrlKey || e.handleObj.origType == "mouseup") {

        gantt.config.drag_move = true;
        //enabling horizotal movement of tasks as the vertical movement has come to an end.

        if (window.task.moving == true) {

            //checking state updated my moving of mouse and with neccessary y delta

            let value = JSON.parse(JSON.stringify({
                x: window.task.duplicate_node.offset().left + 1, //from task-cell position
                y: window.task.duplicate_node.offset().top //vertical row position
            }));

            // storing offset of nodes as in some browsers value becomes null


            value._x = (value.x + ((window.task.moving_task.duration) * $($(".gantt_task_cell")[0]).width()));

            //to task-cell position



            let task_row = $(document.elementsFromPoint(value.x, value.y)).filter(".gantt_task_row"),
                from_element = $(document.elementsFromPoint(value.x, value.y)).filter(".gantt_task_cell"),
                to_element = $(document.elementsFromPoint(value._x, value.y)).filter(".gantt_task_cell");
            //capturing row_node, from_node & to_node


            if (to_element.length > 0 && from_element.length > 0 && task_row.length != 0) {

                //checking wether the poistion has all three components

                let row_offset = task_row.offset(),
                    task_id = task_row.attr("data-task-id"),
                    from_date = gantt.dateFromPos(from_element.offset().left - row_offset.left),
                    to_date = gantt.dateFromPos(to_element.offset().left - row_offset.left);
                    //converting from_node & to_node to date & countering scroll by substration of row offset
                    to_gant_project = gantt.getTask(task_id);
                //fetching current task in row






                //deleteing the task that is in movement & adding a new task with same conf but different parent
                const moving_task_data = window.task.moving_task;
                const formData = moving_task_data.data
                // gantt.deleteTask(window.task.moving_task.id);
                gantt.addTask({
                    id: window.task.moving_task.id,
                    start_date: from_date,
                    end_date: to_date,
                    text: window.task.moving_task.text,
                    progress: window.task.moving_task.progress,
                    type: window.task.moving_task.type
                }, to_gant_project.id, 1); //1 is the index where task will be added in task list
                let taskId = window.task.moving_task.id
                const new_task_data = gantt.getTask(taskId)
                let startDate = gantt.date.parseDate(from_date, "%d/%m/%Y %H:%i");
                startDate = moment(startDate).format("DD-MMM-YYYY HH:mm:ss")
                let endDate = gantt.date.parseDate(to_date, "%d/%m/%Y %H:%i");
                endDate = moment(endDate).format("DD-MMM-YYYY HH:mm:ss")
                window.app_consumer.update_task({...formData,parent:new_task_data.parent,[`${window.app_consumer.t_end_link_name}`]:endDate,[`${window.app_consumer.t_start_link_name}`]:startDate})
            }

        }


        if (window.task.duplicate_node != null) {
            //fail safe to prevent small y_delta changes that are not registered
            window.task.duplicate_node.remove();
        }


        //reseting states to default

        window.task.y_movement = 0;
        window.task.moving = false;
        window.task.moving_task = null


        //removing additiona css

        window.task.drag_listner_off();
        window.task.drag_listner_off = () => {};
        $(`.gantt_row`).removeClass("add_shadow");
        $(".gantt_task_row").removeClass("add_shadow");




    }

}


function drag_trigger(e) {

    //adding movement on body can be delegated to child element but I have not tested the same for any glitches that may occur.


    if (window.task.y_movement == 0) {
        //setting the initial refrence point for task to calculate movement delta on y-axis
        window.task.y_movement = e.screenY;
    }



    let delta = window.task.y_movement - e.screenY,
        movement = delta < 0 ? delta * -1 : delta * 1, // equivalent to |delta|
        true_movement = $($(".gantt_task_line")[0]).height() * 1.1 < movement;
    // if delta is greater that 0.1% of row height it will be considered a +ve movement


    if (true_movement) {


        if (window.task.duplicate_node_ini != null) {

            //if this is a new movement where task has not been appended to body

            gantt.config.drag_move = false;

            window.task.duplicate_node.appendTo("body");
            window.task.duplicate_node_ini = null;

            window.task.moving = true;
            //TO-DO: add a border to all available projects where task can not be moved


        }

        if (window.task.moving) {

            //If task is moving

            let value = JSON.parse(JSON.stringify({
                x: window.task.duplicate_node.offset().left,
                y: window.task.duplicate_node.offset().top
            }));

            //Locating moving node and storing its offset

            value._x = (value.x + ((window.task.moving_task.duration - 1) * $($(".gantt_task_cell")[0]).width()));

            //point for last cell for the task

            // the tasks on scroll are dynamicall y populated.

            let current_row = $(document.elementsFromPoint(value.x, value.y)).filter(".gantt_task_row"), //row in which moving task is
                from_element = $(document.elementsFromPoint(value.x, value.y)).filter(".gantt_task_cell"), //start cell of the moving task
                to_element = $(document.elementsFromPoint(value._x, value.y)).filter(".gantt_task_cell"), // end cell of the moving task
                horizontal_scroll_box = $(".gantt_task"), //horzontal box 
                vertical_scroll_box = $(".gantt_data_area"), //vertical box
                vertical_end_pos = vertical_scroll_box.offset().top + vertical_scroll_box.height(), // end point of vertical box
                vertical_start_trigger_pos = vertical_scroll_box.offset().top + (vertical_scroll_box.height() * 0.12), // point where scroll will start on down drag
                vertical_end_trigger_pos = vertical_end_pos - (vertical_scroll_box.height() * 0.12), // point where scroll will start on up drag
                horizontal_end_pos = horizontal_scroll_box.offset().left + horizontal_scroll_box.width(), // end point of horizontal box
                horizontal_start_trigger_pos = horizontal_scroll_box.offset().left + (horizontal_scroll_box.width() * 0.12), // point where scroll will start on left drag
                horizontal_end_trigger_pos = horizontal_end_pos - (horizontal_scroll_box.width() * 0.12); // point where scroll will start on right drag



            //scrolling conditions


            if (horizontal_end_trigger_pos < e.pageX) {

                gantt.scrollTo(gantt.getScrollState().x + (horizontal_scroll_box.width() * 0.005), null);
            }

            if (horizontal_start_trigger_pos > e.pageX) {

                gantt.scrollTo(gantt.getScrollState().x - (horizontal_scroll_box.width() * 0.005), null);
            }

            if (vertical_end_trigger_pos < e.pageY) {

                gantt.scrollTo(null, gantt.getScrollState().y + (horizontal_scroll_box.height() * 0.005));

            }

            if (vertical_start_trigger_pos > e.pageY) {

                gantt.scrollTo(null, gantt.getScrollState().y - (horizontal_scroll_box.height() * 0.005));

            }





            


            //removing default css conditions

            $(".gantt_task_cell").removeClass("dark_border_from").removeClass("dark_border_to");
            $(".gantt_task_row, .gantt_row").removeClass("add_shadow_void").removeClass("add_shadow");


            if (to_element.length > 0 && from_element.length > 0 && current_row.length != 0) {

                //checking presence of all the required elements for movement
// console.log(gantt.getTask(current_row.attr("data-task-id")),current_row.attr("data-task-id"),"<<<<<<<<")
                let current_task_in_row = gantt.getTask(current_row.attr("data-task-id"))
                let current_task_id = current_row.attr("data-task-id")
                if(current_task_id.split(" #").length === 2){
                    current_task_id = current_task_id.split(" #")[1]
                }
                  let task_row_y_axis = $(`.gantt_row[data-task-id=${current_task_id}]`)


                //condition for denial of movement if row is project type
                if (current_task_in_row.type == "project") {

                    from_element.addClass("dark_border_from");
                    to_element.addClass("dark_border_to");
                    current_row.addClass("add_shadow");
                    task_row_y_axis.addClass("add_shadow");

                } 
                else {


                    current_row.addClass("add_shadow_void");
                    task_row_y_axis.addClass("add_shadow_void");


                }


            }



        }


        //logic for centring element of mouse cursor
        window.task.duplicate_node.css("top", e.pageY - 15);
        window.task.duplicate_node.css("left", e.pageX - duplicate_node.width() / 2);




    }





}