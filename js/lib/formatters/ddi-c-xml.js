function toDdiCXml(input){
    var ddic = '<codeBook xmlns="ddi:codebook:2_5" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="ddi:codebook:2_5 http://www.ddialliance.org/Specification/DDI-Codebook/2.5/XMLSchema/codebook.xsd">'
    ddic = ddic + '  <dataDscr source="producer">'
    
    for(const c of input.columns){
        ddic = ddic + '    <var ID="' + c.id + '" name="' + c.name + '" source="producer">'
        
        ddic = ddic + '    </var>'
    }
    
    ddic = ddic + '  </dataDscr>'
    ddic = ddic + '</codeBook>'
    return ddic
}