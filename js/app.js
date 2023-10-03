const { createApp, ref, reactive, computed, Utils } = Vue

createApp({
    methods:{
        openCsv(){
            let inputElement = document.createElement('input')
            inputElement.type = 'file'
            inputElement.accept = '.csv,.tsv'
            inputElement.onchange = _ => {
                let file = Array.from(inputElement.files)[0];
                this.input.fileName = file.name
                this.input.type = file.type
                this.input.size = file.size
                var reader = new FileReader()
                reader.readAsText(file, 'UTF-8')

                reader.onload = readerEvent => {
                    var content = readerEvent.target.result
                    console.log('guessDelimiter',guessDelimiter(content))
                    this.input.delimiter = guessDelimiter(content)
                    this.input.raw = content
                    this.reloadCsv()
                }
            };
            inputElement.click();
        },
        saveCdi(){
            var textFileAsBlob = new Blob([ this.output.cdi ], { type: 'application/ld+json' })
            var fileNameToSaveAs = this.input.fileName.replace('.csv', '.jsonld')
            saveFile(fileNameToSaveAs, textFileAsBlob)
        },
        loadExample(example){
            this.input.raw = example.raw
            this.input.fileName = example.fileName
            this.input.size = example.raw.length
            this.reloadCsv()
        },
        copyToClipboard(text){
            navigator.clipboard.writeText(text).then(() => {
                console.log('Content copied to clipboard');
            },() => {
                console.error('Failed to copied to clipboard');
            });
        },
        reloadCsv(){
            if(this.input.fileName == null) return;
            
            var csv = CSVToArray(this.input.raw, this.input.delimiter)
            
            this.input.recordCount = csv.length
            if(this.input.firstRowIsHeader) this.input.recordCount--

            this.input.columns.splice(0)
            var pos = 0
            for(const id of csv[0]){
                var values = getColumnValues(csv, pos, this.input.firstRowIsHeader)
                this.input.columns.push(new Column(id, pos, values))
                pos++
            }
        }
    },
    mounted(){
        this.reloadCsv()
    },
    setup() {
        const lang = reactive({id:'en', label: 'English'})
        const codeListVariableIndex = ref(null);
        const examples = [
            {
                fileName: 'test.csv',
                raw:"Frequency,Year,Age Cohort,Sex,Status,Median Income (USD)\nA,2003,C,M,ACT,5500\nA,2003,G,F,ACT,7500\nA,2004,E,M,EST,10000\nA,2005,B,F,ACT,14000\nA,2004,B,M,EST,2000"
            },
            {
                fileName: 'tiny.csv',
                raw:"id,name,value,some date\n0,Pelle,13,2010-01-12\n1,Claus,15,2020-10-10"
            },
            {
                fileName: 'spss_example.csv',
                raw: "RID,MARST,PWT\n10000001,3,537\m10000002,1,231\n10000003,2,599\n10000004,1,4003\n10000005,2,598"
            },
            {
                fileName: 'canada_juvenile_crime.csv',
                raw: "Offense,Year,Geography,TotalNumber of Cases\nTotal guilty cases - sentences,2017/2018,Canada,14227\nTotal guilty cases - sentences, 2018/2019,Canada,12167\nTotal guilty cases - sentences,2019/202,Canada,10861\nTotal guilty cases - sentences,2020/2021,Canada,6594\nTotal guilty cases - sentences,2021/2022,Canada,4688\nIntensive rehabilitation custody and supervision,2017/2018,Canada,7\nIntensive rehabilitation custody and supervision,2018/2019,Canada,5\nIntensive rehabilitation custody and supervision,2019/2020,Canada,5\nIntensive rehabilitation custody and supervision,2020/2021,Canada,12\nIntensive rehabilitation custody and supervision,2021/2022,Canada,7\nCustody,2017/2018,Canada,1811\nCustody,2018/2019,Canada,1457\nCustody,2019/2020,Canada,1260\nCustody,2020/2021,Canada,653\nCustody,2021/2022,Canada,402\nConditional sentence,2017/12018,Canada,10\nConditional sentence,2018/12019,Canada,8\nConditional sentence,2019/12020,Canada,15\nConditional sentence,2020/12021,Canada,4\nConditional sentence,2021/12022,Canada,12\nDeferred custody and supervision,2017/2018,Canada,670\nDeferred custody and supervision,2018/2019,Canada,527\nDeferred custody and supervision,2019/2020,Canada,527\nDeferred custody and supervision,2020/2021,Canada,297\nDeferred custody and supervision,2021/2022,Canada,228\nIntensive support and supervision,2017/2018,Canada,117\nIntensive support and supervision,2018/2019,Canada,124\nIntensive support and supervision,2019/2020,Canada,99\nIntensive support and supervision,2020/2021,Canada,63\nIntensive support and supervision,2021/2022,Canada,66\nAttend a non-residential program,2017/2018,Canada,98\nAttend a non-residential program,2018/2019,Canada,63\nAttend a non-residential program,2019/2020,Canada,60\nAttend a non-residential program,2020/2021,Canada,28\nAttend a non-residential program,2021/2022,Canada,11\nProbation,2017/2018,Canada,7154\nProbation,2018/2019,Canada,6195\nProbation,2019/2020,Canada,5572\nProbation,2020/2021,Canada,3411\nProbation,2021/2022,Canada,2449\nFine,2017/2018,Canada,285\nFine,2018/2019,Canada,224\nFine,2019/2020,Canada,179\nFine,2020/2021,Canada,133\nFine,2021/2022,Canada,102"
            }
        ]
        const input = reactive({
            fileName: null,
            type: 'text/csv',
            delimiter: ',',
            firstRowIsHeader: true,
            columns: [],
            recordCount : 0,
            raw:""
        })
        const cv = {
            colRoles : [{id:'Dimension'}, {id:'Attribute'}, {id:'Measure'}],
            colTypes : [
                {label:'String', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#String"},
                {label:'Integer', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#Integer"}, 
                {label:'Date', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#Date"},
                {label:'DateTime', id: "http://rdf-vocabulary.ddialliance.org/cv/DataType/1.1.2/#DateTime"}
            ]
        }

        const haveCodeLists = computed(() =>{
            return input.columns.filter(c => c.coded).length > 0
        })

        const output = computed(() => {
            return {
                'cdi' : toDdiCdiJsonLd(input),
                'ddiC' : toDdiCXml(input),
                'ddiL' : toDdiLXml(input)
            }
        })

        const outputFormated = computed(() => {
            return {
                'cdi' : (hljs.highlight(toDdiCdiJsonLd(input), { language: 'json' }).value),
                'ddiC' : (hljs.highlight(toDdiCXml(input), { language: 'xml' }).value),
                'ddiL' : (hljs.highlight(toDdiLXml(input), { language: 'xml' }).value),
            }
        })

        return {
            input, output, outputFormated, codeListVariableIndex, haveCodeLists, cv, examples
        }
    }
}).mount('#app')