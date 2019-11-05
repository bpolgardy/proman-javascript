import { dom } from "./dom.js";

// This function is to initialize the application
function init() {
    // init data
    dom.init();
    // loads the boards to the screen
    dom.loadBoards();
    // put handler on new board button
    dom.addClickListener('#create-board', dom.createNewBoard)
}

init();

/* document.querySelector('#create-board').addEventListener('click', function (event) {
    dom.createNewBoard(event);
});
*/
