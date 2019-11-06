import { dom } from "./dom.js";
import {utils} from "./utils.js";


;
// This function is to initialize the application
function init() {
    utils.getApiKey();
    // init data
    dom.init();
    // loads the boards to the screen
    dom.loadBoards();
    // get registration form
}

init();
