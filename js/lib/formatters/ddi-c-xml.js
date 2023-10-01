function toDdiCXml(input){
    var xmlDoc = document.implementation.createDocument(null, "codeBook", null);
    var codeBook = xmlDoc.getElementsByTagName("codeBook")[0]
    
    codeBook.setAttribute("xmlns", "ddi:codebook:2_5")
    codeBook.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    codeBook.setAttribute("xmlns:xs", "http://www.w3.org/2001/XMLSchema")
    codeBook.setAttribute("xsi:schemaLocation", "ddi:codebook:2_5 http://www.ddialliance.org/Specification/DDI-Codebook/2.5/XMLSchema/codebook.xsd")
    
    var dataDscr = xmlDoc.createElement("dataDscr")
    dataDscr.setAttribute("source", "producer")

    for(const c of input.columns){
        var v = xmlDoc.createElement("var")
        v.setAttribute("ID", c.id)
        v.setAttribute("name", c.name)

        if(c.displayLabel){
            var labl = xmlDoc.createElement("labl")
            var lablText = xmlDoc.createTextNode(c.displayLabel)
            labl.appendChild(lablText)
            v.appendChild(labl)
        }

        v.setAttribute("representationType", getVarRepresentationType(c))

        dataDscr.appendChild(v)
    }

    codeBook.appendChild(dataDscr)

    var xmlString = new XMLSerializer().serializeToString(xmlDoc)
    return formatXml(xmlString)
}

function getVarRepresentationType(column){
    if(column.coded){
        return "coded"
    }else if(column.hasIntendedDataType.endsWith("String")){
        return "text"
    }else if(column.hasIntendedDataType.endsWith("Integer")){
        return "numeric"
    }else if(column.hasIntendedDataType.endsWith("DateTime")){
        return "datetime"
    }

    return "other"
}