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
        dom.addClickListener('#createNewBoard', dom.createNewBoard);
        dom.handleArchiveCardModal();
    },
    createNewBoard: function() {
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
        dom.handleNewBoardListeners();
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
        boardTitle['title'] = event.target.value ? event.target.value : 'New board';
        dataHandler.createNewBoard(boardTitle, function (data) {

            document.getElementById('newBoard').remove();
            dom.showBoard(data);
            dom.addClickListener('#createNewBoard', dom.createNewBoard);
        });
    },
    handleUnsavedTitle: function (originalTitle) {
        let titleInputContainer = document.getElementById('newBoard').querySelector('span');
        let titleContainer = document.getElementById('newBoard').querySelector('h5');
        titleInputContainer.remove();
        titleContainer.innerHTML = originalTitle;
        dom.renameUnsavedBoard();
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
        dom.handleRenameCard(newCard);
        dom.handleArchiveCard(newCard);
    },
    showBoard: function (board) {
        const boardTemplate = document.getElementById('board-template').innerHTML;
        const compiledBoardsTemplate = Handlebars.compile(boardTemplate);
        const renderedTemplate = compiledBoardsTemplate(board);
        document.getElementById('boardsContainer').insertAdjacentHTML('beforeend', renderedTemplate);
        let newBoard = document.getElementById("board-" + board.id);
        dom.loadCards(board['id']);
        dom.addListenerToNewCardButton(board['id']);
        dom.addDropListener(newBoard);
    },

    addBoardControls: function () {
        const boardControls = document.querySelectorAll('#dropdown-control');
        utils.addEventListenerTo(boardControls, 'click', function (event) {
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
                    let saveButton = document.createElement("button");


                    saveButton.textContent = ("save");
                    saveButton.classList.add("btn", "btn-info");
                    saveButton.addEventListener("click", function (e) {
                        e.stopPropagation();
                        let id = boards[i].id.substr(6);
                        dataHandler.updateBoard(id, boards[i].id, newTitle.value);
                        h5.innerHTML = newTitle.value;
                        done = true;
                    });

                    newTitle.value = originaltitleDisplay.textContent;
                    newTitle.classList.add("col", "input", "form-control", "mr-2");
                    /*newTitle.style.maxWidth = "40%";*/

                    span.classList.add("d-flex");
                    span.classList.add("w-50");
                    span.style.width = "100%";
                    span.id = "keksz";

                    span.appendChild(newTitle);
                    boards[i].firstElementChild.firstElementChild.insertAdjacentElement("afterbegin", span);
                    originaltitleDisplay.textContent = "";
                    originaltitleDisplay.append(span);
                    span.append(saveButton);
                    newTitle.focus();
                    // document.getElementById(boards[i].id + "-title").remove();
                }
            });
        }
    },

    createCardElement: function (cardData) {
        let card = `<div class="card-container proman-card">
                        <div class="card" data-id="newCard" data-board_id="${cardData['board_id']}" data-status_id="${cardData['status_id']}">
                            <div class="card-dismiss d-flex justify-content-end mt-2 mr-2">
                                <i class="far fa-save fa-lg p-2"></i><i class="fas fa-times fa-sm p-2"></i>
                            </div>
                            <div class="card-body float-left">
                                <h5 class="card-title text-left text-align-top">
                                    <input id="createNewCardTitle" class="form-control" type="text" name="cardTitle" placeholder="New card"/>
                                </h5>
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
        };

        let newCard = dom.createCardElement(cardData);
        let cardContainer = document.querySelector(`#board-${cardData['board_id']}`)
            .querySelector(`[data-col = '${cardData['status_id']}']`);
        cardContainer.insertAdjacentHTML('afterbegin', newCard);
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
            let key = event.key;
            if (key === 'Escape') {
                dom.dismissNewCard(newCard, boardId);
            } else if (key === 'Enter') {
                dom.saveNewCard(newCard, boardId, inputCardTitle);
            }
        });
        saveIcon.addEventListener('click', function (event) {
            dom.saveNewCard(newCard, boardId, inputCardTitle)
        });
        dismissIcon.addEventListener('click', function (event) {
            dom.dismissNewCard(newCard, boardId)
        });
    },
    addListenerToNewCardButton: function (boardId) {
        let newCardButton = document.querySelector(`#board-${boardId}`)
            .querySelector('#newCardButton');
        newCardButton.addEventListener('click', function createNewCardHandler(event) {
            event.target.removeEventListener('click', createNewCardHandler);
            dom.insertNewCard(event, boardId);
        });
    },
    dismissNewCard: function (newCard, boardId) {
        newCard.parentElement.remove();
        dom.addListenerToNewCardButton(boardId)
    },
    saveNewCard: function (newCard, boardId, inputCardTitle) {
        let cardData = newCard.dataset;
        cardData['title'] = inputCardTitle.value ? inputCardTitle.value : 'New card';
        dataHandler.createNewCard(cardData, function (response) {
            newCard.parentElement.remove();
            dom.showCard(response);
            dom.addListenerToNewCardButton(boardId)
        })
    },
    renameUnsavedBoard: function () {
        let titleElem = document.getElementById('newBoard').querySelector('h5');
        titleElem.addEventListener('click', function renameListener() {
            titleElem.removeEventListener('click', renameListener);
            titleElem.innerHTML = `<span class="d-flex w-50">
                                        <input id="createNewBoardTitle" class="input form-control" type="text" name="cardTitle" value="New board"/>
                                   </span>`;
            dom.handleNewBoardListeners();
        });
    },

    addDropListener: function (board) {
        let columns = board.getElementsByClassName("proman-status");
        for (let i = 0; i < columns.length; i++) {
            columns[i].ondrop = function (e) {
                e.preventDefault();
                let cardId = e.dataTransfer.getData("text/plain");
                let cardContainer = document.getElementById(cardId).parentNode.cloneNode(true);
                document.getElementById(cardId).parentNode.remove();
                try {
                    this.insertBefore(cardContainer, document.getElementsByClassName("placeholder")[0]);
                } catch (e) {
                    this.appendChild(cardContainer);
                }
                // console.log(document.getElementsByClassName("placeholder"));
                let card = document.getElementById(cardId);
                let index = Array.from(cardContainer.parentNode.children).indexOf(cardContainer);
                card.dataset.status_id = this.dataset.col;
                card.dataset.order = index.toString();
                dom.addDragListener(card);
                dom.handleRenameCard(card);
                dom.handleArchiveCard(card);
                dom.addDragOverCardHandler(card, dom.createPlaceholder());
                dom.removePlaceholders();
                dataHandler.updateCardStatusAndOrder(card.dataset.id, this.dataset.col, dom.getCardOrder(this));
            };

            columns[i].ondragleave = function (e) {
                e.preventDefault();
                if (!this.contains(e.target)) {
                    dom.removePlaceholders();
                }
            };

            columns[i].ondragover = function (e) {
                e.preventDefault();
            }
        }
    },

    getCardOrder: function (obj){
       let orederedIds = [];
       let cards = obj.getElementsByClassName("proman-card");
       console.log(cards);
       for (let i =0; i < cards.length; i++){
           console.log(cards[i].dataset);
           orederedIds.push(cards[i].dataset.id);
       }
       // console.log(orederedIds);
       return orederedIds
    },

    addDragListener: function (card) {
        card.parentNode.ondragstart = function (e) {
            e.dataTransfer.setData('text/plain', card.id);
        };
    },

    addDragOverCardHandler: function (card, placeHolder) {
        card.ondragenter = function (e) {
            // dom.insertAfter(placeHolder, card.parentNode);
            dom.insertAfter(dom.createPlaceholder(), card.parentNode);
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
        // console.log("calling clenup");
        dom.removePlaceholders();

        let placeHolder = document.createElement("div");
        placeHolder.style.height = "100px";
        placeHolder.style.width = "auto";
        placeHolder.classList.add("placeholder");

        return placeHolder;
    },
    handleNewBoardListeners: function () {
        let creatNewBoardInput = document.querySelector('#createNewBoardTitle');
        let originalTitle = creatNewBoardInput.value;
        creatNewBoardInput.select();
        creatNewBoardInput.addEventListener('keyup', function (event) {
            let key = event.key;
            if (key === 'Escape') {
                creatNewBoardInput.blur();
            } else if (key === 'Enter') {
                dom.saveNewBoardTitle(event);
            }
        });
        creatNewBoardInput.addEventListener('blur', function blurListener() {
            creatNewBoardInput.removeEventListener('blur', blurListener);
            dom.handleUnsavedTitle(originalTitle);
        });
    },

    handleRenameCard: function (cardNode) {
        let cardTitle = cardNode.querySelector('h5');

        cardTitle.addEventListener('click', function renameCard(event) {
            cardTitle.removeEventListener('click', renameCard);

            let originalTitle = cardTitle.innerText;
            cardTitle.innerHTML =
                `<input id="createNewCardTitle" class="form-control" type="text" name="cardTitle" value="${originalTitle}"/>`;

            let cardTitleInput = cardTitle.firstChild;
            cardTitleInput.select();
            cardTitleInput.addEventListener('keyup', function (event) {
                let key = event.key;
                if (key === 'Escape') {
                    this.blur();
                } else if (key === 'Enter') {
                    let newTitle = this.value ? this.value : originalTitle;
                    cardNode.querySelector('.card-body').innerHTML = `<h5 class="card-title text-left text-align-top">${newTitle}</h5>`;
                    cardNode.querySelector('.card-body').innerHTML =
                        `<h5 class="card-title text-left text-align-top">${ newTitle }</h5>`;
                    let card_id = cardNode.dataset.id;
                    let data = {'title': newTitle};
                    dataHandler.updateCardTitle(card_id, data, function (json) {
                        dom.handleRenameCard(cardNode);
                    });
                }
            });

            cardTitleInput.addEventListener('blur', function blurListener() {
                cardTitleInput.removeEventListener('click', blurListener);
                cardTitle.innerText = originalTitle;
                dom.handleRenameCard(cardNode);
            });
        });
    },
    removePlaceholders: function () {
        // console.log("cleanup called");
        let placeholders = document.getElementsByClassName("placeholder");
        for (let i = 0; i < placeholders.length; i++) {
            placeholders[i].remove();
            // console.log("removed placholder: #" + placeholders.length )
        }
    },
    handleArchiveCard: function (newCard) {
        let archiveButton = newCard.querySelector('i');
        archiveButton.addEventListener('click', function(event) {
            let clickedButton = event.target;
            let cardClicked = clickedButton.parentElement.parentElement;
            let clickedCardContainer = cardClicked.parentElement;
            let cardId = cardClicked.dataset.id;
            let archiveData = {'archive': true};

            dataHandler.updateCardTitle(cardId, archiveData, function () {
                clickedCardContainer.remove();
            });
        });
    },
    handleArchiveCardModal: function () {
        $('#archivedCards').on('show.bs.modal', function (event) {
            let targetButton = event.relatedTarget;
            let boardId = targetButton.dataset.board_id;
            dataHandler.getArchivedCardsByBoardId(boardId, function(json) {
                let rows = '';
                for (let card of json) {
                    rows +=
                        `<tr><td>${card.title}</td><td><button class="btn btn-outline-secondary restore" data-card_id="${card.id}" data-card_status="${card.status_id}">Restore</button></td></tr>`
                }
                document.querySelector('#archivedCards tbody').innerHTML = rows;
                let restoreButtons = document.querySelectorAll('#archivedCards .restore');
                for (let button of restoreButtons) {
                    button.addEventListener('click', function(event) {
                       let targetedRestore = event.target;
                       let cardId = targetedRestore.dataset.card_id;
                       let status = targetedRestore.dataset.card_status;
                       let cardData = {'archive': false,
                                       'status': status};
                       dataHandler.updateCardTitle(cardId, cardData, function(json) {
                           if (json) {
                               dom.showCard(json);
                               let restoredRow = targetedRestore.parentElement.parentElement;
                               restoredRow.remove();
                           }
                       })
                    })
                }
            })
        })
    },
};
