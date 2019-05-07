package com.taltech.gsh.visualizer.model.gsh;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
public class SimplifiedConcept {
    private int id;
    private ArrayList<String> objectLabels;
    private ArrayList<String> attributeLabels;
}
