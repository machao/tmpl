/*!
 * 极简JS模版引擎
 *
 * 版权所有(C) 2014 马超 (zjcn5205@yeah.net)
 *
 * 这一程序是自由软件，你可以遵照自由软件基金会出版的GNU通用公共许可证条款来修改和重新发布
 * 这一程序。或者用许可证的第二版，或者（根据你的选择）用任何更新的版本。
 * 发布这一程序的目的是希望它有用，但没有任何担保。甚至没有适合特定目的的隐含的担保。更详细
 * 的情况请参阅GNU通用公共许可证。
 * 你应该已经和程序一起收到一份GNU通用公共许可证的副本。如果还没有，写信给：
 * The Free Software Foundation, Inc., 675 Mass Ave, Cambridge, MA02139, USA
 */
(function($) {
    var tmplCache={}, fnCache={}, guid=0, toString = Object.prototype.toString, compile = function( tmpl, sp ){
        //默认分隔符
        var f = sp || "%",
            //动态创建函数，并增加数据源引用（data/my）
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
        return fn;
    };
    //对外接口
    $.template = function(tmpl, data, sp) {
        sp = sp||"%";
        var fn = toString.call(tmpl) === "[object Function]" ? tmpl
                : !/\W/.test(tmpl) ? fnCache[tmpl+sp] = fnCache[tmpl+sp] || compile(document.getElementById(tmpl).innerHTML, sp)
                : (function(){
                    for(var id in tmplCache)if( tmplCache[id] === tmpl && id.slice(-sp.length) === sp ) return fnCache[id];
                    return (tmplCache[++guid+sp] = tmpl, fnCache[guid+sp] = compile(tmpl, sp));
                })();
        return data ? fn.call(data) : fn;
    };
})(window.jQuery || window);