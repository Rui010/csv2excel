const ErrorCheck = {
    "size": 10 * 1024 * 1024, // 10MB 以下
    "type": ["csv"]
}
const app = new Vue({
    el: "#app",
    data: {
        csv_arr: [],
        file_name: "",
        error_msg: "",
        dad_flag: false,
        char_code_flag: "auto",
    },
    computed: {},
    methods: {
        change_class: function(bool) {
            this.dad_flag = bool;
        },
        upload_func: function(e) {
            this.error_msg = "";
            this.showSpinner();
            this.readcsv(e, this.makeArray2ExcelFile);
        },
        readcsv: function(e, callback) {
            let now = new Date();
            let file = e.target.files ? e.target.files[0] : event.dataTransfer.files[0];
            let _f = file.name.split(".");
            let extension = _f.pop().toLowerCase();
            this.file_name = this.getFullDate(now) + "_" + this.sanitize_name(_f.join("."));
            this.file_size = file.size;
            if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                this.error_msg = "Error：対応ブラウザではありません！";
                this.dad_flag = false;
                this.hideSpinner();
                return;
            }
            if (this.file_size > ErrorCheck.size) {
                this.error_msg = "Error：ファイルのサイズは10MB以下にしてください！";
                this.dad_flag = false;
                this.hideSpinner();
                return;
            }
            if (ErrorCheck.type.indexOf(extension) === -1) {
                this.error_msg = "Error：CSVファイル以外は変換できません！";
                this.dad_flag = false;
                this.hideSpinner();
                return;
            }
            let reader = new FileReader();
            let vm = this;
            reader.onload = function(event) {
                let array = new Uint8Array(event.target.result);
                let char_code = Encoding.detect(array);
                switch (char_code) {
                    case "UTF16":
                        array = new Uint16Array(e.target.result);
                        break;
                    case "UTF32":
                        array = new Uint32Array(e.target.result);
                        break;
                }
                if (vm.char_code_flag === "SJIS") {
                    char_code = "SJIS";
                } else if (vm.char_code_flag === "UTF8") {
                    char_code = "UTF8";
                }
                let unicodeArray = Encoding.convert(array, {
                    to: "UNICODE",
                    from: char_code,
                });
                let text = Encoding.codeToString(unicodeArray);
                vm.csv_arr = TinyCSV.parse(text);
                callback();
            }
            reader.onabort = function(event) {
                vm.error_msg = "Error：読み込みが中断されました！";
                return;
            }
            reader.onerror = function(event) {
                vm.error_msg = "Error：予期せぬエラーが発生しました！";
                return;
            }
            reader.onloadend = function(event) {
                vm.dad_flag = false;
                vm.hideSpinner();
                return;
            }
            reader.readAsArrayBuffer(file);
        },
        sanitize_name: function(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        },
        getFullDate: function(dt) {
            return dt.getFullYear().toFixed() + (dt.getMonth() + 1).toFixed() + dt.getDate().toFixed()
                + dt.getHours().toFixed() + dt.getMinutes().toFixed() + dt.getSeconds().toFixed();
        },
        makeArray2ExcelFile: function() {
            const wopts = {
                bookType: "xlsx",
                bookSST: false,
                type: "binary",
            };
            let csv_arr = this.csv_arr;
            let file_name = this.file_name;
            let workbook = {SheetNames: [], Sheets: {}};
            workbook.SheetNames.push("Sheet1")
            workbook.Sheets["Sheet1"] = XLSX.utils.aoa_to_sheet(csv_arr, wopts);
            let wbout = XLSX.write(workbook, wopts);
            saveAs(new Blob([this.s2ab(wbout)], {type: "application/octet-stream"}), this.file_name + ".xlsx");
        },
        s2ab: function(s) {
            let buf = new ArrayBuffer(s.length);
            let view = new Uint8Array(buf);

            for (let i = 0; i !== s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        },
        showSpinner: function() {
            if (document.querySelectorAll(".spinner").length === 0) {
                let $spin_div = document.createElement("div");
                $spin_div.id = "spin";
                $spin_div.classList.add("spinner");
                let $spin_bg_div = document.createElement("div");
                $spin_bg_div.id = "spin-bg";
                $spin_bg_div.classList.add("spinner");
          
                let spin_div_css = {
                    "position": "fixed",
                    "top": "50%",
                    "left": "50%",
                    "zIndex": "510",
                    "backgroundColor": "#fff",
                    "padding": "26px",
                    "borderRadius": "4px"
                };
                for (let prop in spin_div_css) {
                    $spin_div.style[prop] = spin_div_css[prop];
                }
          
                let spin_bg_div_css = {
                    "position": "fixed",
                    "top": "0px",
                    "left": "0px",
                    "zIndex": "500",
                    "width": "100%",
                    "height": "200%",
                    "backgroundColor": "#000",
                    "opacity": "0.5",
                    "filter": "alpha(opacity=50)"
                };
                for (let prop in spin_bg_div_css) {
                    $spin_bg_div.style[prop] = spin_bg_div_css[prop]
                }
            
                document.body.appendChild($spin_bg_div);
                document.body.appendChild($spin_div);
                let opts = {"color": "#000"};
                new Spinner(opts).spin(document.getElementById("spin"));
            }
            document.getElementById("spin-bg").style.display = 'block';
            document.getElementById("spin").style.display = 'block';
        },
        hideSpinner: function() {
            document.getElementById("spin-bg").style.display = 'none';
            document.getElementById("spin").style.display = 'none';
        },
    },
});
