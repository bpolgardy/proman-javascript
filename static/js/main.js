import { dom } from "./dom.js";
import {utils} from "./utils";

// This function is to initialize the application
function init() {
    api_key = utils.getApiKey();
    // init data
    dom.init();
    // loads the boards to the screen
    dom.loadBoards();
    // get registration form
}

init();
