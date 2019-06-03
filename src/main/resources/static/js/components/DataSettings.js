import Vue from 'vue'
import $ from 'jquery'
import CSVService from '../services/CSVService'
import GraphService from '../services/GraphService'
import RESTService from '../services/RESTService'

const csvService = new CSVService();
const graphService = new GraphService();
const restService = new RESTService();

var Tabulator = require("tabulator-tables");

export default {
    data() {
        return {
            csvTableSelector: "#csvTable",
            table: undefined,
            cellEditorCallback: undefined,
            cellFormatterCallback: undefined,
            objectName: '',
            attributeName: '',
            systemLayers: [],
            layersSubsystemsHierarchy: {}
        }
    },
    created() {
        var self = this;

        self.cellFormatterCallback = function (cell, formatterParams) {
            var value = cell.getValue();

            if (isAttributeCell(cell)) {
                return "<span style='font-style: italic;'>" + value + "</span>";
            } else if (isObjectCell(cell)) {
                return "<span style='font-weight: bold;'>" + value + "</span>";
            }

            return value;
        }

        self.cellEditorCallback = function (cell, onRendered, success, cancel, editorParams) {
            var editor = createEditorForCell(cell);

            onRendered(function () {
                editor.focus();
                editor.style.css = "100%";
            });

            function successFunc() {
                if (isAttributeCell(cell) || isObjectCell(cell)) {
                    success(editor.value);
                } else {
                    success(editor.checked ? 1 : 0);
                }
            }

            editor.addEventListener("change", successFunc);
            editor.addEventListener("blur", successFunc);

            return editor;
        }

        function createEditorForCell(cell) {
            var editor = document.createElement("input");
            editor.style.padding = "3px";
            editor.style.width = "100%";
            editor.style.boxSizing = "border-box";
            editor.value = cell.getValue();

            if (isAttributeCell(cell) || isObjectCell(cell)) {
                editor.setAttribute("type", "text");
            } else {
                editor.setAttribute("type", "checkbox");
                editor.checked = cell.getValue() == 1 ? true : false;
            }

            return editor;
        }

        function isAttributeCell(cell) {
            return (cell.getRow().getData().id === 0);
        }

        function isObjectCell(cell) {
            return (cell.getColumn().getField().toString() === (0).toString());
        }

    },
    mounted() {
        var self = this;

        csvService.setCellFormatterCallback(self.cellFormatterCallback);
        csvService.setCellEditorCallback(self.cellEditorCallback);
        self.addLayer(null, false);
        self.initializeExportProjectListener();
    },
    methods: {
        initializeExportProjectListener: function() {
            var self = this;

            if (document.addEventListener) {
                document.addEventListener('exportProjectEvent', function(e) {
                    self.exportProject(e);
                }, false);
            } else {
                document.attachEvent('exportProjectEvent', function(e) {
                    self.exportProject(e);
                });
            }
        },
        exportProject: function() {
            var self = this;
            var a = window.document.createElement("a");
            a.href = 'data:application/json;charset=utf-8,%EF%BB%BF' + encodeURIComponent(JSON.stringify(self.systemLayers));
            a.download = "projectStructure.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        loadFile: function (id) {
            var self = this;
            var target = document.getElementById('csvFile_' + id);
            csvService.setCSVParseCompleteCallback(csvParseCallback, id);
            csvService.loadFile(target.files[0], id);

            function csvParseCallback(results, file) {
                var rows = [];

                $.each(results.data, function (rowIndex, cells) {
                    var row = {};
                    row.cells = cells;
                    rows.push(row);
                });

                self.drawTable(rows, id);


                restService.getGsh(rows, onSuccess);

                function onSuccess(response) {
                    var layerName = target.files[0].name;
                    graphService.showCyNotification(false);
                    graphService.drawGraph(response.data, layerName);
                    self.systemLayers[id].rows = rows;
                    self.systemLayers[id].name = layerName;
                }
            }
        },
        drawTable: function (rows, id) {
            var self = this;
            var tableColumnsDescriptor = [];
            var tableData = [];
            var numberOfCells = 0;

            $.each(rows, function (rowIndex, row) {
                var cells = row.cells;

                if (rowIndex === 0) {
                    numberOfCells = cells.length;
                    tableColumnsDescriptor = self.getTableColumnsDescriptor(numberOfCells);
                }

                if (cells.length === numberOfCells) {
                    tableData.push(self.getTableRow(cells, rowIndex));
                }
            });

            var csvTableSelector = '#csvTable_' + id;
            self.systemLayers[id].table = new Tabulator(csvTableSelector, {
                height: 205,
                data: tableData,
                layout: "fitData",
                columns: tableColumnsDescriptor,
                autoResize: true
            });
        },
        drawTableIfEmpty: function (id) {
            var self = this;

            if (!self.systemLayers[id].table) {
                var row = {};
                row.cells = [""];
                self.drawTable([row], id);
            }
        },
        getTableColumnsDescriptor: function (length) {
            var tableColumnsDescriptor = [];

            for (var i = 0; i < length; i++) {
                tableColumnsDescriptor.push(csvService.createTableColumn(i.toString()));
            }

            return tableColumnsDescriptor;
        },
        getTableRow: function (cells, index) {
            var row = {};
            row.id = index;

            $.each(cells, function (idx, value) {
                row[idx] = value;
            });

            return row;
        },
        applyChanges: function (id) {
            var self = this;
            var rows = [];
            var layer = self.systemLayers[id];
            var hierarchyLevel = parseInt($('#abstractionLayerOfContext_' + id).find('option:selected').val());

            $.each(layer.table.getData(), function (rowIndex, tableRow) {
                var row = {};
                var cells = [];

                $.each(tableRow, function (field, value) {
                    if (field !== 'id') {
                        cells.push(value);
                    }
                });

                row.cells = cells;
                rows.push(row);
            });

            restService.getGsh(rows, onSuccess);

            function onSuccess(response) {
                graphService.showCyNotification(false);

                if (hierarchyLevel === -1) {
                    graphService.drawGraph(response.data, layer.name);
                }
                else {
                    self.displayGraphOfSubsystems(id, hierarchyLevel);
                }

                layer.rows = rows;
                Vue.set(self.systemLayers, id, layer);
            }

            window.scrollToTop();
        },
        exportCSV: function (id) {
            var layer = this.systemLayers[id];
            csvService.exportToFile(layer.table.getData(), layer.name);
        },
        addTableRow: function (id) {
            var self = this;
            self.drawTableIfEmpty(id);

            var table = self.systemLayers[id].table;
            var row = {};
            row.id = self.getRowId(id, table.getRows().length);

            $.each(table.getColumns(), function (index, column) {
                var field = column.getField();

                if (index === 0) {
                    row[field] = $('#objectName_' + id).val();
                } else {
                    row[field] = 0;
                }
            });

            table.addRow(row);
        },
        addTableColumn: function (id) {
            var self = this;
            self.drawTableIfEmpty(id);

            var table = self.systemLayers[id].table;
            var columnName = self.getColumnName(id, table.getColumns().length);
            table.addColumn(csvService.createTableColumn(columnName));

            $.each(table.getRows(), function (index, row) {
                var updatedRow = {};

                if (index == 0) {
                    updatedRow[columnName] = $('#attributeName_' + id).val();
                } else {
                    updatedRow[columnName] = "0";
                }

                table.updateRow(index, updatedRow);
            });
        },
        removeTableRow(contextId) { // Object
            var self = this;
            var rowId = parseInt($('#tableRowToRemove_' + contextId).find('option:selected').val());
            var layer = self.systemLayers[contextId];
            layer.table.getRow(rowId).delete();
            Vue.set(self.systemLayers, layer.id, layer);
        },
        removeTableColumn(contextId) { // Attribute
            var self = this;
            var fieldName = parseInt($('#tableColumnToRemove_' + contextId).find('option:selected').val());
            var layer = self.systemLayers[contextId];
            layer.table.getColumn(fieldName).delete();
            Vue.set(self.systemLayers, layer.id, layer);
        },
        getRowId(key, tableLength) {
            var self = this;
            var layer = self.systemLayers[key];
            var nextId = layer.nextRowId;

            if (!nextId) {
                layer.nextRowId = tableLength + 1;
                Vue.set(self.systemLayers, layer.id, layer);
                return tableLength;
            }

            layer.nextRowId++;
            Vue.set(self.systemLayers, layer.id, layer);
            return nextId;
        },
        getColumnName(key, tableLength) {
            var self = this;
            var layer = self.systemLayers[key];
            var nextId = layer.nextColumnId;

            if (!nextId) {
                layer.nextColumnId = tableLength + 1;
                Vue.set(self.systemLayers, layer.id, layer);
                return tableLength.toString();
            }

            layer.nextColumnId++;
            Vue.set(self.systemLayers, layer.id, layer);
            return nextId.toString();
        },
        setUploadedFileName: function (event) {
            var fileName = event.target.files[0] ? event.target.files[0].name : "";
            $(event.target).closest('div').find('.custom-file-label').html(fileName);
        },
        addLayer: function (event, addedByUser) {
            var self = this;
            var id = !self.isEmptySystemLayers ? Object.keys(self.systemLayers).length : 0;
            var layerName = 'Context ' + (id + 1);
            var layer = {
                id: id,
                table: undefined,
                name: layerName,
                upperLayerName: 'Upper-layer',
                lowerLayerName: 'Sub-layer'
            };
            Vue.set(self.systemLayers, layer.id, layer);

            if (addedByUser) {
                self.scrollToElement($(event.target));
            }
        },
        removeLayer: function (id) {
            Vue.delete(this.systemLayers, id);
        },
        scrollToElement: function (element) {
            window.scrollToElement(element);
        },
        editName: function (id, selector) {
            $('#' + selector + 'Header_' + id).hide();
            $('#' + selector + 'EditButton_' + id).hide();
            $('#' + selector + 'InputContainer_' + id).show();
        },
        saveName: function (id, selector, nameKey) {
            var self = this;
            var layer = self.systemLayers[id];
            var inputContainer = $('#' + selector + 'InputContainer_' + id);
            layer[nameKey] = inputContainer.find('input').val();
            Vue.set(self.systemLayers, id, layer);
            $('#' + selector + 'Header_' + id).show();
            $('#' + selector + 'EditButton_' + id).show();
            inputContainer.hide();
        },
        saveSubsystemName: function (id, subsystem, selector) {
            var self = this;
            var layer = self.systemLayers[id];
            var subsystemTypeSelector = subsystem.type + 'Subsystems';
            var subsystems = layer[subsystemTypeSelector];
            subsystems[subsystem.id].name = $('#' + selector).find('input').val();
            layer[subsystemTypeSelector] = subsystems;
            Vue.set(self.systemLayers, id, layer);
            $('#' + selector).hide();
        },
        attributeNameInputChanged: function (id) {
            var self = this;
            var selector = '#attributeName_' + id;
            var input = $(selector);
            var layer = self.systemLayers[id];
            layer.addAttributeDisabled = input.val() ? false : true;
            Vue.set(self.systemLayers, id, layer);
        },
        objectNameInputChanged: function (id) {
            var self = this;
            var selector = '#objectName_' + id;
            var input = $(selector);
            var layer = self.systemLayers[id];
            layer.addObjectDisabled = input.val() ? false : true;
            Vue.set(self.systemLayers, id, layer);
        },
        selectSubLayer: function (event, id) {
            var self = this;
            var layer = self.systemLayers[id];
            var subContextId = event.target.value;
            var subLayer = self.systemLayers[subContextId];

            removeExistingRelationIfAny(layer);

            layer.subContextId = subContextId;
            subLayer.superContextId = id;

            Vue.set(self.systemLayers, id, layer);
            Vue.set(self.systemLayers, subContextId, subLayer);

            function removeExistingRelationIfAny(layer) {
                var existingSubContextId = layer.subContextId;

                if (existingSubContextId) {
                    var previousSubContext = self.systemLayers[existingSubContextId];
                    previousSubContext.superContextId = undefined;
                    Vue.set(self.systemLayers, existingSubContextId, previousSubContext);
                }
            }
        },
        checkIfRowsAreParentLayerColumns: function (parentLayerId, layerToCheck) {
            var self = this;
            var parentLayer = self.systemLayers[parentLayerId];

            if (!parentLayer.rows) {
                return false;
            }

            var parentLayerAttributes = parentLayer.rows[0].cells.slice(1);
            var subLayerObjects = [];

            $.each(layerToCheck.rows, function (index, row) {
                if (index > 0) {
                    var cellValue = row.cells[0];
                    if (cellValue) {
                        subLayerObjects.push(cellValue);
                    }
                }
            });

            // All parent attributes are sub-layer rows at the same time
            return parentLayerAttributes.every(elem => subLayerObjects.indexOf(elem) > -1);
        },
        subLayerCandidates: function (id) {
            var self = this;

            if (self.systemLayers) {
                return self.systemLayers.filter(layer => {
                    var isCandidate = (layer.id != id) && (typeof layer.superContextId === 'undefined');
                    isCandidate = isCandidate && (layer.id != self.systemLayers[id].superContextId);

                    if (isCandidate) {
                        isCandidate = self.checkIfRowsAreParentLayerColumns(id, layer);
                    }

                    return isCandidate;
                })
            }

            return [];
        },
        addSubsystem: function (id, layerType, parentSubsystem) {
            var self = this;
            var subsystem = {};
            var layer = self.systemLayers[id];
            var subsystemsSelector = layerType + 'Subsystems';
            var subsystemHierarchySelector = layerType + 'SubsystemsHierarchy';
            var subsystems = layer[subsystemsSelector];
            var subsystemsHierarchy = layer[subsystemHierarchySelector];
            var isChild = (parentSubsystem !== null) && (typeof parentSubsystem !== 'undefined');

            if (!subsystems) {
                subsystems = {};
            }

            if (!subsystemsHierarchy) {
                subsystemsHierarchy = {};
            }

            subsystem.type = layerType;
            subsystem.id = self.getSubsystemId(id);
            subsystem.hierarchyLevel = 1;

            if (isChild) {
                subsystem.name = getNewSubsystemName('Child subsystem', subsystems[parentSubsystem.id].name);
                subsystem.hierarchyLevel = parentSubsystem.hierarchyLevel + 1;
                subsystemsHierarchy[subsystem.id] = parentSubsystem.id;
            } else if (layerType === 'upper') {
                subsystem.name = getNewSubsystemName('Subsystem', layer.upperLayerName);
            } else if (layerType === 'lower') {
                subsystem.name = getNewSubsystemName('Subsystem', layer.lowerLayerName);
            }

            subsystems[subsystem.id] = subsystem;
            layer[subsystemsSelector] = subsystems;
            layer[subsystemHierarchySelector] = subsystemsHierarchy;
            Vue.set(self.systemLayers, id, layer);

            function getNewSubsystemName(prefix, parentName) {
                return prefix + ' of ' + parentName
            }
        },
        getSubsystemId(contextId) {
            var self = this;
            var layer = self.systemLayers[contextId];
            var nextId = layer.nextSubsystemId;

            if (!nextId) {
                layer.nextSubsystemId = 1;
                Vue.set(self.systemLayers, layer.id, layer);
                return 0;
            }

            layer.nextSubsystemId++;
            Vue.set(self.systemLayers, layer.id, layer);
            return nextId;
        },
        removeSubsystem: function (id, subsystem) {
            var self = this;
            var layer = self.systemLayers[id];
            var subsystemsSelector = subsystem.type + 'Subsystems';
            var subsystemHierarchySelector = subsystem.type + 'SubsystemsHierarchy';
            var subsystems = layer[subsystemsSelector];
            var subsystemsHierarchy = self.systemLayers[id][subsystemHierarchySelector];

            deleteRelatedChildSubsystems();
            subsystemsHierarchy = getUpdatedHierarchies();

            layer[subsystemsSelector] = subsystems;
            layer[subsystemHierarchySelector] = subsystemsHierarchy;
            Vue.set(self.systemLayers, id, layer);
            Vue.delete(subsystems, subsystem.id);

            function deleteRelatedChildSubsystems() {
                $.each(self.getChildren(id, subsystem), function (index, childSubsystem) {
                    self.removeSubsystem(id, childSubsystem);
                });
            }

            function getUpdatedHierarchies() {
                var updatedHierarchies = subsystemsHierarchy;

                $.each(subsystemsHierarchy, function (subsystemId, parentId) {
                    if (subsystemId.toString() === subsystem.id.toString())
                        updatedHierarchies = self.removeElementFromArray(updatedHierarchies, subsystem.id);
                });

                return updatedHierarchies;
            }
        },
        addSubsystemElement: function (id, subsystem, selector) {
            if ($('#' + selector).is(":hidden")) {
                $('#' + selector).show();
                return;
            }

            var value = $('#' + selector).find('option:selected').val();

            if (!value) {
                return;
            }

            var self = this;
            var layer = self.systemLayers[id];
            var subsystemTypeSelector = subsystem.type + 'Subsystems';

            if (!subsystem.elements) {
                subsystem.elements = [];
            }

            subsystem.elements.push($('#' + selector).find('option:selected').val());
            layer[subsystemTypeSelector][subsystem.id] = subsystem;
            Vue.set(self.systemLayers, id, layer);
            $('#' + selector).hide();

        },
        deleteSubsystemElement: function (contextId, subsystem, element) {
            var self = this;
            var layer = self.systemLayers[contextId];
            var subsystemsSelector = subsystem.type + 'Subsystems';
            var subsystems = layer[subsystemsSelector];

            subsystem.elements = self.removeElementFromArray(subsystem.elements, element);

            subsystems[subsystem.id] = subsystem;
            layer[subsystemsSelector] = subsystems;

            // Remove element from child systems recursively
            $.each(self.getChildren(contextId, subsystem), function (index, childSubsystem) {
                if ($.inArray(element, childSubsystem.elements) > -1) {
                    self.deleteSubsystemElement(contextId, childSubsystem, element);
                }
            });

            Vue.set(self.systemLayers, contextId, layer);
        },
        isEmptyObject: function (object) {
            return !object || $.isEmptyObject(object);
        },
        subsystemCandidates: function (id, subsystem) {
            if (typeof subsystem === 'undefined') {
                return [];
            }

            var self = this;
            var layer = self.systemLayers[id];

            var candidates = [];

            // If has parent system
            if (self.hasParentSubsystem(id, subsystem)) {
                var parentSubsystemId = self.getParentSubsystemId(id, subsystem);
                var parentSubsystem = layer[subsystem.type + 'Subsystems'][parentSubsystemId];

                candidates = parentSubsystem.elements ? parentSubsystem.elements : [];

                return filterSubsystemElementCandidates(self.getChildren(id, parentSubsystem), candidates)
            } else if (subsystem.type === 'upper') {
                var lowerLayerElements = [];

                $.each(layer.rows, function (index, row) {
                    if (index > 0) {
                        var cellValue = row.cells[0];
                        if (cellValue) {
                            lowerLayerElements.push(cellValue);
                        }
                    }
                });

                candidates = lowerLayerElements;
            } else {
                candidates = layer.rows[0].cells.slice(1);
            }

            return filterSubsystemElementCandidates(layer[subsystem.type + 'Subsystems'], candidates);

            function filterSubsystemElementCandidates(subsystemsToCheck, candidates) {
                return candidates.filter(candidate => {
                    var isCandidate = true;

                    $.each(subsystemsToCheck, function (index, system) {
                        if ($.inArray(candidate, system.elements) > -1) {
                            isCandidate = false;
                        }
                    });

                    return isCandidate;
                });
            }
        },
        displayGraphOfSubsystems: function (id, hierarchyLevel) {
            var self = this;
            var rows = [{cells: [""]}];
            var layer = self.systemLayers[id];
            var subsystemsOfUpperLayer = layer['upperSubsystems'];
            var subsystemsOfLowerLayer = layer['lowerSubsystems'];

            // Set attributes
            $.each(subsystemsOfLowerLayer, function (index, subsystem) {
                if (subsystem.hierarchyLevel === hierarchyLevel) {
                    rows[0].cells.push(subsystem.id);
                }
            });

            // Set objects
            $.each(subsystemsOfUpperLayer, function (index, subsystem) {
                if (subsystem.hierarchyLevel === hierarchyLevel) {
                    var newIndex = parseInt(index) + 1;
                    rows[newIndex] = {};
                    rows[newIndex].cells = [subsystem.id];
                }
            });

            // Set relations
            $.each(rows, function (i, row) {
                // Ignore header, it contains attributes, not relations
                if (i !== 0) {
                    // For each element of the upper subsystem
                    var upperSubsystemId = row.cells[0];
                    $.each(subsystemsOfUpperLayer[upperSubsystemId].elements, function (elUpperIdx, elUpper) {
                        // Check each lower subsystem elements
                        $.each(rows[0].cells, function (j, lowerSubsystemId) {
                            if (j !== 0) {
                                $.each(subsystemsOfLowerLayer[lowerSubsystemId].elements, function (elLowerIdx, elLower) {
                                    rows[i].cells[j] = areRelated(layer.rows, elUpper, elLower) ? '1' : '0';
                                    if (rows[i].cells[j] === 1) {
                                        return false; // Break the loop if at least one relation is found
                                    }
                                });
                            }
                        });
                    });

                }
            });

            // Set subsystem names
            $.each(rows[0].cells, function (i, cell) {
                if (i !== 0) {
                    rows[0].cells[i] = subsystemsOfLowerLayer[cell].name;
                }
            });

            $.each(rows, function (i, row) {
                if (i !== 0) {
                    rows[i].cells[0] = subsystemsOfUpperLayer[row.cells[0]].name;
                }
            });

            restService.getGsh(rows, onSuccess);

            function onSuccess(response) {
                graphService.showCyNotification(false);
                graphService.drawGraph(response.data, "Subsystems of " + self.systemLayers[id].name + " layer");
            }

            function areRelated(rows, upperElement, lowerElement) {
                var relationsInCells = [];
                var areRelated = false;

                $.each(rows, function (i, row) {
                    if ((i !== 0) && (row.cells[0] === upperElement)) {
                        $.each(row.cells, function (j, cell) {
                            if (j !== 0 && cell && cell === '1') {
                                relationsInCells.push(j);
                            }
                        });
                    }
                });

                $.each(rows[0].cells, function (i, cell) {
                    if ((cell === lowerElement) && ($.inArray(i, relationsInCells) > -1)) {
                        areRelated = true;
                        return;
                    }
                });

                return areRelated;
            }
        },
        drawGraphWithAbstractionLayer: function (contextId) {
            var self = this;
            var hierarchyLayer = parseInt($('#abstractionLayerOfContext_' + contextId).find('option:selected').val());

            if (hierarchyLayer === -1) { // Atomic
                self.applyChanges(contextId);
            } else {
                self.displayGraphOfSubsystems(contextId, hierarchyLayer);
                window.scrollToTop();
            }
        },
        superiorSubsystems: function (contextId, subsystems) {
            var self = this;
            var result = {};

            $.each(subsystems, function (i, subsystem) {
                if (!self.hasParentSubsystem(contextId, subsystem)) {
                    result[subsystem.id] = subsystem;
                }
            });

            return result;
        },
        getChildren: function (contextId, subsystem) {
            var self = this;
            var result = [];
            var subsystems = self.systemLayers[contextId][subsystem.type + 'Subsystems'];
            var subsystemsHierarchy = self.systemLayers[contextId][subsystem.type + 'SubsystemsHierarchy'];

            $.each(subsystemsHierarchy, function (subsystemId, parentId) {
                if (parentId.toString() === subsystem.id.toString()) {
                    result.push(subsystems[subsystemId]);
                }
            });

            return result;
        },
        hasParentSubsystem: function (contextId, subsystem) {
            return typeof this.getParentSubsystemId(contextId, subsystem) !== 'undefined';
        },
        getParentSubsystemId: function (contextId, subsystem) {
            var self = this;
            var hierarchy = self.systemLayers[contextId][subsystem.type + 'SubsystemsHierarchy'];
            return hierarchy ? hierarchy[subsystem.id] : hierarchy;
        },
        removeElementFromArray: function removeElementFromArray(array, elementToRemove) {
            return $.grep(array, function (value) {
                return value != elementToRemove;
            });
        },
        getGreatestHierarchyLevel: function (contextId) {
            var self = this;
            var greatestLevel = 0;
            var upperSubsystems = self.systemLayers[contextId]['upperSubsystems'];
            var lowerSubsystems = self.systemLayers[contextId]['upperSubsystems'];

            getGreatestLevel(upperSubsystems);
            getGreatestLevel(lowerSubsystems);
            return greatestLevel;

            function getGreatestLevel(upperSubsystems) {
                $.each(upperSubsystems, function (idx, subsystem) {
                    if (subsystem.hierarchyLevel > greatestLevel) {
                        greatestLevel = subsystem.hierarchyLevel;
                    }
                });
            }
        },
        getTableRows: function (contextId) {
            var self = this;
            var rows = self.systemLayers[contextId].table.getRows();
            return rows.slice(1); // Removes first row
        },
        getTableColumns: function(contextId) {
            var self = this;
            var columns = self.systemLayers[contextId].table.getColumns();
            return columns.slice(1);
        },
        getAttributeName: function (contextId, field) {
            var self = this;
            var attributeNamesRow = self.systemLayers[contextId].table.getRows()[0];
            return attributeNamesRow.getCell(field).getValue();
        }
    },
    computed: {
        isEmptySystemLayers: function () {
            return this.isEmptyObject(this.systemLayers);
        },
        systemLayersHierarchy: function () {
            var self = this;
            var layerHierarchies = [];

            $.each(self.systemLayers, function (index, layer) {
                if ((typeof layer.subContextId !== 'undefined') && (typeof layer.superContextId === 'undefined')) {
                    var hierarchy = [];
                    hierarchy.push(layer);
                    layerHierarchies.push(hierarchy);
                }
            });

            $.each(layerHierarchies, function (index, hierarchy) {
                var upperLayer = hierarchy[0];
                var hasNextLayer = true;

                while (hasNextLayer) {
                    var lowerLayer = self.systemLayers[upperLayer.subContextId];
                    hierarchy.push(lowerLayer);

                    if (typeof lowerLayer.subContextId === 'undefined') {
                        hasNextLayer = false;
                    } else {
                        upperLayer = lowerLayer;
                    }
                }
            });

            return layerHierarchies;
        },
        systemStandaloneLayers: function () {
            var self = this;
            return self.systemLayers.filter(layer => {
                return (typeof layer.subContextId === 'undefined') && (typeof layer.superContextId === 'undefined');
            });
        }
    }
};