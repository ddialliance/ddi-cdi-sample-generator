function toDdiCXml(input){
    var ns = "ddi:codebook:2_5"

    var xmlDoc = document.implementation.createDocument(ns, "codeBook", null);

    var codeBook = xmlDoc.getElementsByTagName("codeBook")[0]
    
    codeBook.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    codeBook.setAttribute("xmlns:xs", "http://www.w3.org/2001/XMLSchema")
    codeBook.setAttribute("xsi:schemaLocation", "ddi:codebook:2_5 http://www.ddialliance.org/Specification/DDI-Codebook/2.5/XMLSchema/codebook.xsd")
    
    var fileDscr = xmlDoc.createElementNS(ns, "fileDscr")
    fileDscr.setAttribute("ID", input.fileName)

    var fileTxt = xmlDoc.createElementNS(ns, "fileTxt")
    fileTxt.appendChild(createTextNode(xmlDoc, ns, "fileName", input.fileName))
    fileTxt.appendChild(createTextNode(xmlDoc, ns, "fileType", input.type))

    var dimensns = xmlDoc.createElementNS(ns,"dimensns")
    dimensns.appendChild(createTextNode(xmlDoc, ns, "caseQnty", input.recordCount))
    dimensns.appendChild(createTextNode(xmlDoc, ns, "varQnty", input.columns.length))

    fileDscr.appendChild(dimensns)

    fileDscr.appendChild(fileTxt)
    codeBook.appendChild(fileDscr)

    var dataDscr = xmlDoc.createElementNS(ns, "dataDscr")
    dataDscr.setAttribute("source", "producer")

    for(const c of input.columns){
        var v = xmlDoc.createElementNS(ns, "var")
        v.setAttribute("ID", c.id)
        v.setAttribute("name", c.name)
        v.setAttribute("files", input.fileName)
        v.setAttribute("representationType", getVarRepresentationType(c))

        if(c.displayLabel){
            v.appendChild(createTextNode(xmlDoc, ns, "labl", c.displayLabel))
        }

        if(c.coded){
            for(const code of c.codeList){
                var catgry = xmlDoc.createElementNS(ns, "catgry")

                catgry.appendChild(createTextNode(xmlDoc, ns, "catValu", code.notation))

                if(code.prefLabel){
                    catgry.appendChild(createTextNode(xmlDoc, ns, "labl", code.prefLabel))
                }

                var catStat = createTextNode(xmlDoc, ns, "catStat", c.catStat[code.notation])
                catStat.setAttribute("type", "freq")
                catgry.appendChild(catStat)
                
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
    }else if(column.hasIntendedDataType.endsWith("Double")){
        return "numeric"
    }else if(column.hasIntendedDataType.endsWith("DateTime")){
        return "datetime"
    }

    return "other"
}