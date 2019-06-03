import $ from 'jquery'
import html2canvas from 'html2canvas'

var cytoscape = require('cytoscape');
var dagre = require('cytoscape-dagre');
var nodeHtmlLabel = require('cytoscape-node-html-label');

nodeHtmlLabel(cytoscape);
cytoscape.use( dagre );

export default class GraphService {

    constructor() {
        this.layout = 'dagre';
    }

    drawGraph(gsh, graphName) {
        var self = this;

        var cy = window.cy = cytoscape({
            container: document.getElementById('cy'),
            style: [
                {
                    selector: 'node',
                    style: {
                        shape: 'ellipse',
                        'background-color': '#B7F1FF',
                        'border-width': '1px',
                        'border-color': '#000000',
                        'text-halign': 'right',
                        'text-valign': 'top'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'target-arrow-shape': 'triangle',
                        'line-color': '#000000',
                        'target-arrow-color': '#000000',
                        'curve-style': 'bezier'
                    }
                }],
            layout: {
                name: this.layout
            }
        });

        cy.nodeHtmlLabel([{
            tpl: d => getLabelHtml(d),
            halign: 'right',
            valign: 'center',
            halignBox: 'right',
            valignBox: 'center'
        }]);

        function getLabelHtml(data) {
            var cardHeader = '';
            var cardBody = '';

            if (data.attributeLabel) {
                cardHeader = '<div class="card-header node-label-header">' + data.attributeLabel + '</div>';
            }

            if (data.objectLabel) {
                cardBody = '<div class="card-body node-label-body">'
                    + '<ul class="list-group list-group-flush">'
                    + '<li class="list-group-item">' + data.objectLabel + '</li>'
                    + '</ul></div>';
            }

            return '<div class="card node-label">'
                    + cardHeader
                    + cardBody
                    + '</div>';
        }


        $.each(gsh.allConcept, function (k, concept) {
            cy.add({
                    data: {
                        id: concept.id,
                        objectLabel: self.getLabel(concept.objectLabels),
                        attributeLabel: self.getLabel(concept.attributeLabels)
                    },
                    classes: 'myCustomNode'
                }
            );
        });

        $.each(gsh.allEdge, function (k, edge) {
            cy.add({
                data: {
                    id: edge.id,
                    source: edge.upperConceptId,
                    target: edge.lowerConceptId
                }
            });
        });


        self.resizeGraph();
        self.notifyListeners(graphName);
    };

    getLabel(labels) {
        return (labels) ? labels.join('<br>') : '';
    };

    resizeGraph() {
        var defaults = {
            // dagre algo options, uses default value on undefined
            nodeSep: nodeSep, // the separation between adjacent nodes in the same rank
            edgeSep: undefined, // the separation between adjacent edges in the same rank
            rankSep: undefined, // the separation between adjacent nodes in the same rank
            rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
            ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
            minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
            edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

            // general layout options
            fit: true, // whether to fit to viewport
            //padding: 30, // fit padding
            spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
            nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
            animate: false, // whether to transition the node positions
            animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
            animationDuration: 500, // duration of animation in ms if enabled
            animationEasing: undefined, // easing of animation if enabled
            boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
            ready: function(){}, // on layoutready
            stop: function(){} // on layoutstop
        };

        function nodeSep(node, pos) {
            return 10;
        }

        cy.layout({
            name: this.layout,
            spacingFactor: 3
        }).run();
    };

    exportImage() {
        html2canvas(document.querySelector("#cy")).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL();
            link.setAttribute('download', 'graph.png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    openImageTab() {
        html2canvas(document.querySelector("#cy")).then(canvas => {
            var image = new Image();
            image.src = canvas.toDataURL();
            var w = window.open("");
            w.document.write(image.outerHTML);
        });
    }

    showCyNotification(show) {
        var cyNotification = $('#cyNotification');

        if (show) {
            cyNotification.show();
        } else {
            cyNotification.hide();
        }
    }

    changeLayout(layout) {
        // TODO dagre params could be adjusted in the future
        this.layout = layout;
        this.resizeGraph();
    }

    notifyListeners(graphName) {
        var cytoscapeEvent = new CustomEvent('cytoscapeEvent', {detail: {'graphName': graphName}});
        document.dispatchEvent(cytoscapeEvent);
    }
}
