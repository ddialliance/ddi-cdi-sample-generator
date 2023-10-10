class Column{
    id
    name
    displayLabel
    hasIntendedDataType = ""
    role
	position
    coded = false
    codeList = []
    catStat = {}
    values = []
    constructor(id, position, values){
		this.position = position
        this.values = values
        var type = guessType(values)
        if(type){
            this.hasIntendedDataType = type
        }
        if(isNaN(id)){
            this.name = id
        }
        this.id = id.replace(/\W/g,'_')
        this.calculateCatStat()
    }
    calculateCatStat(){
        for(const val of this.values){
            if (this.catStat[val]) {
                this.catStat[val] += 1
            } else {
                this.catStat[val] = 1
            }
        }
    }
    toJSON(){
        var variable = {
            '@id' : '#' + this.id,
            '@type' : 'InstanceVariable',
            'name' : this.name
        }
        if(this.displayLabel){
            variable.displayLabel = this.displayLabel
        }
        if(this.hasIntendedDataType){
            variable.hasIntendedDataType = this.hasIntendedDataType
        }
        return variable
    }
    getConceptScheme(){
        var conceptScheme = {
            '@id' : '#conceptScheme-'+this.id,
            '@type' : "skos:ConceptScheme",
            'skos:hasTopConcept' : []
        }
        for(const v of this.getUniqueValues()){
            conceptScheme['skos:hasTopConcept'].push('#'+this.id + '-concept-' + v)
        }
        return conceptScheme
    }
    getUniqueValues(){
        return [... new Set(this.values)]
    }
    createCodeList(){
        if(!this.coded){
            this.codeList = []
            return
        }
        for(const v of this.getUniqueValues()){
            var conceptId = this.id + '-concept-' + v
            this.codeList.push(new Code(conceptId, v, '#conceptScheme-'+this.id))
        }
    }
}

class Code{
    id
    prefLabel
    notation
    definition
    inScheme
    constructor(id, notation, inScheme){
        this.id = id
        this.notation = notation
        this.inScheme = inScheme
    }
    toJSON(){
        return {
            '@id' : '#' + this.id,
            '@type' : 'skos:Concept',
            'notation' : this.notation,
            'prefLabel' : this.prefLabel,
            'definition' : this.definition,
            'inScheme' : this.inScheme
        }
    }
}

function formatXml(xml, tab) { // tab = optional indent value, default is tab (  )
    var formatted = '', indent= '';
    tab = tab || '  ';
    xml.split(/>\s*</).forEach(function(node) {
        if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
        formatted += indent + '<' + node + '>\r\n';
        if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
    });
    return formatted.substring(1, formatted.length-3);
}

function createTextNode(xmlDoc, ns, name, text){
    var element = xmlDoc.createElementNS(ns,name)
    var elementText = xmlDoc.createTextNode(text)
    element.appendChild(elementText)
    return element
}

function saveFileBrowser(fileName, content){
  
    var downloadLink = document.createElement("a")
    downloadLink.download = fileName
    downloadLink.innerHTML = "Download File"
    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(content)
    } else {
      // Firefox requires the link to be added to the DOM before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(content)
      downloadLink.onclick = destroyClickedElement
      downloadLink.style.display = "none"
      document.body.appendChild(downloadLink)
    }
  
    downloadLink.click();
}

function CSVToArray(strData, strDelimiter){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}

function getColumnValues(csv, columnIndex, haveHeader){
    var startRow = 0
    if(haveHeader) startRow = 1;

    var column = [];
    for(var i=startRow; i<csv.length; i++){
       column.push(csv[i][columnIndex]);
    }
    return column;
}

