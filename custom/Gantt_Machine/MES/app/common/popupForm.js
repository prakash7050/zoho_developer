const createPopupForm = (id=null,title="Popup Form",onFormSubmit,formName="popup_form",formField={name:"Name",type:"input"},data,targetName="RM") =>{
    let popRow = []
    let rowInput = {}
    data?.map((list,i)=>{
        rowInput={
            ...rowInput,
            [i]:{
                padding: 10,
                // sets alignment for columns
                margin:'10px',
                align: "between",  // "center", "end", "between", "around", "evenly",
                cols: formField?.map(ele=>{
                    return {...ele,
                        name:ele?.name+i,
                        id:ele?.name+i,
                        label:ele?.name.split("_").join(" "),
                        height: 'fit-content',
                        width:180,
                        autoWidth: true,
                        value:ele.type === "combo" ? [list[`${ele?.name}`]["ID"]] : list[`${ele?.name}`]
                    }
                })
            }
        }
        popRow = [
            ...popRow,
            rowInput[i],
        ];
    })

    // input change of popup form function 
    const handleChange = (name, new_value) =>{
    }

    // onClick button 
    const handleClick = async(name) =>{
        if(name === 'clear'){
            popup.hide()
        }else if(name === 'submit'){
            const task = gantt[`${formName}`].getValue()
            const result = await onFormSubmit(id,task,data)
            if(result?.status === "success"){
                popup.hide()
            }
        }
    }

    // create popup form 
    gantt[`${formName}`] = new dhx.Form(null, {
        title:title,
        margin:10,
        width:800,
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

    // set handleChanges function
    gantt[`${formName}`].events.on("Change", handleChange);
    // set handleClick function 
    gantt[`${formName}`].events.on("click", handleClick);
    const popup = new dhx.Popup({
        css: "dhx_widget--bordered",
    });
    // setting of popup form
    const config = {
        centering: true,
        mode: "right",
        indent: 20,
        viewportOverflow: true,
    };
    
    const targetNode = document.getElementById(targetName);
    popup.attach(gantt[`${formName}`])
    popup.show(targetNode,config);
}
