(function setup() {

    "use strict";

    let draggingNavigationTabPositions = null;
    let draggedApplicationTab = null;

    const workareas = new Map([
        ["Plug-Ins", "Plug-Ins-Workarea"],
        ["Report-Generation", "Report-Generation-Workarea"],
        ["Workflow", "Database-Management-Workarea"]
    ]);

    // ************************************************************************
    // * Global Constant DOM Element References                               *
    // ************************************************************************
    const zosmfTabNavigation = document.getElementById("tabbed-zosmf-main-navigation");
    const zosmfTabTasksNavigation = document.getElementById("tabbed-zosmf-tasks");
    const zosmfTabApplicationsNavigation = document.getElementById("tabbed-zosmf-applications");
    const zosmfTabNavigationSeparator = document.getElementById("tabbed-zosmf-task-application-separator");
    const zosmfTabNavigationDropAreaIndicator = document.getElementById("tabbed-zosmf-application-drop-area-indicator");

    // ************************************************************************
    // *  DOM Element Getters                                                 *
    // ************************************************************************
    function getNavigationTaskTabs() {
        return zosmfTabTasksNavigation.querySelectorAll('li');
    }

    function getNavigationApplicationTabs() {
        return zosmfTabApplicationsNavigation.querySelectorAll('li');
    }



    // ************************************************************************
    // * zOSMF Tabbed Navigation Listeners                                    *
    // ************************************************************************
    zosmfTabNavigation.addEventListener('click', function (event) {
        let clickedTab = (event && event.target && event.target.tagName) ?
            (event.target.tagName === 'LI' ? event.target : undefined) :
            undefined;
        if (clickedTab) {
            let currentTab = document.querySelector('.tabbed-main-navigation .current');
            if (clickedTab.id !== currentTab.id) {
                currentTab.classList.toggle("current");
                clickedTab.classList.toggle("current");
                let currentTabWorkareaId = workareas.get(currentTab.id);
                let currentTabWorkAreaElement = document.getElementById(currentTabWorkareaId);
                if (currentTabWorkAreaElement) {
                    currentTabWorkAreaElement.style.display = 'none';
                }
                let clickedTabWorkareaId = workareas.get(clickedTab.id);
                let clickedTabWorkAreaElement = document.getElementById(clickedTabWorkareaId);
                if (clickedTabWorkAreaElement) {
                    clickedTabWorkAreaElement.style.display = 'initial';
                }

            }
        }
        //Hide All Content if any isnt already. This query all may be slow - could introduce switching mechanism
        let allAppWorkAreas = document.querySelectorAll(".appContentWorkSpace")
        for (let i = 0; i < allAppWorkAreas.length; i++) {
            allAppWorkAreas[i].style.display = 'none';
        }

    });

    // ************************************************************************
    // * zOSMF Tabbed Navigation Separator Functions                          *
    // ************************************************************************
    function setNavigationSeparatorVisibility() {
        let navAppTabs = getNavigationApplicationTabs();
        zosmfTabNavigationSeparator.style.display = (navAppTabs && navAppTabs.length > 1) ? "block" : "none";
    }

    // ************************************************************************
    // * zOSMF Tabbed Application Functions                                   *
    // ************************************************************************
    function appNavigationContains(applicationName) {
        let draggedApplicationSelector = "[id*='" + applicationName + "']";
        return zosmfTabApplicationsNavigation.querySelector(draggedApplicationSelector) !== null;
    }

    function addNavigationApplication(draggedTile) {

        if (appNavigationContains(draggedTile.getPluginId()) === false) {

            let newTaskListItem = document.createElement("li");
            newTaskListItem.id = draggedTile.getPluginId() + "-launcher";
            newTaskListItem.classList.add("app-launcher");

            newTaskListItem.style.backgroundImage = draggedTile.getApplicationIcon();

            newTaskListItem.innerHTML = "&nbsp;";

            newTaskListItem.setAttribute("draggable", "true");
            newTaskListItem.addEventListener("dragstart", function (event) {

                draggedApplicationTab = this;

                event.dataTransfer.setData("text/plain", this.id);
                event.dataTransfer.effectAllowed = "move";
            });

            newTaskListItem.addEventListener("dragend", function (event) {
                draggedApplicationTab = null;
            });

            zosmfTabApplicationsNavigation.insertBefore(newTaskListItem, zosmfTabNavigationDropAreaIndicator);
        }
    }

    // ************************************************************************
    // * zOSMF Tabbed Applications Listeners - BEGIN                          *
    // ************************************************************************
    let lastTabToRight;
    zosmfTabApplicationsNavigation.addEventListener("dragenter", function (event) {
        let draggedTile = pluginTilesHandler.getDraggedPluginTile();
        if (draggedTile && appNavigationContains(draggedTile.getPluginId()) === false) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = "copy";
            let tabToRight = getNavigationTabToRight(event.clientX);
            if (tabToRight !== lastTabToRight) {
                if (tabToRight !== null) {
                    zosmfTabApplicationsNavigation.insertBefore(zosmfTabNavigationDropAreaIndicator, tabToRight);
                } else {
                    zosmfTabApplicationsNavigation.appendChild(zosmfTabNavigationDropAreaIndicator);
                }
                lastTabToRight = tabToRight;
            }
            zosmfTabNavigationDropAreaIndicator.style.display = 'block';
            zosmfTabNavigationDropAreaIndicator.style.backgroundImage = draggedTile.getApplicationIcon();
            return false;
        }
    });

    zosmfTabApplicationsNavigation.addEventListener("dragover", function (event) {
        if (pluginTilesHandler.getDraggedPluginTile() !== null) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = "copy";
            let tabToRight = getNavigationTabToRight(event.clientX);
            if (tabToRight !== lastTabToRight) {
                zosmfTabApplicationsNavigation.removeChild(zosmfTabNavigationDropAreaIndicator);
                if (tabToRight !== null) {
                    zosmfTabApplicationsNavigation.insertBefore(zosmfTabNavigationDropAreaIndicator, tabToRight);
                } else {
                    zosmfTabApplicationsNavigation.appendChild(zosmfTabNavigationDropAreaIndicator);
                }
                lastTabToRight = tabToRight;
            }
            return false;
        } else if (draggedApplicationTab !== null) {
            event.preventDefault();
            event.stopPropagation();
            if (event.target.id !== draggedApplicationTab.id) {

                if (isAppLauncherNode(event.target)) {
                    let targetRect = event.target.getBoundingClientRect();
                    let targetMidPoint = targetRect.left + (targetRect.width / 2);
                    if (event.clientX < targetMidPoint && draggedApplicationTab.nextSibling !== event.target) {
                        zosmfTabApplicationsNavigation.insertBefore(draggedApplicationTab, event.target);
                    }
                    // else if (event.clientX > targetMidPoint && event.target.nextSibling != draggedApplicationTab) {
                    //     zosmfTabApplicationsNavigation.insertBefore(event.target, draggedApplicationTab);
                    // }
                } else {
                    zosmfTabApplicationsNavigation.appendChild(draggedApplicationTab);
                }
            }
            return false;
        }
    });

    zosmfTabApplicationsNavigation.addEventListener("dragleave", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (domRectContains(event.currentTarget.getBoundingClientRect(), event.clientX, event.clientY) === false) {
            zosmfTabNavigationDropAreaIndicator.style.display = 'none';
        }
        return null;
    });

    zosmfTabApplicationsNavigation.addEventListener("drop", function (event) {
        let draggedTile = pluginTilesHandler.getDraggedPluginTile();
        if (draggedTile) { // && isAppLauncherNode(draggedTile.)) {
            event.preventDefault();
            zosmfTabNavigationDropAreaIndicator.style.display = 'none';
            lastTabToRight = undefined;
            addNavigationApplication(draggedTile);
            setNavigationSeparatorVisibility();
        } else if (draggedApplicationTab !== null) {
            event.preventDefault();
        }
    });


    function getNavigationTabToRight(currentX, tabPositions) {
        let localTabPositions = tabPositions ? tabPositions : draggingNavigationTabPositions;
        for (let i = 0; i < localTabPositions.length; i++) {
            let nextPosition = localTabPositions[i];
            if (currentX < nextPosition.midPoint) {
                return nextPosition.domRef;
            }
        }
        return null;
    }

    function getNavigationTabPositions() {

        let tabPositions = [];

        let navigationTasks = getNavigationTaskTabs();
        for (let i = 0; i < navigationTasks.length; i++) {
            let nextTask = navigationTasks[i];
            // console.log(nextTask.id + "(" + nextTask.offsetLeft + ":" + (nextTask.offsetLeft + nextTask.offsetWidth) + ")" );
            tabPositions.push({
                'id': nextTask.id,
                'leftX': nextTask.offsetLeft,
                'width': nextTask.offsetWidth,
                'midPoint': (nextTask.offsetLeft + (nextTask.offsetWidth / 2)),
                'domRef': nextTask
            });
        }

        tabPositions.concat(getNavigationApplicationTabPositions());
        console.log(tabPositions);

        return tabPositions;
    }

    function getNavigationApplicationTabPositions() {

        let applicationTabPositions = [];
        let navigationApps = getNavigationApplicationTabs();

        for (let i = 0; i < navigationApps.length; i++) {
            let nextApp = navigationApps[i];
            // console.log(nextApp.id + "(" + nextApp.offsetLeft + ":" + (nextApp.offsetLeft + nextApp.offsetWidth) + ")" );
            applicationTabPositions.push({
                'id': nextApp.id,
                'leftX': nextApp.offsetLeft,
                'width': nextApp.offsetWidth,
                'midPoint': (nextApp.offsetLeft + (nextApp.offsetWidth / 2)),
                'domRef': nextApp
            });
        }

        return applicationTabPositions;
    }

    // ************************************************************************
    // * Main WorkArea Listeners                                              *
    // ************************************************************************
    const zosmfMainWorkarea = document.getElementById("zosmf-main");
    zosmfMainWorkarea.addEventListener("dragenter", function (event) {
        if (draggedApplicationTab !== null) {
            event.preventDefault();
            return false;
        }
    });

    zosmfMainWorkarea.addEventListener("dragover", function (event) {
        if (draggedApplicationTab !== null) {
            event.preventDefault();
            return false;
        }
    });

    zosmfMainWorkarea.addEventListener("drop", function (event) {
        if (draggedApplicationTab !== null) {
            event.preventDefault();
            if (draggedApplicationTab.classList.contains("current")) {
                zosmfTabNavigation.querySelector("#Overview").classList.add("current");
            }
            zosmfTabApplicationsNavigation.removeChild(draggedApplicationTab);
            setNavigationSeparatorVisibility();
            return false;
        }
    });


    // ************************************************************************
    // * PluginTile                                                           *
    // ************************************************************************
    function PluginTile(domNode) {

        this._domNode = domNode;
        this._pluginId = domNode.id;
        this._isApplication = this._domNode.classList.contains('application');
        this._applicationIcon = this._isApplication ?
            this._domNode.querySelector(".application-icon").style.backgroundImage :
            null;

        if (this._isApplication) {
            this._domNode.setAttribute('draggable', 'true');
            this._domNode.addEventListener("dragstart", PluginTile.pluginTileDragStart);
            this._domNode.addEventListener("dragend", PluginTile.pluginTileDragEnd);
            this._domNode.addEventListener("click", PluginTile.pluginTileClick);
            // this.domNode.addEventListener("drag", function(event) {});
        }
    }

    PluginTile.pluginTileDragStart = function (event) {
        event.dataTransfer.setData("text/plain", this.id);
        event.dataTransfer.setData("text", this.id);
        event.dataTransfer.effectAllowed = "copy";
        draggingNavigationTabPositions = getNavigationApplicationTabPositions();
    };

    PluginTile.pluginTileDragEnd = function (event) {
        draggingNavigationTabPositions = null;
        zosmfTabNavigationDropAreaIndicator.style.display = 'none';
    };

    PluginTile.pluginTileClick = function (event) {
        /*                let clickedTab = (event && event.target && event.target.tagName) ?
                            (event.target.tagName === 'LI' ? event.target : undefined) :
                            undefined;
                        if (clickedTab) {
                            let currentTab = document.querySelector('.tabbed-main-navigation .current');
                            if (clickedTab.id !== currentTab.id) {
                                currentTab.classList.toggle("current");
                                clickedTab.classList.toggle("current");
                                let currentTabWorkareaId = workareas.get(currentTab.id);
                                let currentTabWorkAreaElement = document.getElementById(currentTabWorkareaId);
                                if (currentTabWorkAreaElement) {
                                    currentTabWorkAreaElement.style.display = 'none';
                                }
                                let clickedTabWorkareaId = workareas.get(clickedTab.id);
                                let clickedTabWorkAreaElement = document.getElementById(clickedTabWorkareaId);
                                if (clickedTabWorkAreaElement) {
                                    clickedTabWorkAreaElement.style.display = 'initial';
                                }

                            }
                        }*/
        console.log("Tile Click Event Fire");
        debugger;

        let currentTab = document.querySelector('.tabbed-main-navigation .current');
        let currentTabWorkareaId = workareas.get(currentTab.id);
        let currentTabWorkAreaElement = document.getElementById(currentTabWorkareaId);
        if (currentTabWorkAreaElement) {
            currentTabWorkAreaElement.style.display = 'none';
        }
        //Fix this redundant statement.
        let clickedTile = (event && event.target && event.target.tagName) ?
            (event.target.tagName === 'LI' ? event.target : event.target) :
            event.target;
        console.log("clicked tile original id is " + clickedTile.id);
        console.log("this id is " + this.id);
        clickedTile = clickedTile.parentElement.parentElement; //Hacky - fix this. Click registers at a lower level
        console.log("clicked tile parent parent id is " + clickedTile.id);
        clickedTile = clickedTile.parentElement.parentElement; //Hacky - fix
        let tileContent = document.getElementById(this.id + "Content");
        debugger;

        if (tileContent) {
            tileContent.style.display = 'initial';
        }

    };

    PluginTile.prototype = {
        constructor: PluginTile,

        isApplication: function () {
            return this._isApplication;
        },

        getApplicationIcon: function () {
            return this._applicationIcon;
        },

        getPluginId: function () {
            return this._pluginId;
        }
    };

    // ************************************************************************
    // * Plugins Handler                                                      *
    // ************************************************************************
    const pluginTilesHandler = (function () {

        let pluginTiles = [];
        let draggedPluginTile = null;
        debugger;
        let pluginTileNodesList = document.querySelectorAll("#zosmf-plugin-tiles.tile-viewer"); //Get all the ones across all tabs
        //let pluginTileNodesSingle = document.querySelector("#zosmf-plugin-tiles.tile-viewer"); //Get only the first tab
        let pluginTileNodes = [];
        for (let i = 0; i < pluginTileNodesList.length; i++) {
            for (let j = 0; j < pluginTileNodesList[i].children.length; j++) {
                pluginTileNodes.push(pluginTileNodesList[i].children[j]);
            }

        }
        //let pluginTileNodes = pluginTileNodesList ? pluginTileNodesList.children : null;
        if (pluginTileNodes) {
            for (let i = 0; i < pluginTileNodes.length; i++) {
                pluginTileNodes[i].addEventListener("dragstart", function (event) { // jshint ignore:line
                    draggedPluginTile = pluginTiles[i];
                });
                pluginTileNodes[i].addEventListener("dragend", function (event) { // jshint ignore:line
                    draggedPluginTile = null;
                });
                pluginTiles.push(new PluginTile(pluginTileNodes[i]));

            }
        }

        return {

            getPluginTiles: function () {
                return pluginTiles;
            },

            getDraggedPluginTile: function () {
                return draggedPluginTile;
            }

        };
    })();

    function isTileNode(domNode) {

        return domNode && domNode.classList.contains('tile');
    }

    function isAppLauncherNode(domNode) {
        return domNode && domNode.classList.contains('app-launcher');
    }

    function domRectContains(domRect, x, y) {
        return (x > domRect.left && x < domRect.right && y > domRect.top && y < domRect.bottom);
    }

})();