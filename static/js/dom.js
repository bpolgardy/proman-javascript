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
                        <h5 class="col pt-1 mr-5">
                            <span class="d-flex w-50">
                                <input id="createNewBoardTitle" class="input form-control" type="text" name="cardTitle" value="New board"/>
                            </span>
                        </h5>
                        <button id="dismissButton" type="button" class="close col-auto text-right pl-3 pr-3 no-border btn ml-5" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>`;

        document.querySelector('#boardsContainer').insertAdjacentHTML('beforeend', newBoard);
        dom.addClickListener('#dismissButton', dom.dismissNewBoard);

        let creatNewBoardInput = document.querySelector('#createNewBoardTitle');
        let originalTitle = creatNewBoardInput.value;
        creatNewBoardInput.focus();
        creatNewBoardInput.addEventListener('keydown', function(event) {
            let key = event.key;
            if (key === 'Escape') {
                dom.handleUnsavedTitle(event, originalTitle);
            }
            else if (key === 'Enter') {
                dom.saveNewBoardTitle(event);
            }
        });
        creatNewBoardInput.addEventListener('blur', function (event) {
                dom.handleUnsavedTitle(event, originalTitle);
        })
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
        let boardTitle = {};
        boardTitle['title'] = event.target.value;
        dataHandler.createNewBoard(boardTitle, function(data) {

            let savedBoard =
                `<div class="shadow-sm card mb-4">
                    <div class="card-header">
                        <div class="row">
                            <h5 class="col pt-1">${data['title']}</h5>
                            <a class="btn" data-toggle="collapse" href="#board-${data['id']}" role="button" aria-expanded="false" aria-controls="collapseExample">
                                    <i class="fa fa-chevron-down"></i>
                            </a>
                        </div>
                    </div>
                    <div class="collapse" id="board-${data['id']}">
                        <div class="card-body">
                            This is where the cards go.
                        </div>
                    </div>
                </div>`;

            document.getElementById('newBoard').remove();
            document.querySelector('#boardsContainer').insertAdjacentHTML('beforeend', savedBoard);
            dom.addClickListener('#createNewBoard', dom.createNewBoard)
        });
    },
    handleUnsavedTitle: function(event, originalTitle) {
        let titleInput = event.target;
        let inputParent = titleInput.parentElement;
        let titleContainer = inputParent.parentElement;

        inputParent.remove();
        titleContainer.innerHTML = originalTitle
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
