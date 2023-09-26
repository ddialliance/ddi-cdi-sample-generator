const { createApp, ref, reactive, computed, Utils } = Vue

class Col{
    id
    displayLabel
    descriptiveText
    hasIndendedDataType
    role
    constructor(id){
        this.id = id
        if(isNaN(id)){
            this.displayLabel = id
        }
        
    }
    toJSON(){
        return {
            '@id': '#'+this.id,
            '@type': 'InstanceVariable',
            displayLabel: this.displayLabel,
            descriptiveText: this.descriptiveText,
            hasIndendedDataType: this.hasIndendedDataType
        }
    }
}

createApp({
    mounted(){
        var csv = CSVToArray(this.rawData, this.delimiter)
        csv[0].forEach((id) =>{this.columns.push(new Col(id))});
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
            colTypes : [{id:'Coded', uri:"https://www.w3.org/2009/08/skos-reference/skos.html#ConceptScheme"}, {id:'Numeric'}, {id:'Time'}, {id:'Text'}]
        }
        const columns = reactive([])

        const jsonDebug = computed(() => {
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

            cdi['@graph'].push(columns)
            cdi['@graph'].push(logicalRecord)
        
            return JSON.stringify(cdi, null, 2)
        })

        return {
            rawData, cv, columns, jsonDebug, parsedData
        }
    }
}).mount('#app')