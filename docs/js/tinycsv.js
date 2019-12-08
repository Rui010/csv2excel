// https://qiita.com/weal/items/5aa94235c40d60ef2f0c
(function(g) {
'use strict';
var C = {};

/**
 * CSVをparseする
 * 入力文字列を1文字ずつ調べている
 * @param {String} str CSV形式の文字列
 * @return {Array} 2重配列
 */
C.charParse = function(str) {
    var rows = [], row = [], i, len, v, s = "", q, c;
    for(i=0,len=str.length; i<len; i++) {
        s = (v=str.charAt(i),q) ? v === '"' ? (q = str.charAt(i+1) === '"') ? (i++,s+v) : s : s+v :
                (q = v === '"' && !s) ? s : v === ',' ? (row.push(s),'') : 
                v === '\r' || v === '\n' ? (row.push(s),rows.push(row),row=[],v==='\r'&&str.charAt(i+1)==='\n'&&i++,'') : s+v
    }
    if (s || v === ',' || !s && v === '"') {row.push(s);}
    if (row.length) {rows.push(row);}
    if (!s && (v === '\r' || v === '\n')) {rows.push([]);}
    return rows;
};

/**
 * カンマ、改行記号、ダブルクォートの位置から配列を作る
 */
C.idxParse = function(str) {
    var i, c, r, q, l, m, v, j, len=str.length, rows = [], row = [];
    m = (l = str.indexOf('\r\n')<0 ? str.indexOf('\r')<0 ? '\n' : '\r' : '\r\n').length;
    for(i=0,c=r=-1; i<len; i++) {
        if (str.charAt(i) === '"') { //quoted
            for(j=0,q=i+1; (q=(q=str.indexOf('"',q))<0?len+1:q)<len&&str.charAt(++q)==='"'; j++,q++) {}
            row.push((v=str.substring(i+1,(i=q)-1),j) ? C.deq(v) : v);
        } else { //not quoted
            if (c<i) {c=str.indexOf(',',i);c=c<0?len:c;}
            if (r<i) {r=str.indexOf(l,i);r=r<0?len:r;}
            row.push(str.substring(i,(i=c<r?c:r)));
        }
        if (i === r || l === (m>1?str.substr(i,m):str.charAt(i))) {rows.push(row);row=[];i+=m-1;}
    }
    str.charAt(i-1) === ',' && row.push('');
    row.length && rows.push(row);
    str.substr(i-1,m) === l && rows.push([]);
    return rows;
};
/**
 * 正規表現によるparse
 */
C.regexParse = (function(re) {
    if (!re) {re = new RegExp('"(?:[^"]|"")*"|"(?:[^"]|"")*$|[^,\r\n]+|,+|\r?\n|\r', 'gm');}
    return function(l) {
        var c, m, n, r = [['']];
        if (!l) {return [];}
        while(m = re.exec(l)) {
            if ((c = m[0].charAt(0)) === ',') {for(c=m[0].length; c>0; c--) {r[r.length-1].push('');}continue;}
            if (c === '\n' || c === '\r\n' || c === '\r') {r.push(['']);continue;}
            (n=r[r.length-1])[n.length-1] = c === '"' ? C.deq(m[0], true) : m[0];
        }
        return r;
    };
}());

/**
 * ダブルクォート2つを1つに置換する関数
 * str.replace(/""/g, '"')の代わりに使うと多少早いかもしれない
 * @param {String}       s  入力文字列
 * @param {Boolean|null} p  先頭と末尾のダブルクォートを削除する場合はtrue。defaultは削除しない
 * @return {String} ダブルクォートを置換した文字列
 */
C.deq = function(s, p, o, i, l) {
    if (p) {s=s.charAt(0)==='"'?s.slice(1,s.charAt(l=s.length-1)==='"'?l:l+1):s;}
    for(i=0,o='',l=s.length; o+=(p=s.indexOf('""',i))<0?s.slice(l=i):s.substring(i,i=p+1),i<l; i++) {}
    return o;
};

C.escape = function(val) {
    if (val===null||val===undefined) {return "";}
    if (/[",\r\n]/.test(val)) {val = '"' + val.replace(/"/g, '""') + '"';}
    return val;
};

C.unescape = function(val) {return !val ? '' : C.deq(val, true);};

C.stringify = function(rows) {
    var str = "", i, il, j, jl;
    for(i=0,il=rows.length; i<il; i++) {
        for(j=0,jl=rows[i].length; j<jl; j++) {
            str += C.escape(rows[i][j]) + (j+1===jl ? '' : ',');
        }
        str += "\n";
    }
    return str.replace(/\n$/,'');
};

C.parse = C.idxParse;

g.TinyCSV=(g.window?{}:module).exports=C;

}(this));