function getCsvExamples(){
    return [
        {
            fileName: "test.csv",
            raw:"Frequency,Year,Age Cohort,Sex,Status,Median Income (USD)\nA,2003,C,M,ACT,5500\nA,2003,G,F,ACT,7500\nA,2004,E,M,EST,10000\nA,2005,B,F,ACT,14000\nA,2004,B,M,EST,2000"
        },
        {
            fileName: "tiny.csv",
            raw:"id,name,value,some date\n0,Pelle,13,2010-01-12\n1,Claus,15,2020-10-10"
        },
        {
            fileName: "spss_example.csv",
            raw: "RID,MARST,PWT\n10000001,3,537\m10000002,1,231\n10000003,2,599\n10000004,1,4003\n10000005,2,598"
        },
        {
            fileName: "canada_juvenile_crime.csv",
            raw: "Offense,Year,Geography,TotalNumber of Cases\nTotal guilty cases - sentences,2017/2018,Canada,14227\nTotal guilty cases - sentences, 2018/2019,Canada,12167\nTotal guilty cases - sentences,2019/202,Canada,10861\nTotal guilty cases - sentences,2020/2021,Canada,6594\nTotal guilty cases - sentences,2021/2022,Canada,4688\nIntensive rehabilitation custody and supervision,2017/2018,Canada,7\nIntensive rehabilitation custody and supervision,2018/2019,Canada,5\nIntensive rehabilitation custody and supervision,2019/2020,Canada,5\nIntensive rehabilitation custody and supervision,2020/2021,Canada,12\nIntensive rehabilitation custody and supervision,2021/2022,Canada,7\nCustody,2017/2018,Canada,1811\nCustody,2018/2019,Canada,1457\nCustody,2019/2020,Canada,1260\nCustody,2020/2021,Canada,653\nCustody,2021/2022,Canada,402\nConditional sentence,2017/12018,Canada,10\nConditional sentence,2018/12019,Canada,8\nConditional sentence,2019/12020,Canada,15\nConditional sentence,2020/12021,Canada,4\nConditional sentence,2021/12022,Canada,12\nDeferred custody and supervision,2017/2018,Canada,670\nDeferred custody and supervision,2018/2019,Canada,527\nDeferred custody and supervision,2019/2020,Canada,527\nDeferred custody and supervision,2020/2021,Canada,297\nDeferred custody and supervision,2021/2022,Canada,228\nIntensive support and supervision,2017/2018,Canada,117\nIntensive support and supervision,2018/2019,Canada,124\nIntensive support and supervision,2019/2020,Canada,99\nIntensive support and supervision,2020/2021,Canada,63\nIntensive support and supervision,2021/2022,Canada,66\nAttend a non-residential program,2017/2018,Canada,98\nAttend a non-residential program,2018/2019,Canada,63\nAttend a non-residential program,2019/2020,Canada,60\nAttend a non-residential program,2020/2021,Canada,28\nAttend a non-residential program,2021/2022,Canada,11\nProbation,2017/2018,Canada,7154\nProbation,2018/2019,Canada,6195\nProbation,2019/2020,Canada,5572\nProbation,2020/2021,Canada,3411\nProbation,2021/2022,Canada,2449\nFine,2017/2018,Canada,285\nFine,2018/2019,Canada,224\nFine,2019/2020,Canada,179\nFine,2020/2021,Canada,133\nFine,2021/2022,Canada,102"
        }
    ]
}

function getColTypes(){
    return [
        {label: "Text", id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#String"},
        {label: "Integer", id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#Integer"}, 
        {label: "Double", id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#Double"}, 
        {label: "Date", id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#Date"},
        {label: "DateTime", id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#DateTime"}
    ]
}

function guessType(values){
    const base = "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#";     
    
    var intReg = /^\d+$/;
    var doubleReg = /\d+\.\d*|\.?\d+/
    var dateReg = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/
    
    if(values.every(i => intReg.test(i))) return base + 'Integer';

    if(values.every(i => doubleReg.test(i))) return base + 'Double';

    // TODO: work out a better date test
    if(values.every(i => dateReg.test(i))) return base + 'Date';

    if(values.every(i => typeof i === "string")) return  base +'String';
    return null;
}

function guessDelimiter(csvContent){
    for(const delimiter of [',', ';', '|', '\t']){
        var csv = CSVToArray(csvContent, delimiter)
        // TODO: do a bit more intelligent check...
        if(csv[0].length > 1 && csv.length > 1) return delimiter;
    }

    return ','
}