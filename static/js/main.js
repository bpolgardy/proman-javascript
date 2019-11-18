import { dom } from "./dom.js";
import { utils } from "./utils.js";


// This function is to initialize the application
function init() {
    utils.getApiKey();
    // init data
    dom.init();
    // loads the boards to the screen
    dom.loadBoards();
    // put handler on new board button
    dom.addClickListener('#createNewBoard', dom.createNewBoard);
    // get registration form
    //drag and drop event
    dom.addEventListenerToCards();
}

init();
