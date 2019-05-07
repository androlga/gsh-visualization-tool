package com.taltech.gsh.visualizer.model.gsh;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class SimplifiedGSHLattice {
    private List<SimplifiedConcept> allConcept = new ArrayList<>();
    private List<SimplifiedEdge> allEdge = new ArrayList<>();
}