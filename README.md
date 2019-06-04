# Tool for Visualizing Galois Sub-hierarchies for Multi-layered Systems at Various Abstraction Levels
This tool is an outcome of the master's thesis (TalTech, 2019).

## Build
**Build front-end**

    npm run build


**Create JAR**

    mvn clean install package

**Run the JAR from console**:

    java -jar <jar-name>.jar
    
The application will start on the embedded server at 

    http://localhost:8080
    
## Use
To use the application go to application page at (by default):

    http://localhost:8080
    
### Context
Context is a binary matrix of relations of two layers (upper and lower).

To **create** the context press "Add context" button.

You can add as many context as you wish.

To **define context data** you can either 
1. load an existing CSV file or 
2. add attributes and objects manually

To **delete** the context press "Delete" button under the context name.

To **rename** the context press "Edit name" link near the context name.

To **rename the layer** press "Edit name" link next to layer name.

The **panel below the context table** allows to add/delete context object and attributes,
export the context as CSV file and apply changes on the graph.

**Table elements are modifiable**: click on the cell to change it (object/attribute names
and relations' values).

To **define a sub-context** select a candidate from the dropdown under the context table.

Sub-context candidate must have upper layer of the same elements as parent context's lower layer,
otherwise it will not appear in the list.

### Subsystems
Subsystems can be defined hierarchically for both context layers.

To **create** the sub-hierarchy press "Add subsystem": it will appear under the context
table panel.

Each **subsystem contains control elements** that allow to define lower subsystems, manage
elements of the subsystem, change subsystem's name or delete it.

### Graph
Graph is generated per context:

1. Automatically when new context is loaded from CSV

2. When "Apply" button is pressed on the control panel of the context

3. When "Show graph" button is pressed near the abstraction level selection dropdown (on the control panel of the context)

**Control panel** under the graph frame allows to save the graph image, restore initial
position of the craph and change graph layout.

Graph **elements are adjustable**: position of the elements can be moved, graph can be
zoomed in/out.

### System overview
System overview can be found at the end of the page. It contains the information about
defined contexts and their relations (i.e. relations between their layers, if any).

## Licence
**The MIT License**

Copyright 2019

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.