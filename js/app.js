const { createApp, ref, reactive, computed, Utils } = Vue

class Col{
    id
    displayLabel
    descriptiveText
    hasIndendedDataType
    role
	position
    values = []
    constructor(id, position){
		this.position = position
        if(isNaN(id)){
            this.displayLabel = id
        }
        this.id = id.replace(/\W/g,'_')
    }
    toJSON(){
        var variable = {
            '@id': '#' + this.id,
            '@type': 'InstanceVariable',
            displayLabel: this.displayLabel,
            descriptiveText: this.descriptiveText
        }
        if(this.hasIndendedDataType){
            variable.hasIndendedDataType = {'@id': this.hasIndendedDataType}
        }
        return variable
    }
}
/* TODO: add dimensional stuff 
DimensionalDataStructure [has] DataStructureComponent (DimensionComponent, AttributeComponet, MeasureComponent)
DimensionComponent
AttributeComponent
MeasureComponent
ComponentPosition
RepresentedVariable (or use InstanceVariable to represent this)
Representations (SKOS:ConceptScheme for enumerated variables)
*/

createApp({
    mounted(){
        var csv = CSVToArray(this.input.raw, this.delimiter)
		var pos = 0
        csv[0].forEach((id) =>{
			this.columns.push(new Col(id, pos))
			pos++
		})
    },
    setup() {
        const delimiter = ','
        const lang = reactive({id:'en', label: 'English'})
        const input = reactive({
            id: "test.csv",
            raw:"Frequency,Year,Age Cohort,Sex,Status,Median Income (USD)\nA,2003,C,M,ACT,5500\nA,2003,G,F,ACT,7500\nA,2004,E,M,EST,10000\nA,2005,B,F,ACT,14000\nA,2004,B,M,EST,2000"
        })
        const cv = {
            colRoles : [{id:'Dimension'}, {id:'Attribute'}, {id:'Measure'}],
            colTypes : [
                {label:'Coded', id: "https://www.w3.org/2009/08/skos-reference/skos.html#ConceptScheme"}, 
                {label:'Integer', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#Integer"}, 
                {label:'DateTime', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#DateTime"}, 
                {label:'String', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#String"}
            ]
        }
        const columns = reactive([])

        const cdiOutput = computed(() => {
            var cdi = {
                '@context': "http://ddialliance.org/Specification/DDI-CDI/1.0/RDF/",
                '@graph':[]
            }
            var logicalRecord = {
                '@id' : "#logicalRecord",
                "@type": "LogicalRecord",
                'has' : []
            }

            for(const c of columns){
                logicalRecord['has'].push({'@id': c.id})
            }

            cdi['@graph'] = cdi['@graph'].concat(columns)
            cdi['@graph'] = cdi['@graph'].concat(logicalRecord)
        

            var dataset = {
                '@id' : "#dataset",
                "@type": "DimensionalDataSet",
                'has' : []
            }

            var dimensionalKeys = []

            for(const c of columns){
                if(c.role == 'Dimension'){
                    var id = "#dimensionalKey-"+c.id
                    dimensionalKeys.push({
                        '@id' : id,
                        '@type' : 'DimensionalKey'
                    })
                    dataset['has'].push({'@id' : id})
                }
            }

            cdi['@graph'] = cdi['@graph'].concat(dataset)
            cdi['@graph'] = cdi['@graph'].concat(dimensionalKeys)

            var datastructure = {
                '@id' : "#datastructure",
                "@type": "DimensionalDataStructure",
                'has' : []
            }

            var components = []
            var componentPositions = []

            for(const c of columns){
                if(c.role == 'Dimension'){
                    var id = "#dimensionComponent-"+c.id
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
            }

            cdi['@graph'] = cdi['@graph'].concat(datastructure)
            cdi['@graph'] = cdi['@graph'].concat(components)
            cdi['@graph'] = cdi['@graph'].concat(componentPositions)

            return JSON.stringify(cdi, null, 2)
        })

        return {
            input, cv, columns, cdiOutput
        }
    }
}).mount('#app')