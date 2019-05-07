package com.taltech.gsh.visualizer.controllers;

import GSH.CSVParser;
import GSH.GSHLattice;
import GSH.SimpleAlgorithm;
import colibri.lib.HybridLattice;
import colibri.lib.Lattice;
import colibri.lib.Relation;
import com.taltech.gsh.visualizer.helpers.GSHLatticeTransform;
import com.taltech.gsh.visualizer.model.csv.CSVDto;
import com.taltech.gsh.visualizer.model.gsh.SimplifiedGSHLattice;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileNotFoundException;

@RestController
public class MainRestController {

    @GetMapping("/gsh-from-file")
    public GSHLattice getGshFromFile(@RequestParam String path) {
        GSHLattice galoisSH = null;

        try {
            galoisSH = parseGraph(path);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        return galoisSH;
    }

    private GSHLattice parseGraph(String fullFilePath) throws FileNotFoundException {
        Relation r = CSVParser.parse(new File(fullFilePath));
        Lattice lattice = new HybridLattice(r);
        GSHLattice galoisSH = new GSHLattice(new SimpleAlgorithm(), null);
        galoisSH.executeAlgorithm(lattice);
        return galoisSH;
    }

    @PostMapping("/gsh")
    private SimplifiedGSHLattice getGsh(@RequestBody CSVDto csv) {
        Relation r = com.taltech.gsh.visualizer.helpers.CSVParser.parse(csv);
        Lattice lattice = new HybridLattice(r);
        GSHLattice galoisSH = new GSHLattice(new SimpleAlgorithm(), null);
        galoisSH.executeAlgorithm(lattice);
        return GSHLatticeTransform.transform(galoisSH);
    }

}
