package com.taltech.gsh.visualizer.helpers;

import GSH.GSHLattice;
import colibri.lib.Concept;
import colibri.lib.Edge;
import com.taltech.gsh.visualizer.model.gsh.SimplifiedConcept;
import com.taltech.gsh.visualizer.model.gsh.SimplifiedEdge;
import com.taltech.gsh.visualizer.model.gsh.SimplifiedGSHLattice;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import java.util.ArrayList;

public class GSHLatticeTransform {

    public static SimplifiedGSHLattice transform(GSHLattice gshLattice) {
        SimplifiedGSHLattice result = new SimplifiedGSHLattice();

        for (Concept c : gshLattice.getAllConcept()) {
            SimplifiedConcept sc = new SimplifiedConcept();
            sc.setAttributeLabels(new ArrayList<>(c.getAttributeLabels()));
            sc.setObjectLabels(new ArrayList<>(c.getObjectLabels()));
            sc.setId(hash(c));
            result.getAllConcept().add(sc);
        }

        for (Edge e : gshLattice.getAllEdge()) {
            SimplifiedEdge se = new SimplifiedEdge();
            se.setId(hash(e));
            se.setLowerConceptId(hash(e.getLower()));
            se.setUpperConceptId(hash(e.getUpper()));
            result.getAllEdge().add(se);
        }

        return result;
    }

    private static int hash(Concept c) {
        return new HashCodeBuilder(17, 37).
                append(c.getObjectLabels()).
                append(c.getAttributeLabels()).
                append(c.getAttributes()).
                append(c.getNotComparableConcepts()).
                append(c.getObjects()).
                append(c.getUpperConcepts()).
                toHashCode();
    }

    private static int hash(Edge e) {
        return new HashCodeBuilder(11, 31).
                append(hash(e.getLower())).
                append(hash(e.getUpper())).
                toHashCode();
    }
}
