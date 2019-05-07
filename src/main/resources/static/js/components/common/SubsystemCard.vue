<template>
    <div>
        <b-card style="min-width: 18rem;" :class="{'odd-card': subsystem.hierarchyLevel % 2 === 0, 'even-card': subsystem.hierarchyLevel % 2 !== 0 }">
            <b-card-body>
                <b-card-title>

                    <div class="editable-header">
                        <h4 class="margin-right-10">{{ subsystem.name }}</h4>
                        <button v-if="subsystem.elements && subsystem.elements.length > 0" type="button" class="btn btn-link btn-sm card-link"
                                @click="addSubsystem(contextKey, subsystem.type, subsystem)">Add subsystem</button>
                    </div>
                </b-card-title>

                <b-card-sub-title class="mb-2">{{ (subsystem.elements && subsystem.elements.length > 0)  ? 'Elements:': '' }}</b-card-sub-title>

                <b-card-text>
                    <ul>
                        <li v-for="element in subsystem.elements"> {{ element }} <button type="button" class="btn btn-link btn-sm card-link"
                                                                                         @click="deleteSubsystemElement(contextKey, subsystem, element)">Delete</button></li>
                    </ul>
                </b-card-text>

                <b-card-text v-if="!subsystem.elements"><i>No elements.</i></b-card-text>
                <button type="button" class="btn btn-link btn-sm card-link"
                        @click="editSubsystemName(getSubsystemInputContainerSelector(contextKey, subsystem, 'Name'))">Edit name</button>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeSubsystem(contextKey, subsystem)">Delete</button>
                <button type="button" class="btn btn-outline-success btn-sm" @click="addSubsystemElement(contextKey, subsystem, getSubsystemInputContainerSelector(contextKey, subsystem, 'Element'))">Add element</button>

                <div v-bind:id="getSubsystemInputContainerSelector(contextKey, subsystem, 'Name')" class="form-group padding-top-10 hidden">
                    <div class="input-group">
                        <input v-bind:value="subsystem.name">
                        <div class="input-group-append">
                            <button type="button" class="btn btn-outline-success" @click="saveSubsystemName(contextKey, subsystem, getSubsystemInputContainerSelector(contextKey, subsystem, 'Name'))">Save</button>
                        </div>
                    </div>
                </div>

                <div v-bind:id="getSubsystemInputContainerSelector(contextKey, subsystem, 'Element')" class="form-group padding-top-10 hidden">
                    <div class="input-group">
                        <select class="form-control">
                            <option disabled selected value>-</option>
                            <option v-for="element in subsystemCandidates(contextKey, subsystem)" :value="element">{{ element }}</option>
                        </select>
                        <div class="input-group-append">
                            <button type="button" class="btn btn-outline-success" @click="addSubsystemElement(contextKey, subsystem, getSubsystemInputContainerSelector(contextKey, subsystem, 'Element'))">Add</button>
                            <button type="button" class="btn btn-link" @click="hideSubsystemElements(getSubsystemInputContainerSelector(contextKey, subsystem, 'Element'))">Close</button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div v-if="getChildren(contextKey, subsystem).length > 0" v-for="child in getChildren(contextKey, subsystem)" class="col padding-top-10">
                        <subsystem-card v-bind:subsystem="child"
                                        v-bind:context-key="contextKey"
                                        :add-subsystem-element="addSubsystemElement"
                                        :subsystem-candidates="subsystemCandidates"
                                        :remove-subsystem="removeSubsystem"
                                        :save-subsystem-name="saveSubsystemName"
                                        :add-subsystem="addSubsystem"
                                        :get-children="getChildren"
                                        :delete-subsystem-element="deleteSubsystemElement"></subsystem-card>
                    </div>
                </div>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    import Vue from 'vue'
    import $ from 'jquery'

    export default {
        props: {
            subsystem: { type: Object },
            contextKey : Number,
            addSubsystemElement: { type: Function },
            subsystemCandidates: { type: Function },
            removeSubsystem: { type: Function },
            saveSubsystemName: { type: Function },
            addSubsystem: { type: Function },
            getChildren: { type: Function },
            deleteSubsystemElement: { type: Function }
        },
        methods: {
            hideSubsystemElements: function(selector) {
                $('#' + selector).hide();
            },
            getSubsystemInputContainerSelector: function(contextId, subsystem, selector) {
                return 'subsystem' + selector + 'InputContainer_' + contextId + '_' + subsystem.type + '_' + subsystem.id;
            },
            editSubsystemName: function(selector) {
                $('#' + selector).show();
            }
        }
    };
</script>

<style>
    div .odd-card {
        background-color: #f9f9f9;
    }

    div .even-card {
    }
</style>