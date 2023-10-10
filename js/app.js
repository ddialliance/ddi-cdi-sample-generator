const { createApp, ref, reactive, computed, Utils } = Vue

createApp({
    methods:{
        openCsv(){
            let inputElement = document.createElement("input")
            inputElement.type = "file"
            inputElement.accept = ".csv,.tsv"
            inputElement.onchange = _ => {
                let file = Array.from(inputElement.files)[0];
                this.input.fileName = file.name
                
                this.input.type = file.type
                this.input.size = file.size
                var reader = new FileReader()
                reader.readAsText(file, "UTF-8")

                reader.onload = readerEvent => {
                    var content = readerEvent.target.result
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
        saveFile(content, type, fileName){
            var fileAsBlob = new Blob([ content ], { type: type })
            saveFileBrowser(fileName, fileAsBlob)
        },
        loadExample(example){
            this.input.raw = example.raw
            this.input.fileName = example.fileName
            this.input.size = example.raw.length
            this.reloadCsv()
        },
        copyToClipboard(text){
            navigator.clipboard.writeText(text).then(() => {
                console.log("Content copied to clipboard");
            },() => {
                console.error("Failed to cpy to clipboard");
            });
        },
        reloadCsv(){
            if(this.input.fileName == null) return;
            this.input.fileNameWithoutExtension = this.input.fileName.split(".").slice(0, -1).join(".");
            console.log(this.input.fileNameWithoutExtension)
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
        const codeListVariableIndex = ref(null)
        const examples = getCsvExamples()
        const input = reactive({
            fileName: null,
            raw: "",
            fileNameWithoutExtension: "",
            type: "text/csv",
            delimiter: ",",
            firstRowIsHeader: true,
            columns: [],
            recordCount : 0
        })
        const cv = {
            colRoles : [{id: "Dimension"}, {id: "Attribute"}, {id: "Measure"}],
            colTypes : getColTypes()
        }

        const haveCodeLists = computed(() =>{
            return input.columns.filter(c => c.coded).length > 0
        })

        const output = computed(() => {
            return {
                cdi : toDdiCdiJsonLd(input),
                ddiC : toDdiCXml(input),
                ddiL : toDdiLXml(input)
            }
        })

        const outputFormated = computed(() => {
            return {
                cdi : (hljs.highlight(toDdiCdiJsonLd(input), { language: "json" }).value),
                ddiC : (hljs.highlight(toDdiCXml(input), { language: "xml" }).value),
                ddiL : (hljs.highlight(toDdiLXml(input), { language: "xml" }).value),
            }
        })

        return {
            input, output, outputFormated, codeListVariableIndex, haveCodeLists, cv, examples
        }
    }
}).mount("#app")