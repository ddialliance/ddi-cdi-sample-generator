const { createApp, ref, reactive, computed } = Vue

createApp({
    setup() {
        const rawData = reactive("Frequency,Year,Age Cohort,Sex,Status,Median Income (USD)\nA,2003,C,M,ACT,5500\nA,2003,G,F,ACT,7500\nA,2004,E,M,EST,10000\nA,2005,B,F,ACT,14000\nA,2004,B,M,EST,2000")
        const parsedData = computed(() => {
            return CSVToArray(rawData, ',')
        })
        const cv = {
            colRoles : [{id:'Dimension'}, {id:'Attribute'}, {id:'Measure'}],
            colTypes : [{id:'Coded'}, {id:'Numeric'}, {id:'Time'}, {id:'Text'}]
        }
        const columns = reactive([
            {label:'Frequency', description:null, role:null, type:null},
            {label:'Year', description:null, role:null, type:null},
            {label:'Age Cohort', description:null, role:null, type:null},
            {label:'Sex', description:null, role:null, type:null},
            {label:'Status', description:null, role:null, type:null},
            {label:'Median Income (USD)', description:null, role:null, type:null}
        ])

        const jsonDebug = computed(() => {
            return JSON.stringify(columns, null, 2)
        })

        return {
            rawData, cv, columns, jsonDebug, parsedData
        }
    }
}).mount('#app')