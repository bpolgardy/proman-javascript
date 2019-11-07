// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";
import { utils } from "./utils.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards){
            dom.showBoards(boards);
            dom.addBoardControls();
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        for(const board of boards){
            dom.showBoard(board);
        }
    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    showBoard: function (board) {
        const boardTemplate = document.getElementById('board-template').innerHTML;
        const compiledBoardsTemplate = Handlebars.compile(boardTemplate);
        const renderedTemplate = compiledBoardsTemplate(board);
        document.getElementById('boardsContainer').insertAdjacentHTML('beforeend', renderedTemplate);
    },

    addBoardControls: function () {
        const boardControls = document.querySelectorAll('#dropdown-control');
        utils.addEventListenerTo(boardControls, 'click', function() {
        const clickedElementChildren = event.target.childNodes;
        let chevron;
        let target = event.target;
        
        if (utils.isEmpty(clickedElementChildren)) {
            chevron = event.target.classList[1];
        } else {
            chevron = clickedElementChildren[1].classList[1];
            target = target.querySelector('#chevron');
        }

        if (chevron === 'fa-chevron-down') {
                target.classList.remove('fa-chevron-down');
                target.classList.add('fa-chevron-up');
            } else {
                target.classList.remove('fa-chevron-up');
                target.classList.add('fa-chevron-down');
            }
        });
    }
};
