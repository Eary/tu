/**
 * LOL
 * Valine Comment System Data management platform
 * https://github.com/xCss
 */
!(function(root,factory){
    if(typeof define === 'function' && define.amd){
        define(factory)
    }else if(typeof exports === 'object' && module.exports){
        module.exports = factory(root); // nodejs support
        module.exports['default'] = module.exports; // es6 support
    }else root.lol = factory(root);
})(typeof window !== 'undefined' ? window : this,
function(){
    function LOL(opts){
        var root = this;
        root.Init(opts);
    }

    LOL.prototype.Init = function(opts){
        var root = this,
            av = AV,
            el = ({}).toString.call(opts.el) === "[object String]"?document.querySelector(opts.el):opts.el;

        if(!av){
            setTimeout(function(){
                root.Init(opts);
            },20);
            return;
        }

        av.init({
            appId:opts.appId,
            appKey:opts.appKey,
            masterKey:opts.masterKey
        });

        root.v = av;
        root.el = el;

        //root.load()
    }

    LOL.prototype.Bind = function(){

    }

    LOL.prototype.Q = function(){
        var root = this,
            q = new root.v.Query('Comment');
        q.descending('createdAt');
        return q;
    }

    function lolFactory(opts){
        return new LOL(opts);
    }

    return lolFactory;
});