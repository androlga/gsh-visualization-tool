import VueCytoscape from 'vue-cytoscape'
import BootstrapVue from 'bootstrap-vue'

import Vue from 'vue'
import $ from 'jquery'

import 'vue-cytoscape/dist/vue-cytoscape.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'tabulator-tables/dist/css/tabulator_simple.css'

// Components
import Graph from './components/Graph.vue'
import DataSettings from './components/DataSettings.vue'
import subsystemCard from './components/common/SubsystemCard.vue'

Vue.use(BootstrapVue);
Vue.use(VueCytoscape);

window.scrollToTop = function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
};

window.scrollToElement = function(element) {
    $('html, body').animate({
        scrollTop: element.offset().top
    }, 1000);
};

Vue.component('subsystem-card', subsystemCard);

new Vue({
    el: '#graph',
    render: h => h(Graph)
});

new Vue({
    el: '#data-settings',
    render: h => h(DataSettings)
});