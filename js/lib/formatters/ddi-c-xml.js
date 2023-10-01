function toDdiCXml(input){
    var xmlDoc = document.implementation.createDocument("ddi:codebook:2_5", "codeBook", null);
    var codeBook = xmlDoc.getElementsByTagName("codeBook")[0]
    
    codeBook.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    codeBook.setAttribute("xmlns:xs", "http://www.w3.org/2001/XMLSchema")
    codeBook.setAttribute("xsi:schemaLocation", "ddi:codebook:2_5 http://www.ddialliance.org/Specification/DDI-Codebook/2.5/XMLSchema/codebook.xsd")
    
    var dataDscr = xmlDoc.createElement("dataDscr")
    dataDscr.setAttribute("source", "producer")

    for(const c of input.columns){
        var v = xmlDoc.createElement("var")
        v.setAttribute("ID", c.id)
        v.setAttribute("name", c.name)
        v.setAttribute("representationType", getVarRepresentationType(c))

        if(c.displayLabel){
            var labl = xmlDoc.createElement("labl")
            var lablText = xmlDoc.createTextNode(c.displayLabel)
            labl.appendChild(lablText)
            v.appendChild(labl)
        }

        if(c.coded){
            for(const code of c.codeList){
                var catgry = xmlDoc.createElement("catgry")

                var catValu = xmlDoc.createElement("catValu")
                var catValuText = xmlDoc.createTextNode(code.notation)
                catValu.appendChild(catValuText)
                catgry.appendChild(catValu)

                if(code.prefLabel){
                    var labl = xmlDoc.createElement("labl")
                    var lablText = xmlDoc.createTextNode(code.prefLabel)
                    labl.appendChild(lablText)
                    catgry.appendChild(labl)
                }

                v.appendChild(catgry)
            }

        }

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