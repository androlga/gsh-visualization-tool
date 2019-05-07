<template>
    <div class="container-fluid h-100">
        <div id="navBar" class="row">
            <div class="col">
                <nav class="navbar fixed-top navbar-expand-lg navbar-light bg-light">
                    <a class="navbar-brand" href="#">GSH visualization tool</a>
                    <a class="nav-link" href="#data-settings">Data settings</a>
                    <a class="nav-link" href="#graph" @click="scrollToTop">Graph <span v-if="graphName"> - <b>{{ graphName }}</b></span></a>
                    <a class="nav-link" href="#system-overview">System overview</a>
                </nav>
            </div>
        </div>
        <div id="graphModule" class="row h-75">
            <div class="col-lg border">
                <div id="cyNotification" class="alert alert-info hidden">
                    <strong>No data.</strong> Please select a CSV file and click the "Load CSV" button (below).
                </div>
                <div id="cy"></div>
            </div>
        </div>

        <div id="cytoscapeModule" class="row">
            <div v-if="isCytoscapeDefined" class="col padding-top-10">
                <form class="form-inline">
                    <div class="form-group">
                        <div class="form-group margin-right-10">
                            <button type="button" class="btn btn-primary margin-right-10" @click="resizeGraph">Restore initial position</button>
                        </div>

                        <div class="form-group margin-right-10">
                            <button type="button" class="btn btn-outline-primary margin-right-10" @click="exportImage">Save image</button>
                        </div>

                        <div class="form-group margin-right-10">
                            <button type="button" class="btn btn-outline-primary" @click="openImageTab">Open image in a new tab</button>
                        </div>

                        <div class="form-group">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Layout</span>
                                </div>
                                <select class="form-control" id="exampleFormControlSelect1" @change="changeLayout($event)">
                                    <option value="dagre">Hierarchical</option>
                                    <option value="grid">Grid</option>
                                    <option value="circle">Circle</option>
                                    <option value="cose">Cose</option>
                                    <option value="random">Random</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import $ from 'jquery'
    import GraphService from '../services/GraphService'

    const graphService = new GraphService();

    export default {
        data() {
            return {
                graphName: undefined,
                isCytoscapeDefined: false
            }
        },
        mounted() {
            var self = this;

            graphService.showCyNotification(true);
            self.hideLoader();
            self.initializeCytoscapeListener();
        },
        methods: {
            resizeGraph: function () {
                graphService.resizeGraph();
            },
            exportImage: function () {
                graphService.exportImage();
            },
            openImageTab: function () {
                graphService.openImageTab();
            },
            changeLayout: function (event) {
                graphService.changeLayout(event.target.value);
            },
            hideLoader: function () {
                $('.loader').fadeOut();
            },
            scrollToTop: function() {
                window.scrollToTop();
            },
            initializeGraph: function(e) {
                var self = this;
                self.graphName = e.detail.graphName;
                self.isCytoscapeDefined = true;
            },
            initializeCytoscapeListener: function() {
                var self = this;

                if (document.addEventListener) {
                    document.addEventListener('cytoscapeEvent', function(e) {
                        self.initializeGraph(e);
                    }, false);
                } else {
                    document.attachEvent('cytoscapeEvent', function(e) {
                        self.initializeGraph(e);
                    });
                }

            }
        }
    }
</script>