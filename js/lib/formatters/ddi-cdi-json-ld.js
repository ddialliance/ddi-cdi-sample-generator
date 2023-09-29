function toDdiCdiJsonLd(input){
    var cdi = {
        '@context': "http://ddialliance.org/Specification/DDI-CDI/1.0/RDF/",
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