// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        for(const board of boards) {
            console.log(board);
            dom.showBoard(board);
        }
    },
    createNewBoard: function(event) {
        let newBoard =
            `<div id="newBoard" class="shadow-sm card mb-4">
                <div class="card-header">
                    <div class="row">
                        <h5 class="col pt-1">
                            <span>
                                <input id="createNewBoardTitle" class="input" type="text" name="cardTitle" value="New board"/>
                            </span>
                        </h5>
                        <button id="dismissButton" type="button" class="close col-auto text-right pl-3 pr-3 no-border btn" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>`;

        document.querySelector('#boardsContainer').insertAdjacentHTML('beforeend', newBoard);

        let creatNewBoardInput = document.querySelector('#createNewBoardTitle');
        creatNewBoardInput.focus();
        creatNewBoardInput.addEventListener('keydown', function(event) {
            let key = event.key;
            if (key === 'Escape') {
                // back to original title and dont save
                 dom.saveNewBoardTitle(event)
            }
            else if (key === 'Enter') {
                // rename and save
                dom.saveNewBoardTitle(event)
            }
        });

        dom.addClickListener('#dismissButton', dom.dismissNewBoard);
    },
    addClickListener: function(selector, handler) {
        document.querySelector(selector).addEventListener('click', function eventHandler (event) {
            handler(event);
            event.target.removeEventListener('click', eventHandler);
        })
    },
    dismissNewBoard: function(event) {
        document.getElementById('newBoard').remove();
        dom.addClickListener('#createNewBoard', dom.createNewBoard)
    },
    saveNewBoardTitle: function(event) {
        let boardData = {};
        boardData['title'] = event.target.value;
        boardData['id'] = 3; // get it from the server
        // send boardData to server is needed
        let savedBoard =
            `<div class="shadow-sm card mb-4">
                <div class="card-header">
                    <div class="row">
                        <h5 class="col pt-1">${boardData['title']}</h5>
                        <a class="btn" data-toggle="collapse" href="#board-${boardData['id']}" role="button" aria-expanded="false" aria-controls="collapseExample">
                                <i class="fa fa-chevron-down"></i>
                        </a>
                    </div>
                </div>
                <div class="collapse" id="board-${boardData['id']}">
                    <div class="card-body">
                        This is where the cards go.
                    </div>
                </div>
            </div>`;

        document.getElementById('newBoard').remove();
        document.querySelector('#boardsContainer').insertAdjacentHTML('beforeend', savedBoard);
        dom.addClickListener('#createNewBoard', dom.createNewBoard)
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
    }
};
