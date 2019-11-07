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
            dom.initRenameHandler();
            dom.addDeleteHandler();
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

};
