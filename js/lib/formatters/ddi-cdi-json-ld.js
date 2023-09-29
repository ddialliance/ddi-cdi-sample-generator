/*
TODOS:
    FROM: pierre-antoine@w3.org

    * all CDI properties that expect an object (as opposed to a simple
    string) will recognize strings as being IRIs, so no need to wrap them in
    { "@id": ... }, including in lists

    * typos:

    -  "hasIndededDataType" → "hasIndededDataType"
    - "PhysycalDataset" → "PhyisicalDataSet"



    A few more comments on your file :

    * in the 'LogicalRecor - has' property, you forgot the hash (#) in front of the local names, so instead of
        "has": [ "Offense", "Year", ... ]
    this should be
        "has": ["#Offense", "#Year", ...]

    * the resulting graph is not connex, which I believe is an oversight... Don't you miss the following in the definition of "#dataset":
        "isStructuredBy": "#datastructure",
    ?

    * your data does not pass the SHACL validator -- some errors are glitches which should be fixed in the model / shape / json-ld context soon,
    but the following seem to be relevant

        Violation 1 "Property may only have 1 value, but found 7" (cdi:DataStructure_has_PrimaryKey  of #datastructure) 
        Violation 1 "Property needs to have at least 1 values, but found 0" (cdi:DataSet_has_DataPoint of #dataset)
        Violation 1 "Property needs to have at least 1 values, but found 0" (cdi:DataStore-allowsDuplicates of #dataStore)
        Violation 1 "Property needs to have at least 1 values, but found 0" (cdi:PhysicalDataSet-allowsDuplicates of #physicalDataset)

    * regaring the 2nd violation above, I believe that Flavio told me today that he was considering relaxing this constraint, so it is probably moot (but you should check with him)

    * regarding the 1st violation above, I'm assuming that maybe you consider the list of 7 element to be one primary key, but that's not how it should be modelled (as such, it says that each of the 7 component is a key on its owb).

        should probably be
        "@id": "#datastructure",
        "@type": "DimensionalDataStructure",
        "has": {
            "@type": "PrimaryKey",
            "isComposedOf": [
            {"correspondsTo": "#dimensionComponent-Offense", "@type": "PrimaryKeyComponent" },
            { "correspondsTo": "#dimensionComponent-Year", "@type": "PrimaryKeyComponent"  },
            { "correspondsTo": "#dimensionComponent-Geography", "@type": "PrimaryKeyComponent"  },
            { "correspondsTo": "#measureComponent-TotalNumber_of_Cases", "@type": "PrimaryKeyComponent"  }
            ]
        }
        

    Note that I also removed the ComponentPosition's from the description of the primary key, because this does not seem to fit in the model, and seemed redundant with the DimensionComponent's that are already there. You may want to adapt it if I am wrong.

    best

*/

function toDdiCdiJsonLd(input){
    var cdi = {
        '@context': "https://ddi-alliance.bitbucket.io/DDI-CDI/DDI-CDI_v1.0-rc1/encoding/json-ld/ddi-cdi.jsonld",
        '@graph':[]
    }

    if(input.columns.filter(c => c.coded).length > 0){
        cdi['@context'] = [cdi['@context'], {"skos": "http://www.w3.org/2004/02/skos/core#"}]
    }
    var dataStore= {
        '@id' : '#dataStore',
        '@type' : 'DataStore',
        'recordCount' : input.recordCount,
        'has' : []
    }
    dataStore['has'].push({'@id' : '#logicalRecord'})
    
    var physicalDataset = {
        '@id' : "#physicalDataset",
        '@type': "PhysicalDataset",
        'formats' : '#dataStore',
        'physicalFileName' : input.fileName,
        'has' : []
    }
    
    var physicalSegmentLayout = {
        '@id' : "#physicalSegmentLayout",
        '@type': "PhysicalSegmentLayout",
        'formats' : '#logicalRecord',
        'isDelimited' : 'true',
        'delimiter' : input.delimiter,
        'has' : []
    }

    var physicalRecordSegment = {
        '@id' : "#physicalRecordSegment",
        '@type': "PhysicalRecordSegment",
        'mapsTo' : '#logicalRecord',
        'has' : []
    }
    physicalRecordSegment['has'].push({'@id' : '#physicalSegmentLayout'})
    physicalRecordSegment['has'].push({'@id' : '#physicalDataset'})

    var logicalRecord = {
        '@id' : "#logicalRecord",
        '@type': "LogicalRecord",
        'has' : []
    }

    var dataset = {
        '@id' : "#dataset",
        '@type': "DimensionalDataSet",
        'has' : []
    }

    var dimensionalKeys = []

    var datastructure = {
        '@id' : "#datastructure",
        '@type': "DimensionalDataStructure",
        'has' : []
    }

    var components = []
    var valueMappings = []
    var componentPositions = []

    for(const c of input.columns){
        logicalRecord['has'].push({'@id': c.id})
        valueMappings.push({
            '@id' : '#valueMapping' + c.id,
            '@type' : 'ValueMapping',
            'has' : [{'@id' : '#' + c.id}]
        })
        physicalSegmentLayout['has'].push({'@id' : '#valueMapping' + c.id})
        if(c.role == 'Dimension'){
            var id = "#dimensionalKey-"+c.id
            dimensionalKeys.push({
                '@id' : id,
                '@type' : 'DimensionalKey'
            })
            dataset['has'].push({'@id' : id})
            id = "#dimensionComponent-"+c.id
            components.push({
                '@id' : id,
                '@type' : 'DimensionComponent',
                'isDefinedBy' : '#' + c.id
            })
            componentPositions.push({
                '@id' : '#componentPosition-' + c.id,
                '@type' : 'ComponentPosition',
                'value' : c.position
            })
            datastructure['has'].push({'@id' : id})
            datastructure['has'].push({'@id' : '#componentPosition-' + c.id})
        }
        if(c.role == 'Attribute'){
            var id = "#attributeComponent-"+c.id
            components.push({
                '@id' : id,
                '@type' : 'AttributeComponent',
                'isDefinedBy' : '#' + c.id
            })
            datastructure['has'].push({'@id' : id})
        }
        if(c.role == 'Measure'){
            var id = "#measureComponent-"+c.id
            components.push({
                '@id' : id,
                '@type' : 'MeasureComponent',
                'isDefinedBy' : '#' + c.id
            })
            datastructure['has'].push({'@id' : id})
        }
        //TODO: create concept scheme, connect it to the variable
        if(c.coded){
            cdi['@graph'] = cdi['@graph'].concat(c.getConceptScheme())
            cdi['@graph'] = cdi['@graph'].concat(c.codeList)
        }
    }

    cdi['@graph'] = cdi['@graph'].concat(input.columns)
    cdi['@graph'] = cdi['@graph'].concat(logicalRecord)

    cdi['@graph'] = cdi['@graph'].concat(physicalSegmentLayout)
    cdi['@graph'] = cdi['@graph'].concat(physicalRecordSegment)
    cdi['@graph'] = cdi['@graph'].concat(valueMappings)
    cdi['@graph'] = cdi['@graph'].concat(physicalDataset)
    cdi['@graph'] = cdi['@graph'].concat(dataStore)

    cdi['@graph'] = cdi['@graph'].concat(dataset)
    cdi['@graph'] = cdi['@graph'].concat(dimensionalKeys)

    cdi['@graph'] = cdi['@graph'].concat(datastructure)
    cdi['@graph'] = cdi['@graph'].concat(components)
    cdi['@graph'] = cdi['@graph'].concat(componentPositions)

    return JSON.stringify(cdi, null, 2)
}