//Assuming 10 parking slots available.

let available_slot = [1,2,3,4,5,6,7,8,9,10];
var filter_value = '';

//Represent each vehicle in the parking lot.
class EntryVehicle{
    constructor(owner,car,color,rrNo,slotNo,entryDate,exitDate){
        this.owner = owner;
        this.car = car;
        this.color = color;
        this.rrNo = rrNo;
        this.slotNo = slotNo;        
        this.entryDate = entryDate;
        this.exitDate = exitDate;
    }
}

//Contains UI logic for adding each vehicle and displaying them within the table.
class TableUI{
    //Appends each vehicle entry as a row to table.
    static addVehicleEntry(vehicle){
        const tableBody=document.querySelector('#tableBody');
        const row = document.createElement('tr');
        row.innerHTML = `   <td class="owner">${vehicle.owner}</td>
                            <td class="car">${vehicle.car}</td>
                            <td class="color">${vehicle.color}</td>
                            <td class="rrNo">${vehicle.rrNo}</td>
                            <td class='slot'>${vehicle.slotNo}</td>                            
                            <td class="entry">${vehicle.entryDate}</td>
                            <td class="exit">${vehicle.exitDate}</td>
                            <td><button class="delete"><i class="fas fa-trash blue"></i></button></td>
                        `;
        tableBody.appendChild(row);
    }

    //To display success or error message while adding a vehicle to parking slot.
    static showAlert(message,className){
        const div = document.createElement('div');
        div.className=`${className}`;
        div.appendChild(document.createTextNode(message));
        const submitBtn = document.querySelector('#submit');
        submitBtn.after(div);
        setTimeout(function(){
            document.querySelector("."+className).remove()
        },1000);        
    }

    static displayEntries(){   
        const entries = Store.getVehicles();
        entries.forEach((entry) => TableUI.addVehicleEntry(entry));
    }

    static clearInput(){
        //Selects all the inputs
        const inputs = document.querySelectorAll('#parkingForm input');
        //Clear the content of each input
        inputs.forEach((input)=>input.value="");
    }
    static deleteEntry(target){
        if(target.classList.contains('delete')){
            target.parentElement.parentElement.remove();
        }
    }

    static validateInputs(owner,car,color,rrNo,slotNo,entryDate,exitDate){
        if(owner === '' || car === '' || color === '' || rrNo === '' || slotNo === '' || entryDate === '' || exitDate === ''){
            TableUI.showAlert('All fields are mandatory!','danger');
            return false;
        }
        if( isNaN(slotNo)){
            TableUI.showAlert('Slot Number should be number!','danger');
            return false;
        }

        let parkingSlotNo = parseInt(slotNo);
        if(available_slot.includes(parkingSlotNo)){

            console.log("Available Slot : "+available_slot + " --   Parking Slot : "+ parkingSlotNo);

            document.querySelector('#car'+parkingSlotNo+ " i").style.color = color;

             //Remove the allocated parking slot from the list.            
             let removed = available_slot.splice(available_slot.indexOf(parkingSlotNo), 1);
             TableUI.showAlert(`Parking lot ${removed} allocated.`,'success');
        }
        else{
            available_slot.length === 0 ? TableUI.showAlert('Parking Slot full!!!','danger'):TableUI.showAlert('Parking Slot not available!','danger');
            return false;
        }
        
        if(exitDate < entryDate){
            TableUI.showAlert('Exit Date cannot be less than Entry Date','danger');
            return false;
        }
        return true;
    }
}

//Store Class: Handle Local Storage
class Store{
    static getVehicles(){
        let entries;
        if(localStorage.getItem('entries') === null){
            entries = [];
        }
        else{
            entries = JSON.parse(localStorage.getItem('entries'));
        }
        return entries;
    }
    static addVehicles(entry){
        const entries = Store.getVehicles();
        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
    }
    static removeVehicles(licensePlate){
        const entries = Store.getVehicles();
        entries.forEach((entry,index) => {
            if(entry.rrNo === rrNo){
                entries.splice(index, 1);
            }
        });
        localStorage.setItem('entries', JSON.stringify(entries));
    }
}



// Display when dom content loaded
document.addEventListener('DOMContentLoaded',TableUI.displayEntries);

//Get the car related data entered on the user interface.

document.querySelector("form").addEventListener('submit',function(event){

    event.preventDefault();
    let owner = document.querySelector("#owner").value;
    let car = document.querySelector("#car").value;
    let color = document.querySelector("#color").value;
    let rrNo = document.querySelector("#registrationNo").value;
    let slotNo = document.querySelector("#slotNo").value;    
    let entryDate = document.querySelector("#entryDate").value;
    let exitDate = document.querySelector("#exitDate").value;
   
    if(!TableUI.validateInputs(owner,car,color,rrNo,slotNo,entryDate,exitDate)){
        return;
    }
    let vehicle = new EntryVehicle(owner,car,color,rrNo,slotNo,entryDate,exitDate);    
    TableUI.addVehicleEntry(vehicle);
});

//Event Remove
document.querySelector('#tableBody').addEventListener('click',(e)=>{
    debugger;
    //Call to TableUIUI function that removes entry from the table
    TableUI.deleteEntry(e.target);
    //Get license plate to use as unique element of an entry
    var rrNumber = e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
   
    //Call to Store function to remove entry from the local storage
    Store.removeVehicles(rrNumber);
    let parkingSlotNo = e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
    available_slot.push(parseInt(parkingSlotNo));
    document.querySelector('#car'+parkingSlotNo+ " i").style.color = "black";
    //Show alert that entry was removed
    TableUI.showAlert(`Parking Slot ${parkingSlotNo} is available now!!!`,'success');
})

//Event Search
document.querySelector('#searchInput').addEventListener('keyup', function searchTable(){
    //Get value of the input search
    const searchValue = document.querySelector('#searchInput').value.toUpperCase();
    //Get all lines of table body
    const tableLine = (document.querySelector('#tableBody')).querySelectorAll('tr');
    //for loop #1 (used to pass all the lines)
    for(let i = 0; i < tableLine.length; i++){
        var count = 0;
        //Get all collumns of each line
        let lineValues = tableLine[i].querySelectorAll('td');

        if(filter_value){
            console.log(filter_value);
            lineValues = tableLine[i].querySelectorAll('td.'+filter_value);
            console.log(lineValues);          
        }
        //for loop #2 (used to pass all the collumns)
        for(let j = 0; j < lineValues.length; j++){
            //Check if any collumn of the line starts with the input search string
            if((lineValues[j].innerHTML.toUpperCase()).startsWith(searchValue)){
                count++;
            }
        }
        if(count > 0){
            //If any collumn contains the search value the display block
            tableLine[i].style.display = '';
        }else{
            //Else display none 
            tableLine[i].style.display = 'none';
        }
    }
});

//Filter by options
document.querySelector("#filter").addEventListener('change',function(){
    filter_value = document.querySelector("#filter").value;
    console.log(filter_value);
})