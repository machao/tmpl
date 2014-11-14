极简JS模版引擎 tmpl
==================

极简js模版引擎，30行代码，支持自定义分隔符、js语法、变量直接输出等功能。
基于大牛的引擎修改：http://ejohn.org/blog/javascript-micro-templating/

另有一款纯原创极简js填充引擎：[format](https://github.com/machao/format/ "极简JS模版填充引擎 format")

源码：

	(function($) {
    var tmplCache={}, fnCache={}, guid=0, toString = Object.prototype.toString, compile = function( tmpl, sp ){
        //默认分隔符
        var f = sp || "%",
            //动态创建函数，并增加数据源引用（data/my）
            fn = new Function("var p=[],my=this,data=my,print=function(){p.push.apply(p,arguments);};p.push('" +
                // Convert the template into pure JavaScript
                tmpl
                .replace(/[\r\t\n]/g, " ")
                .split("<" + f).join("\t")
                .replace(new RegExp("((^|" + f + ">)[^\\t]*)'", "g"), "$1\r")
                .replace(new RegExp("\\t=(.*?)" + f + ">", "g"), "',$1,'")
                .split("\t").join("');")
                .split(f + ">").join("p.push('")
                .split("\r").join("\\'") + "');return p.join('');");
        return fn;
    };
    //对外接口
    $.template = function(tmpl, data, sp) {
        sp = sp||"%";
        var fn = toString.call(tmpl) === "[object Function]" ? tmpl
                : !/\W/.test(tmpl) ? fnCache[tmpl+sp] = fnCache[tmpl+sp] || compile(document.getElementById(tmpl).innerHTML, sp)
                : (function(){
                    for(var id in tmplCache)if(tmplCache[id] === tmpl) return fnCache[id];
                    return (tmplCache[++guid] = tmpl, fnCache[guid] = compile(tmpl, sp));
                })();
        return data ? fn.call(data) : fn;
    };
	})(window.jQuery || window.Zepto || window);

基本示例：

	var templ = "this is a easy <%=this.name%>.";
	var ret = $.template(templ, {name:"demo"});
	//ret:  "this is a easy demo."

自定义分隔符：
	
	var templ = "this is a easy <#=this.name#> too.";
	var ret = $.template(templ, {name:"demo"}， "#");
	//ret:  "this is a easy demo too."

数据源变量别称：
	
	var templ = "this is a <%=my.type%> <%=data.name%> too.";
	var ret = $.template(templ, {name:"demo", type:"easy"});
	//ret:  "this is a easy demo too."

自定义函数：

	var templ = "<%=my.name%>有<%=my.getNum(my.name)%>个编辑器。";
	var getNum = function(name){
		return {"我":"俩","他":"三"}[name];
	};
	var ret = $.template(templ, {name:"我", getNum:getNum});
	//ret:  "我有两个编辑器。"
	ret = $.template(templ, {name:"他", getNum:getNum});
	//ret:  "他有三个编辑器。"

js语句调用：

	var templ = "<%for(var i=0;i<data.length;i++){%><%=i+1%>、<%=data[i]%><%}%>";
	var ret = $.template(templ, ["精简","易用"]);
	//ret: "1、精简2、易用"

页面模版读取：

	<script type="text/html" id="item_tmpl">
		<%for(var x in data.list){%><li><%=x%>:<%=data.list[x]%></li><%}%>
	</script>

	//js代码：
	ret = $.template("item_tmpl", {list:{"name":"zjcn5205","country":"china"}});
	//ret: "<li>name:zjcn5205</li><li>country:china</li>" //已经忽略前后空格

模版预编译
	
	var templ = "this is a easy <%=this.name%>.", data = {name : "demo"};
	//注：预编译暂时不支持自定义分割符号
	var fn = $.template( templ );
	//编译后返回一个js函数，该函数可以重新交给模版引擎使用，也可以独立调用
	var ret = $.template(fn, data);
	//等价于 var ret = fn.call( data );
	//ret:  "this is a easy demo."