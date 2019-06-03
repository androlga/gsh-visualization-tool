#Tool for Visualizing Galois Sub-hierarchies for Multi-layered Systems at Various Abstraction Levels
This tool is an outcome of the master's thesis (TalTech, 2019).

##Build
**Build front-end**

    npm run build


**Create JAR**

    mvn clean install package

**Run the JAR from console**:

    java -jar <jar-name>.jar
    
The application will start on the embedded server at 

    http://localhost:8080
    
##Use
To use the application go to application page at (by default):

    http://localhost:8080
    
###Context
To **create** the context press "Add context" button.

You can add as many context as you wish.

To **define context data** you can either 
1. load an existing CSV file or 
2. add attributes and objects manually

To **delete** the context press "Delete" button under the context name.

To **rename** the context press "Edit name" link near the context name.

###Sub-hierarchies
TODO

###Graph
TODO

###Import/Export
TODO

##Licence
**The MIT License**

Copyright 2019

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.