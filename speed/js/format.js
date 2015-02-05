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
(function($, undefined) {
    //测试浏览器是否支持正则表达式预编译
    var baseReg = /\{([\w\.]+)\}/g, numReg = /^\d+$/,
        //预编译核心的正则表达式，以提高正则匹配效率
        formatReg = baseReg.compile ? baseReg.compile(baseReg.source, "g") || baseReg : baseReg,
        //其他工具函数
        toString = Object.prototype.toString, slice = Array.prototype.slice;
    //对外接口
    $.format = function(string, source){
        if( source === undefined || source === null )return string;
        var isArray = true, type = toString.call(source),
            //检测数据源
            data = type === "[object Object]" ? (isArray = false, source) : type === "[object Array]" ? source : slice.call(arguments, 1),
            N = isArray ? data.length : 0;
        //执行替换
        return String(string).replace(formatReg, function(match, index) {
            var isNumber = numReg.test(index), n, fnPath, val;
            if( isNumber && isArray ){
                n = parseInt(index, 10);
                return n < N ? data[n] : match;
            }else{ //数据源为对象，则遍历逐级查找数据
                fnPath = index.split(".");
                val = data;
                for(var i=0; i<fnPath.length; i++)
                    val = val[fnPath[i]];
                return val === undefined ? match : val;
            }
        });
    };
})(window.jQuery || window.Zepto || window);