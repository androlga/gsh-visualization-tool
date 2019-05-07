package com.taltech.gsh.visualizer.helpers;

import colibri.lib.Relation;
import colibri.lib.TreeRelation;
import com.taltech.gsh.visualizer.model.csv.CSVDto;
import com.taltech.gsh.visualizer.model.csv.CSVRow;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CSVParser {
    public static Relation parse(CSVDto csv) {
        List<CSVRow> rows = csv.getRows();
        ArrayList<String> objects = new ArrayList();
        ArrayList<String> attributes = new ArrayList(rows.get(0).getCells());
        attributes.removeAll(Arrays.asList(""));
        Relation rel = new TreeRelation();

        for (int i = 1; i < rows.size(); i++) {
            List<String> cells = rows.get(i).getCells();

            for (int j = 0; j < cells.size(); j++) {
                String cell = cells.get(j);

                if (j == 0) {
                    objects.add(cell);
                } else if ("1".equals(cell)) {
                    rel.add(objects.get(i - 1), attributes.get(j - 1));
                }
            }
        }

        return rel;
    }
}
