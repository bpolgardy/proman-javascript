// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";
import {utils} from "./utils.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
            dom.initRenameHandler();
            dom.addDeleteHandler();
            dom.addBoardControls();
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        for (const board of boards) {
            dom.showBoard(board);
        }
    },
    createNewBoard: function (event) {
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
        creatNewBoardInput.addEventListener('keydown', function (event) {
            let key = event.key;
            if (key === 'Escape') {
                dom.handleUnsavedTitle(event, originalTitle);
            } else if (key === 'Enter') {
                dom.saveNewBoardTitle(event);
            }
        });
        creatNewBoardInput.addEventListener('blur', function (event) {
            dom.handleUnsavedTitle(event, originalTitle);
        })
    },
    addClickListener: function (selector, handler) {
        document.querySelector(selector).addEventListener('click', function eventHandler(event) {
            handler(event);
            event.target.removeEventListener('click', eventHandler);
        })
    },
    dismissNewBoard: function (event) {
        document.getElementById('newBoard').remove();
        dom.addClickListener('#createNewBoard', dom.createNewBoard)
    },
    saveNewBoardTitle: function (event) {
        let boardTitle = {};
        boardTitle['title'] = event.target.value;
        dataHandler.createNewBoard(boardTitle, function (data) {

            document.getElementById('newBoard').remove();
            dom.showBoard(data);
            dom.addClickListener('#createNewBoard', dom.createNewBoard);
        });
    },
    handleUnsavedTitle: function (event, originalTitle) {
        let titleInput = event.target;
        let inputParent = titleInput.parentElement;
        let titleContainer = inputParent.parentElement;

        inputParent.remove();
        titleContainer.innerHTML = originalTitle
    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(cards)
        })
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        for (let card of cards) {
            dom.showCard(card);
        }
    },
    showCard: function (card) {
        let cardTemplate = document.getElementById('card-template').innerHTML;
        let compiledCardTemplate = Handlebars.compile(cardTemplate);
        let renderedTemplate = compiledCardTemplate(card);
        let board = document.getElementById(`board-${card['board_id']}`);
        let column = board.querySelector(`[data-col="${card['status_id']}"]`);
        column.insertAdjacentHTML('beforeend', renderedTemplate);
        let newCard = document.getElementById("card-" + card.id);
        dom.addDragListener(newCard);
        dom.addDragOverCardHandler(newCard, dom.createPlaceholder());
    },
    showBoard: function (board) {
        const boardTemplate = document.getElementById('board-template').innerHTML;
        const compiledBoardsTemplate = Handlebars.compile(boardTemplate);
        const renderedTemplate = compiledBoardsTemplate(board);
        document.getElementById('boardsContainer').insertAdjacentHTML('beforeend', renderedTemplate);
        let newBoard = document.getElementById("board-" + board.id);
        dom.loadCards(board['id']);
        document.querySelector(`#board-${board['id']}`).querySelector("#newCardButton").addEventListener('click', function createNewCardHandler(event) {
            event.target.removeEventListener('click', createNewCardHandler);
            dom.insertNewCard(event, board['id']);
        });
        dom.addDropListener(newBoard);
    },

    addBoardControls: function () {
        const boardControls = document.querySelectorAll('#dropdown-control');
        utils.addEventListenerTo(boardControls, 'click', function () {
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

    },


    addDeleteHandler: function () {
        let deletButtons = document.getElementsByClassName("delete-button");
        for (let i = 0; i < deletButtons.length; i++) {
            let deletButton = deletButtons[i];
            deletButton.addEventListener("click", function (e) {
                e.stopPropagation();
                let boardId = deletButton.dataset.board;
                let board = deletButton.dataset.boardName;
                dataHandler.deleteBoard(boardId);
                document.getElementById(board).remove();

            })
        }
    },

    initRenameHandler: function () {
        let boards = document.getElementsByClassName("promanBoard");

        // let boards = document.getElementsByClassName("promanBoard")[0].getElementsByTagName("h5");


        function saveBoardName(id, boardId) {

        }

        for (let i = 0; i < boards.length; i++) {
            let h5 = boards[i].getElementsByTagName("H5")[0];
            let done = true;
            h5.addEventListener('click', function (e) {
                if (done) {
                    done = false;
                    e.stopPropagation();
                    let originaltitleDisplay = boards[i].getElementsByTagName("H5")[0];
                    let text = originaltitleDisplay.textContent;
                    let newTitle = document.createElement("input");
                    let span = document.createElement("span");
                    let saveButton = document.createElement("button")


                    saveButton.textContent = ("save");
                    saveButton.classList.add("btn");
                    saveButton.addEventListener("click", function (e) {
                        e.stopPropagation();
                        let id = boards[i].id.substr(6);
                        dataHandler.updateBoard(id, boards[i].id, newTitle.value);
                        h5.innerHTML = newTitle.value;
                        done = true;
                    });

                    newTitle.value = originaltitleDisplay.textContent;
                    newTitle.classList.add("col");
                    newTitle.style.maxWidth = "20%";

                    span.classList.add("d-flex");
                    span.classList.add("w-50");
                    span.style.width = "100%";
                    span.id = "keksz";

                    span.appendChild(newTitle);
                    boards[i].firstElementChild.firstElementChild.insertAdjacentElement("afterbegin", span);
                    originaltitleDisplay.textContent = "";
                    originaltitleDisplay.append(span);
                    span.append(saveButton);
                    // document.getElementById(boards[i].id + "-title").remove();
                }
            });
        }
    },

    createCardElement: function (cardData) {
        let card = `<div class="card-container">
                        <div class="card" data-id="newCard" data-board_id="${cardData['board_id']}" data-status_id="${cardData['status_id']}" data-order="${cardData['order']}">
                            <div class="card-dismiss d-flex justify-content-end mt-2 mr-2"><i class="fas fa-save fa-lg p-2"></i><i class="fas fa-times fa-sm p-2"></i></div>
                            <div class="card-body float-left">
                                <h5 class="card-title text-left text-align-top"><input id="createNewCardTitle" class="form-control" type="text" name="cardTitle" value="New card"/></h5>
                            </div>
                        </div>
                    </div>`;
        return card
    },

    insertNewCard: function (event, boardId) {
        let cardData = {
            'title': 'New card',
            'board_id': boardId,
            'status_id': 1,
            'order': 1
        };

        let newCard = dom.createCardElement(cardData);
        let cardContainer = document.querySelector(`#board-${cardData['board_id']}`).querySelector(`[data-col = '${cardData['status_id']}']`);
        cardContainer.insertAdjacentHTML('beforeend', newCard);
        dom.addNewCardControl(cardContainer);
    },
    addNewCardControl: function (container) {
        let newCard = container.querySelector('[data-id = "newCard"]');
        let inputCardTitle = newCard.querySelector('#createNewCardTitle');
        let saveIcon = newCard.querySelector('.fa-save');
        let dismissIcon = newCard.querySelector('.fa-times');
        let boardId = dismissIcon.parentElement.parentElement.dataset.board_id;

        inputCardTitle.focus();

        inputCardTitle.addEventListener('keydown', function (event) {

        });
        saveIcon.addEventListener('click', function (event) {

        });
        dismissIcon.addEventListener('click', function (event) {

            newCard.remove();
            let newCardButton = document.querySelector(`#board-${boardId}`).querySelector('#newCardButton');
            newCardButton.addEventListener('click', function createNewCardHandler(event) {
                event.target.removeEventListener('click', createNewCardHandler);
                dom.insertNewCard(event, boardId);
            });
        });
    },

    addDropListener: function (board) {
        let columns = board.getElementsByClassName("proman-status");
        for (let i = 0; i < columns.length; i++) {
            columns[i].ondrop = function (e) {
                event.preventDefault();
                let cardId = e.dataTransfer.getData("text/plain");
                let cardContainer = document.getElementById(cardId).parentNode.cloneNode(true)
                document.getElementById(cardId).parentNode.remove();
                try {
                    this.insertBefore(cardContainer, document.getElementsByClassName("placeholder")[0]);
                } catch (e) {
                    this.appendChild(cardContainer);
                }
                // console.log(document.getElementsByClassName("placeholder"));
                let card =document.getElementById(cardId);
                let index = Array.from(cardContainer.parentNode.children).indexOf(cardContainer);
                card.dataset.status_id = this.dataset.col;
                card.dataset.order = index.toString();
                dom.addDragListener(card);
                dom.addDragOverCardHandler(card, dom.createPlaceholder());
                dom.removePlaceholders();
            };

            columns[i].ondragleave = function(e){
                e.preventDefault();
                if (!this.contains(e.target)) {
                    dom.removePlaceholders();
                }
            };

            columns[i].ondragover = function (e) {
                event.preventDefault();
            }
        }
    },

    addDragListener: function (card) {
        card.parentNode.ondragstart = function (e) {
            e.dataTransfer.setData('text/plain', card.id);
        };
    },

    addDragOverCardHandler: function (card, placeHolder) {
        card.ondragenter = function (e) {
            dom.insertAfter(placeHolder, card.parentNode);
        };
        placeHolder.ondragleave = function (e) {
            e.preventDefault();
            dom.removePlaceholders();
            this.remove();
        };
    },

    insertAfter: function (newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    },

    createPlaceholder: function () {
        console.log("calling clenup");
        dom.removePlaceholders();

        let placeHolder = document.createElement("div");
        placeHolder.style.height = "100px";
        placeHolder.style.width = "auto";
        placeHolder.classList.add("placeholder");

        return placeHolder;
    },

    removePlaceholders: function () {
        console.log("cleanup called");
        let placeholders = document.getElementsByClassName("placeholder");
        for (let i = 0; i < placeholders.length; i++){
            placeholders[i].remove();
            console.log("removed placholder: #" + placeholders.length )
        }
    }
}
;
