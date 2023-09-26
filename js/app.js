const { createApp, ref, reactive, computed, Utils } = Vue

class Col{
    id
    displayLabel
    descriptiveText
    hasIndendedDataType
    role
    constructor(id){
        this.id = '#'+id
        this.displayLabel = id
    }
}

createApp({
    mounted(){
        var head = CSVToArray(this.rawData, ',')[0]
        head.forEach((id) =>{ console.log(id); this.columns.push(new Col(id))});
    },
    setup() {
        const lang = reactive({id:'en', label: 'English'})
        const rawData = reactive("Frequency,Year,Age Cohort,Sex,Status,Median Income (USD)\nA,2003,C,M,ACT,5500\nA,2003,G,F,ACT,7500\nA,2004,E,M,EST,10000\nA,2005,B,F,ACT,14000\nA,2004,B,M,EST,2000")
        const parsedData = computed(() => {
            return CSVToArray(rawData, ',')
        })
        const cv = {
            colRoles : [{id:'Dimension'}, {id:'Attribute'}, {id:'Measure'}],
            colTypes : [{id:'Coded'}, {id:'Numeric'}, {id:'Time'}, {id:'Text'}]
        }
        const columns = reactive([])

        const jsonDebug = computed(() => {
            var cdi = {
                '@context': "http://ddialliance.org/Specification/DDI-CDI/1.0/RDF/",
                '@graph':[]
            }
            cdi['@graph'] = columns

            return JSON.stringify(cdi, null, 2)
        })

        return {
            rawData, cv, columns, jsonDebug, parsedData
        }
    }
}).mount('#app')