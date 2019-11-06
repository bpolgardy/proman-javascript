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

        let boardList = '';

        for (let board of boards) {
            boardList += `
                <li>${board.title}</li>
            `;
        }

        const outerHtml = `
            <ul class="board-container">
                ${boardList}
            </ul>
        `;

        let boardsContainer = document.querySelector('#boards');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);
    },
    createNewBoard: function(event) {
        let newBoard =
            `<div id="newBoard" class="shadow-sm card mb-4">
                <div class="card-header">
                    <div class="row">
                        <h5 class="col pt-1">
                            <span>
                                <input id="createNewBoardInput" class="input" type="text" name="cardTitle" value="New board"/>
                            </span>
                        </h5>
                        <button id="dismissButton" type="button" class="close col-auto text-right pl-3 pr-3 no-border btn" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>`;

        document.querySelector('#boardsContainer').insertAdjacentHTML('beforeend', newBoard);

        let creatNewBoardInput = document.querySelector('#createNewBoardInput');
        creatNewBoardInput.focus();
        creatNewBoardInput.addEventListener('keydown', function(event) {
            let key = event.key;
            if (key === 'esc') {
                // back to original title and dont save
            }
            else if (key === 'enter') {
                // rename and save
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
    saveNewBoardTitle: function() {

    },

    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    // here comes more features
};
