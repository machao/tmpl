极简JS模版引擎 tmpl
==================

极简js模版引擎，21行代码，支持自定义分隔符、js语法、变量直接输出等功能。
基于大牛的引擎修改：http://ejohn.org/blog/javascript-micro-templating/

源码：

	(function($) {
	    $.template = function(tmpl, data, sp) {
	        //默认分隔符
	        var f = sp || "%",
	            //动态创建函数
	            fn = new Function("var p=[],my=this,data=my,print=function(){p.push.apply(p,arguments);};p.push('" +
	                // Convert the template into pure JavaScript
	                tmpl
	                .replace(/[\r\t\n]/g, " ")
	                .replace(new RegExp("<" + f + "=\\s*([^\\t]*?);*\\s*" + f + ">", "g"), "<" + f + "print($1);" + f + ">")
	                .split("<" + f).join("\t")
	                .replace(new RegExp("((^|" + f + ">)[^\\t]*)'", "g"), "$1\r")
	                .replace(new RegExp("\\t=(.*?)" + f + ">", "g"), "',$1,'")
	                .split("\t").join("');")
	                .split(f + ">").join("p.push('")
	                .split("\r").join("\\'") + "');return p.join('');");
	        //返回
	        return data ? fn.call(data) : fn;
	    };
	})(jQuery || window);

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