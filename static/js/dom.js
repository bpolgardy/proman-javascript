// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
            dom.initRenameHandler();
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        for (const board of boards) {
            console.log(board);
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


    initRenameHandler: function () {
        let boards = document.getElementsByClassName("promanBoard");
        // let boards = document.getElementsByClassName("promanBoard")[0].getElementsByTagName("h5");
        console.log(boards.length);


        function saveBoardName(id, boardId) {

        }

        for (let i = 0; i < boards.length; i++) {

            boards[i].getElementsByTagName("H5")[0].addEventListener('click', function () {
                if (! boards[i].getElementsByTagName("H5")[0].firstChild.firstChild) {
                    let originaltitleDisplay = boards[i].getElementsByTagName("H5")[0];
                    let text = originaltitleDisplay.textContent;
                    let newTitle = document.createElement("input");
                    let span = document.createElement("span");
                    let saveButton = document.createElement("button")


                    span.classList.add("d-flex");
                    span.classList.add("w-50");
                    span.style.width = "100%";

                    saveButton.textContent = ("save");
                    saveButton.classList.add("btn");
                    saveButton.addEventListener("click", function (e) {
                        let id = boards[i].id.substr(6);
                        dataHandler.updateBoard(id, boards[i].id, newTitle.value);
                    });

                    newTitle.value = originaltitleDisplay.textContent;
                    newTitle.classList.add("col");
                    newTitle.style.maxWidth = "20%";

                    span.appendChild(newTitle);
                    boards[i].firstElementChild.firstElementChild.insertAdjacentElement("afterbegin", span);
                    originaltitleDisplay.textContent = "";
                    originaltitleDisplay.append(span);
                    span.append(saveButton);
                    // document.getElementById(boards[i].id + "-title").remove();
                }
            });
        }
    }

};
