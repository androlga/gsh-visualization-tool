import Papa from 'papaparse'
import $ from 'jquery'

export default class CSVService {
    constructor() {
        this.defaultConf = {
            delimiter: "",	// auto-detect
            newline: "",	// auto-detect
            quoteChar: '"',
            escapeChar: '"',
            header: false,
            transformHeader: undefined,
            dynamicTyping: false,
            preview: 0,
            encoding: "ISO-8859-1",
            worker: false,
            comments: false,
            step: undefined,
            complete: this.notifyNoCallback,
            error: undefined,
            download: false,
            downloadRequestHeaders: undefined,
            skipEmptyLines: false,
            chunk: undefined,
            fastMode: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined,
            transform: undefined,
            delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
        };
        this.config = {};

        this.cellFormatterCallback = undefined;
        this.cellEditorCallback = undefined;
    }

    setCSVParseCompleteCallback(callback, confId) {
        var conf = this.defaultConf;
        conf.complete = callback;
        this.config[confId] = conf;
    }

    setCellFormatterCallback(callback) {
        this.cellFormatterCallback = callback;
    }

    setCellEditorCallback(callback) {
        this.cellEditorCallback = callback;
    }

    notifyNoCallback() {
        console.warn('No callback function for Papaparse service is defined.');
    }

    loadFile(file, confId) {
        Papa.parse(file, this.config[confId]);
    }

    getCSVRows(tableData) {
        var rows = [];

        $.each(tableData, function (rowIndex, tableRow) {
            var cells = [];

            $.each(tableRow, function (field, value) {
                if (field !== 'id') {
                    cells.push(value);
                }
            });

            rows.push(cells);
        });

        return rows;
    }

    exportToFile(tableData, fileName) {
        var rows = this.getCSVRows(tableData);
        var a = window.document.createElement("a");
        a.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(Papa.unparse(rows));
        a.download = fileName + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    createTableColumn(identifier) {
        var newColumn = {};
        newColumn.title = identifier;
        newColumn.field = identifier;
        newColumn.align = 'center';
        newColumn.editor = this.cellEditorCallback;
        newColumn.formatter = this.cellFormatterCallback;
        return newColumn;
    }
}
