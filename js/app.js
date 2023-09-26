const { createApp, ref, reactive, computed, Utils } = Vue

class Col{
    id
    displayLabel
    descriptiveText
    hasIndendedDataType
    role
    constructor(id){
        if(isNaN(id)){
            this.displayLabel = id
        }
        this.id = '#' + id.replace(/\W/g,'_')
    }
    toJSON(){
        var variable = {
            '@id': this.id,
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

createApp({
    mounted(){
        var csv = CSVToArray(this.rawData, this.delimiter)
        csv[0].forEach((id) =>{this.columns.push(new Col(id))})
    },
    setup() {
        const delimiter = ','
        const lang = reactive({id:'en', label: 'English'})
        const rawData = reactive("Frequency,Year,Age Cohort,Sex,Status,Median Income (USD)\nA,2003,C,M,ACT,5500\nA,2003,G,F,ACT,7500\nA,2004,E,M,EST,10000\nA,2005,B,F,ACT,14000\nA,2004,B,M,EST,2000")
        const parsedData = computed(() => {
            return CSVToArray(rawData, delimiter)
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

            return JSON.stringify(cdi, null, 2)
        })

        return {
            rawData, cv, columns, cdiOutput, parsedData
        }
    }
}).mount('#app')