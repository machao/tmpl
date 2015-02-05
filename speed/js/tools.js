//工具函数
//如果AppCore 和 最新版的easyCore 一起使用，则不用引用该js
//2015-01-20 马超：目前仅仅使用到 addUrlPara / removeUrlPara / safeHTML 这三个接口
(function(window, $) {
    var tools = {
        /**
         * @name AppCore.helper.getUrlPara
         * @description 从页面URL中获取指定的参数内容
         * @param  {string} [paraName] 要读取的参数
         * @return {string|object}  如果传递了paraName则返回字符串，不传递paraName则返回所有url中的参数描述对象
         * @function
         */
        getUrlPara: function(paraName) {
            var str = window.location.search.replace(/^\?/g, ""),
                dstr = str;
            //先解码，解码失败则替换&链接符号，保证内容能够解析
            //解码失败的情况极其少见，以后确认算法后可以优化代码
            try {
                dstr = decodeURI(str);
            } catch (e) {
                dstr = str.replace(/"%26"/g, "&");
            }
            return tools.getParaFromString(dstr, paraName);
        },
        /**
         * @name AppCore.helper.getHashPara
         * @description 从页面URL HASH中获取指定的参数内容
         * @param  {string} [paraName] 要读取的参数
         * @return {string|object}  如果传递了paraName则返回字符串，不传递paraName则返回所有url hash中的参数描述对象
         * @function
         */
        getHashPara: function(paraName) {
            var match = window.location.href.match(/#(.*)$/);
            return tools.getParaFromString(match ? match[1] : '', paraName);
        },
        /**
         * @name AppCore.helper.getParaFromString
         * @description 从指定的字符串中获取指定的参数内容
         * @param  {string} str 要分析的源字符串
         * @param  {string} [paraName] 要读取的参数
         * @return {string|object}  如果传递了paraName则返回字符串，不传递paraName则返回所有str中的参数描述对象
         * @function
         */
        getParaFromString: function(str, paraName) {
            var data = {};
            $.each(("" + str).match(/([^=&#\?]+)=[^&#]+/g) || [], function(i, para) {
                var d = para.split("="),
                    val = decodeURIComponent(d[1]);
                if (data[d[0]] !== undefined) {
                    data[d[0]] += "," + val;
                } else {
                    data[d[0]] = val;
                }
            });
            return paraName ? data[paraName] || "" : data;
        },
        /**
         * @name AppCore.helper.safeHTML
         * @description 转义不安全的html字符
         * @param  {string} str 要转义的的源字符串
         * @return {string}  处理后的字符串，可以放心插入到dom节点中去
         * @function
         */
        safeHTML: function(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },
        /**
         * @name AppCore.helper.addUrlPara
         * @param {string} url 要处理的url
         * @param {string} para 要增加的url，比如 "id=1&name=machao"
         * @param {boolean} [removeSamePara=false] 添加之前是否先移除同名的参数
         * @return {string} 处理好的url字符串
         * @function
         */
        addUrlPara: function(href, para, removeSamePara) {
            var url = (href + "").split('#'),
                sp;
            url[0] = url[0].replace(/&+$/, "");
            //先移除同名参数
            if (removeSamePara) {
                url[0] = tools.removeUrlPara(url[0], $.map(para.match(/([^=&#\?]+)=[^&#]+/g), function(str) {
                    return str.replace(/=.+$/, "")
                }));
            }
            sp = url[0].indexOf("?") + 1 ? "&" : "?";
            return (url[0] + sp + para + (url.length > 1 ? "#" + url[1] : "")).replace(/\?\&/, "?");
        },
        /**
         * @name AppCore.helper.removeUrlPara
         * @param {string} url 要处理的url
         * @param {string|array<string>} [paraName] 要移除的参数或数组，比如 "id" 或 ["name","id"]，如果不传此参数，则全部移除
         * @return {string} 处理好的url字符串
         * @function
         */
        removeUrlPara: function(url, paraName) {
            var arr1 = url.split("#"),
                arr2 = arr1[0].split("?"),
                base = arr2[0],
                para = arr2.length > 1 ? arr2[1] : "",
                hash = arr1.length > 1 ? "#" + arr1[1] : "",
                paraReg = typeof paraName === "string" && paraName ? [paraName] : paraName.join ? paraName : [];
            if (!paraReg.length || !para) {
                return base.replace(/\?.+$/, "") + hash;
            }
            $.map(paraReg, function(str) {
                return str.replace(/([\\\(\)\{\}\[\]\^\$\+\-\*\?\|])/g, "\\$1");
            });
            return (
                base + "?" + para.replace(new RegExp("(\?:^\|&)(?:" + paraReg.join("|") + ")=[^&$]+", "g"), "").replace(/^&/, "")
            ).replace(/\?$/, "") + hash;
        },
        /**
         * @name AppCore.helper.fillUrl
         * @description 将相对路径地址转化为绝对路径（在当前页面环境下）
         * @param  {string} url 待处理的url地址
         * @return {string} 处理完毕的完整url地址
         * @function
         */
        fillUrl: function(url) {
            if (typeof url !== "string" || url == "") return url;
            if (!/^http/i.test(url)) {
                var port = window.location.port || "80",
                    fromRoot = /^\//.test(url);
                if (!fromRoot)
                    url = document.URL.replace(/\/[^\/]*$/g, "\/") + url;
                else
                    url = window.location.protocol + "//" + window.location.host + (port == "80" ? "" : (":" + port)) + url;
            }
            return url;
        },
        /**
         * @name  AppCore.helper.format
         * @description 格式化模版
         * @param {string} string 需要格式化的模版字符串
         * @param {string|array|object} source 要填充的数据
         * @return {string} 格式化好的字符串
         * @function
         */
        format: (function(undefined) {
            //测试浏览器是否支持正则表达式预编译
            var baseReg = /\{([\w\.]+)\}/g,
                numReg = /^\d+$/,
                //预编译核心的正则表达式，以提高正则匹配效率
                formatReg = baseReg.compile ? baseReg.compile(baseReg.source, "g") || baseReg : baseReg,
                //其他工具函数
                toString = Object.prototype.toString,
                slice = Array.prototype.slice;
            //对外接口
            return function(string, source) {
                if (source === undefined || source === null) return string;
                var isArray = true,
                    type = toString.call(source),
                    //检测数据源
                    data = type === "[object Object]" ? (isArray = false, source) : type === "[object Array]" ? source : slice.call(arguments, 1),
                    N = isArray ? data.length : 0;
                //执行替换
                return String(string).replace(formatReg, function(match, index) {
                    var isNumber = numReg.test(index),
                        n, fnPath, val;
                    if (isNumber && isArray) {
                        n = parseInt(index, 10);
                        return n < N ? data[n] : match;
                    } else { //数据源为对象，则遍历逐级查找数据
                        fnPath = index.split(".");
                        val = data;
                        for (var i = 0; i < fnPath.length; i++)
                            val = val[fnPath[i]];
                        return val === undefined ? match : val;
                    }
                });
            };
        })()
    };
    //扩展到基库上
    $.extend($, tools);
    //扩展到AppCore.helper上
    window.AppCore && AppCore.helper && $.extend(AppCore.helper, tools);
})(window, window.jQuery || window.Zepto);
