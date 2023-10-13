function toDdiLXml(input){
    var nsddi = "ddi:instance:3_3"
    var nsr = "ddi:reusable:3_3"
    var nspi = "ddi:physicalinstance:3_3"

    var xmlDoc = document.implementation.createDocument(nsddi, "ddi:FragmentInstance", null);

    var fragmentInstance = xmlDoc.getElementsByTagName("ddi:FragmentInstance")[0]
    
    fragmentInstance.setAttribute("xmlns:r", "ddi:reusable:3_3")
    fragmentInstance.setAttribute("xmlns:pi", "ddi:physicalinstance:3_3")
	
	var topLevelReference = xmlDoc.createElementNS(nsddi, "ddi:TopLevelReference")
	topLevelReference.appendChild(createTextNode(xmlDoc, nsr, "r:Agency", "int.example"))
	topLevelReference.appendChild(createTextNode(xmlDoc, nsr, "r:ID", input.fileName))
	topLevelReference.appendChild(createTextNode(xmlDoc, nsr, "r:Version", "1.0.0"))
	topLevelReference.appendChild(createTextNode(xmlDoc, nsr, "r:TypeOfObject", "PhysicalInstance"))
	fragmentInstance.appendChild(topLevelReference)
			
	var physicalInstanceFragment = xmlDoc.createElementNS(nsddi, "ddi:Fragment")
	var physicalInstance = xmlDoc.createElementNS(nsddi, "pi:PhysicalInstance")
	physicalInstance.appendChild(createTextNode(xmlDoc, nsr, "r:URN", "urn:ddi:int.example:" + input.fileName + ":1.0.0"))
	physicalInstance.appendChild(createTextNode(xmlDoc, nsr, "r:Agency", "int.example"))
	physicalInstance.appendChild(createTextNode(xmlDoc, nsr, "r:ID", input.fileName))
	physicalInstance.appendChild(createTextNode(xmlDoc, nsr, "r:Version", "1.0.0"))
	physicalInstanceFragment.appendChild(physicalInstance)
	fragmentInstance.appendChild(physicalInstanceFragment)
			
    var prolog = '<?xml version="1.0" encoding="UTF-8"?>'
    var xmlString = new XMLSerializer().serializeToString(xmlDoc)
    return prolog + "\n" + formatXml(xmlString)
}