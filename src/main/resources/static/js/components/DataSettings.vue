<template>
    <div id="data-settings" class="container-fluid h-100">
        <div class="row">
            <div class="col-lg" v-if="isEmptySystemLayers">
                <button type="button" class="btn btn-outline-success margin-right-10" @click="addLayer($event, true)">Add layer</button>
            </div>
        </div>

        <div class="row padding-top-10" v-for="(value, key, index) in systemLayers" :class="{'odd': key % 2 === 0, 'even': key % 2 !== 0 }">
            <div class="col-lg">
                <div class="row">
                    <div class="col padding-top-10">
                        <div class="editable-header">
                            <h3 v-bind:id="'contextNameHeader_' + key" class="margin-right-10">{{ value.name }}</h3>
                            <button v-bind:id="'contextNameEditButton_' + key" type="button" class="btn btn-link btn-sm margin-right-10" @click="editName(key, 'contextName')">Edit name</button>
                        </div>

                        <div v-bind:id="'contextNameInputContainer_' + key" class="form-group hidden">
                            <div class="input-group">
                                <input v-bind:value="value.name">
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-outline-success" @click="saveName(key, 'contextName', 'name')">Save</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group padding-top-10">
                            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeLayer(value.id)">Delete</button>
                            <button type="button" class="btn btn-outline-success btn-sm margin-right-10" @click="addLayer($event, true)">Add context</button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col padding-top-10">
                        <div class="input-group">
                            <div class="custom-file">
                                <input type="file" class="custom-file-input" @change="setUploadedFileName" v-bind:id="'csvFile_' + key">
                                <label class="custom-file-label" v-bind:for="'csvFile_' + key">Select CSV file</label>
                            </div>
                            <div class="input-group-append">
                                <button type="button" class="btn btn-success" @click="loadFile(key)">Load CSV</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col padding-top-10">
                        <div class="editable-header">
                            <h5 v-bind:id="'upperLayerNameHeader_' + key" class="margin-right-10">{{ value.upperLayerName }}</h5>
                            <button v-bind:id="'upperLayerNameEditButton_' + key" type="button" class="btn btn-link btn-sm margin-right-10" @click="editName(key, 'upperLayerName')">Edit name</button>
                            <button v-if="value.table" v-bind:id="'upperAddSubsystemButton_' + key" type="button" class="btn btn-link btn-sm margin-right-10" @click="addSubsystem(key, 'upper')">Add subsystem</button>
                        </div>

                        <div v-bind:id="'upperLayerNameInputContainer_' + key" class="form-group hidden">
                            <div class="input-group">
                                <input v-bind:value="value.upperLayerName">
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-outline-success" @click="saveName(key, 'upperLayerName', 'upperLayerName')">Save</button>
                                </div>
                            </div>
                        </div>

                        <div class="editable-header">
                            <h5 v-bind:id="'lowerLayerNameHeader_' + key" class="margin-right-10">{{ value.lowerLayerName }}</h5>
                            <button v-bind:id="'lowerLayerNameEditButton_' + key" type="button" class="btn btn-link btn-sm margin-right-10" @click="editName(key, 'lowerLayerName')">Edit name</button>
                            <button v-if="value.table" v-bind:id="'lowerAddSubsystemButton_' + key" type="button" class="btn btn-link btn-sm margin-right-10" @click="addSubsystem(key, 'lower')">Add subsystem</button>
                        </div>

                        <div v-bind:id="'lowerLayerNameInputContainer_' + key" class="form-group hidden">
                            <div class="input-group">
                                <input v-bind:value="value.lowerLayerName">
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-outline-success" @click="saveName(key, 'lowerLayerName', 'lowerLayerName')">Save</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="row">
                    <div class="col padding-top-10">
                        <div class="row">
                            <div class="col">
                                <div v-bind:id="'csvTable_' + key"></div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col padding-top-10">
                                <form class="form-inline">
                                    <div class="form-group">
                                        <div class="form-group margin-right-10">
                                            <div class="input-group csv-table-element">
                                                <input v-bind:id="'attributeName_' + key" class="form-control" placeholder="Attribute name"
                                                       aria-label="Attribute name" aria-describedby="basic-addon2" @keyup="attributeNameInputChanged(key)">
                                                <div class="input-group-append">
                                                    <button type="button" class="btn btn-outline-success" @click="addTableColumn(key)" :disabled="value.addAttributeDisabled">Add attribute</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="form-group margin-right-10">
                                            <div class="input-group csv-table-element">
                                                <input v-bind:id="'objectName_' + key" class="form-control" placeholder="Object name"
                                                       aria-label="Object name" aria-describedby="basic-addon2" @keyup="objectNameInputChanged(key)">
                                                <div class="input-group-append">
                                                    <button type="button" class="btn btn-outline-success" @click="addTableRow(key)" :disabled="value.addObjectDisabled">Add object</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="value.table" class="form-group csv-table-element">
                                            <button type="button" class="btn btn-success margin-right-10" @click="applyChanges(key)">Apply</button>
                                            <button type="button" class="btn btn-outline-success margin-right-10" @click="exportCSV(key)">Export CSV</button>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text">Sub-context</span>
                                                </div>
                                                <select class="form-control" @change="selectSubLayer($event, key)">
                                                    <option v-if="typeof value.subContextId === 'undefined'"disabled selected value>-</option>
                                                    <option v-if="typeof value.subContextId !== 'undefined'" disabled value>-</option>
                                                    <option v-if="typeof value.subContextId !== 'undefined'" selected :value="value.subContextId">
                                                        {{ systemLayers[value.subContextId].name }}
                                                    </option>
                                                    <option v-for="layer in subLayerCandidates(key)" :value="layer.id">{{ layer.name }}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div v-if="value.table" class="row padding-top-10">
                            <div class="col">
                                <form class="form-inline">
                                    <div class="form-group">
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text">Abstraction level</span>
                                            </div>
                                            <select v-bind:id="'abstractionLayerOfContext_' + key" class="form-control">
                                                <option selected value="-1">Atomic elements</option>
                                                <option v-for="level in Number(getGreatestHierarchyLevel(key))" :value="level">
                                                    Subsystems (level {{ level }})
                                                </option>
                                            </select>
                                            <div class="input-group-append">
                                                <button type="button" class="btn btn-success margin-right-10" @click="drawGraphWithAbstractionLayer(key)">Show graph</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div v-if="!isEmptyObject(value.upperSubsystems)" class="row padding-top-10">
                            <div class="col padding-top-10">
                                <h4>Subsystems of {{ value.upperLayerName }} layer</h4>
                            </div>
                        </div>

                        <div v-if="value.upperSubsystems" class="row padding-top-10">
                            <div v-for="subsystem in superiorSubsystems(key, value.upperSubsystems)" class="col padding-top-10">
                                <subsystem-card :subsystem="subsystem"
                                                :context-key="key"
                                                :add-subsystem-element="addSubsystemElement"
                                                :subsystem-candidates="subsystemCandidates"
                                                :remove-subsystem="removeSubsystem"
                                                :save-subsystem-name="saveSubsystemName"
                                                :add-subsystem="addSubsystem"
                                                :get-children="getChildren"
                                                :delete-subsystem-element="deleteSubsystemElement"></subsystem-card>
                            </div>
                        </div>

                        <div v-if="!isEmptyObject(value.lowerSubsystems)" class="row padding-top-10">
                            <div class="col padding-top-10">
                                <h4>Subsystems of {{ value.lowerLayerName }} layer</h4>
                            </div>
                        </div>

                        <div v-if="value.lowerSubsystems" class="row padding-top-10">
                            <div v-for="subsystem in superiorSubsystems(key, value.lowerSubsystems)" class="col padding-top-10">
                                <subsystem-card :subsystem="subsystem"
                                                :context-key="key"
                                                :add-subsystem-element="addSubsystemElement"
                                                :subsystem-candidates="subsystemCandidates"
                                                :remove-subsystem="removeSubsystem"
                                                :save-subsystem-name="saveSubsystemName"
                                                :add-subsystem="addSubsystem"
                                                :get-children="getChildren"
                                                :delete-subsystem-element="deleteSubsystemElement"></subsystem-card>
                            </div>
                        </div>

                        <div class="row padding-top-10">
                            <div class="col">
                                <!-- Context footer -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="system-overview" class="row">
            <div class="col-lg">
                <hr class="style-six">

                <h3>System overview</h3>

                <div v-for="(hierarchy, index) in systemLayersHierarchy">
                    <h4 v-if="index == 0">Connected contexts' relations (from upper to lower)</h4>

                    <h5>Hierarchy {{ index + 1}}</h5>
                    <ul>
                        <li v-for="layer in hierarchy">
                            {{ layer.upperLayerName }} ->  {{ layer.lowerLayerName }} <i>(Context: <u>{{ layer.name }}</u>)</i>

                            <ul v-if="!(typeof layer.subContextId === 'undefined')">
                                <li>
                                    {{ layer.lowerLayerName }} ->  {{ systemLayers[layer.subContextId].upperLayerName }} <i>(Contexts: <u>{{ layer.name }}</u> -> <u>{{ systemLayers[layer.subContextId].name }}</u>)</i>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <br>

                <hr class="style-six">

                <h4 v-if="systemStandaloneLayers.length > 0">Separate context(s)</h4>
                <ul>
                    <li v-for="layer in systemStandaloneLayers">
                        {{ layer.upperLayerName }} ->  {{ layer.lowerLayerName }} <i>(Context: <u>{{ layer.name }}</u>)</i>
                    </li>
                </ul>

            </div>
        </div>
    </div>
</template>

<script src="./DataSettings.js"></script>

<style>
    .editable-header h3, .editable-header h5 {
        margin: 0;
        display: inline-block;
    }

    .editable-header button {
        vertical-align: top;
    }

    div .odd {
        background-color: #f2f2f2;
    }

    div .even {
    }
</style>