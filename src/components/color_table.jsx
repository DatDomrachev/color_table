import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {SketchPicker} from 'react-color';
import Popup from "reactjs-popup";

const reorder = (list, startIndex, endIndex) => {
    const result = list;
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: isDragging ? "none":'all',
    background: isDragging ? "lightgreen" :  "white",

    ...draggableStyle
});


class ColorTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items:[],
            picker_color:'#fff',
            selected_row: null,
            open:false,
            input_name:'',
            input_type:'main'
        }
        this.onDragEnd = this.onDragEnd.bind(this);
        this.handlePickerChange = this.handlePickerChange.bind(this);

    }

    componentDidMount() {
        let table_data =  JSON.parse(window.localStorage.getItem('table_data'));
        if (!table_data || table_data == null || table_data == undefined) {
            table_data = [{name:'name1', type:'main', 'color':'#f4f4f4',id:1},{name:'name2', type:'side', 'color':'#f8f8f8',id:2}];
        }


         console.log(table_data);

        this.setState({items:table_data});
    }

    handlePickerChange (color)  {
        this.setState({ picker_color: color.hex });
    };

    componentDidUpdate() {

    }

    save() {
        let new_items = Object.assign({}, this.state.items);
        console.log(Object.keys(new_items).length);
        if (this.state.selected_row){
        new_items[this.state.selected_row].name= this.state.input_name;
        new_items[this.state.selected_row].type= this.state.input_type;
        new_items[this.state.selected_row].color= this.state.picker_color;
        new_items[this.state.selected_row].id = this.state.items[this.state.selected_row].id;
        }
        else{

            let new_item = {};
                new_item.name = this.state.input_name;
                new_item.type = this.state.input_type;
                new_item.color = this.state.picker_color;
                new_item.id = Object.keys(new_items).length + 1;

            new_items[Object.keys(new_items).length]=new_item;
        }
        window.localStorage.setItem("table_data", JSON.stringify(new_items));
        this.setState({ items: new_items, open: false });
    }


    openModal() {
        let input_name='';
        let input_type='main';
        let picker_color='#fff';

        if (this.state.selected_row){
            input_name=this.state.items[this.state.selected_row].name;
            input_type=this.state.items[this.state.selected_row].type;
            picker_color=this.state.items[this.state.selected_row].color;
        }


        this.setState({
            input_name:input_name,
            input_type:input_type,
            picker_color:picker_color,
            open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    onDragEnd(result) {

        if (!result.destination) {
            return;
        }

        let list = Object.assign({}, this.state.items);
        let arr =Object.values(list);


        let items = reorder(
            arr,
            result.source.index,
            result.destination.index
        );


        window.localStorage.setItem("table_data", JSON.stringify(items));

        this.setState({
            items
        });
    }

    deleteRow(){
        if(confirm('Delete row?')){
         let new_items = Object.assign({}, this.state.items);
            delete(new_items[this.state.selected_row]);
            window.localStorage.setItem("table_data", JSON.stringify(new_items));
            // console.log(window.localStorage);
            this.setState({items:new_items});
        }
    }

    handleChange(e,field){
        let value = e.target.value;
        let cur_state = this.state;
        cur_state[field]=value;
        this.setState(cur_state);
    }



    render() {

        let rows =[];
        let obj = Object.assign({}, this.state.items);
        let items = obj;

        for(let index in items){

            rows.push(
                <Draggable key={items[index].id} draggableId={'item'+ items[index].id} index={+index}>
                    {(provided, snapshot) => (
                        <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                            )}
                            className={index == this.state.selected_row ? 'table-info':''}
                            onClick={e=>{this.setState({selected_row:index})}}
                        >
                            <td scope="row">{items[index].id}</td>
                            <td>{items[index].name}</td>
                            <td>{items[index].type}</td>
                            <td style={{backgroundColor: items[index].color }}>{items[index].color}</td>
                        </tr>
                    )}
                </Draggable>
            );
        }


        return(

                <div className={'pt-3'} style={{paddingBottom:50}}>
                    <div className={'col-12 mb-1'} style={{position:'fixed', bottom:0, zIndex:10, backgroundColor:'#fff'}}>
                        <div style={{maxWidth:40}} className="btn btn-dark"
                             onClick={e=>{
                                 this.setState({selected_row:null}, ()=>{this.openModal()});

                             }}><i className="fas fa-plus"></i></div>

                        <div style={{maxWidth:40, display: this.state.selected_row == null ? 'none' : 'inline-block' }}
                             className="btn btn-secondary ml-2" onClick={e=>{this.openModal()}}><i className="fas fa-edit"></i></div>
                        <div style={{maxWidth:40, display: this.state.selected_row == null ? 'none' : 'inline-block' }}
                             onClick={e=>{this.deleteRow()}}
                             className="btn btn-danger ml-2"><i className="fas fa-trash"></i></div>
                    </div>
                    <div className={'col-12'}>
                        <table className="table">
                            <thead className="thead-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Type</th>
                                <th scope="col">Color</th>
                            </tr>
                            </thead>
                            <DragDropContext onDragEnd={this.onDragEnd}>
                                <Droppable droppableId="droppable" type="LIST">
                                    {(provided, snapshot) => (
                                        <tbody
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                        {rows}


                                        {provided.placeholder}
                                        </tbody>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </table>
                    </div>

                    <Popup
                        open={this.state.open}
                        closeOnDocumentClick
                    >
                        <div className={'p-2'}>
                            <a className="close" style={{cursor:'pointer'}} onClick={e=>{this.closeModal()}}>
                                &times;
                            </a>
                            <div className={'content'}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={this.state.input_name} 
                                           onChange={(e)=>this.handleChange(e,'input_name')} type="text" className="form-control"/>
                                </div>

                                <div className="form-group">
                                    <label>Type</label>
                                    <select className="form-control" value={this.state.input_type}
                                            onChange={(e)=>this.handleChange(e,'input_type')}>
                                        <option disabled={true}>--</option>
                                        <option>main</option>
                                        <option>side</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Color</label>
                                    <SketchPicker
                                    color={ this.state.picker_color }
                                    onChangeComplete={ this.handlePickerChange }
                                />
                                </div>

                            </div>
                            <div className="actions pt-2 d-flex">
                                <div style={{maxWidth:40}}
                                     className="btn btn-info" onClick={e=>{this.save()}}><i className="fas fa-save"></i></div>

                                <div style={{minWidth:40}}
                                     className="ml-auto btn btn-secondary" onClick={e=>{this.closeModal()}}>&times;</div>
                            </div>
                        </div>
                    </Popup>

                </div>

            );

        // out.push()


    }
}

let element = document.getElementById('table_show');
ReactDOM.render(
    React.createElement(
       ColorTable,
        JSON.parse(element.getAttribute('data-options')),
        null
    ),
    element
);