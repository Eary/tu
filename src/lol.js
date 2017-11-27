/**
 * LOL
 * Data management platform
 * https://github.com/xCss
*/

import md5 from 'blueimp-md5';
import marked from 'marked';
import detect from './detect';

function LOL(opts){
    var root = this;
    root.Init(opts);
    return root;
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
    av._useMasterKey = !0;

    root.v = av;

    if(el){
        
        root.el = el;
        root.el.classList.add('valine');
        let eleHTML = `<div style="display:none;" class="vmark"></div></div><div class="vinfo" style="display:none;"><div class="vcount col"></div></div><ul class="vlist"></ul><div class="vempty" style="display:none;"></div><div class="vpage txt-center" ></div><div class="info"><div class="power txt-right">Powered By <a href="https://valine.js.org" target="_blank">Valine</a></div></div>`;
        root.el.innerHTML = eleHTML;

        // Empty Data
        let vempty = root.el.querySelector('.vempty');
        root.nodata = {
            show(txt) {
                vempty.innerHTML = txt || '还没有评论哦~';
                vempty.setAttribute('style', 'display:block;');
                return root;
            },
            hide() {
                vempty.setAttribute('style', 'display:none;');
                return root;
            }
        }

        // loading
        let _spinner = document.createElement('li');
        _spinner.setAttribute('class', 'vloading');
        _spinner.innerHTML = `<div class="loading loading--double"></div>`;
        // loading control
        let _vlist = root.el.querySelector('.vlist');
        root.loading = {
            show(mt) {
                let _vlis = _vlist.querySelectorAll('li');
                if (mt) _vlist.insertBefore(_spinner, _vlis[0]);
                else _vlist.appendChild(_spinner);
                root.nodata.hide();
                return root;
            },
            hide() {
                let _loading = _vlist.querySelector('.vloading');
                if (_loading) _vlist.removeChild(_loading)
                _vlist.querySelectorAll('.vcard').length === 0 && root.nodata.show()
                return root;
            }
        };
    }
    root.Bind();
    return root;
    //root.load()
}

LOL.prototype.Bind = function(){
    var root = this;
    var num = 1;
    var query = function (n) {
        n = n || num;
        var size = 20;
        var count = Number(root.el.querySelector('.vnum').innerText);
        root.loading.show();
        var cq = root.Q();
        cq.limit(size);
        cq.skip((n - 1) * size);
        cq.find().then(rets => {
            var len = rets.length;
            for (var i = 0; i < len; i++) {
                insertDom(rets[i], !0)
            }
            var _vpage = root.el.querySelector('.vpage');
            _vpage.innerHTML = size * n < count ? `<button type="button" class="vmore vbtn">查看更多...</button>` : '';
            var _vmore = _vpage.querySelector('.vmore');
            if (_vmore) {
                Event.on('click', _vmore, (e) => {
                    _vpage.innerHTML = '';
                    query(++num)
                })
            }
            root.loading.hide();
        }).catch(ex => {
            console.log(ex)
            root.loading.hide().ErrorHandler(ex.code)
        })
    }

    
    root.Q().count().then(num => {
        if (num > 0) {
            root.el.querySelector('.vinfo').setAttribute('style', 'display:block;');
            root.el.querySelector('.vcount').innerHTML = `<span class="vnum">${num}</span> 条评论`;
            query();
        } else {
            root.loading.hide();
        }
    }).catch(ex => {
        root.ErrorHandler(ex.code)
    });


    var insertDom = function(ret, mt) {
        var _vcard = document.createElement('li');
        _vcard.setAttribute('class', 'vcard');
        _vcard.setAttribute('id', ret.id);
        var _img = `<img class="vimg" src='https://gravatar.cat.net/avatar/${md5(ret.get('mail'))}'>`;
        var ua = detect(ret.get('ua'));
        var browser = `<span class="vsys">${ua.browser} ${ua.version}</span>`;
        var os = `<span class="vsys">${ua.os} ${ua.osVersion}</span>`;
        var path = `<span class="vsys">${ret.get('url')}</span>`;
        var _nick = '';
        var _t = ret.get('link') || (!!ret.get('mail') ? `mailto:${ret.get('mail')}` : '');
        _nick = _t ? `<a class="vname" rel="nofollow" href="${_t}" target="_blank" >${ret.get("nick")}</a>` :`<span class="vname">${ret.get('nick')}</span>`;
        _vcard.innerHTML = `${_img}<section><div class="vhead">${_nick} ${path}</div><div class="vcontent">${ret.get("comment")}</div><div class="vfooter"><span class="vtime">${dateFormat(ret.get("createdAt"))}</span><span rid='${ret.id}' at='@${ret.get('nick')}' mail='${ret.get('mail')}' class="del vat">删除</span><div></section>`;
        var _vat = _vcard.querySelector('.vat');
        var _as = _vcard.querySelectorAll('a');
        for (var i = 0, len = _as.length; i < len; i++) {
            var item = _as[i];
            if (item && item.getAttribute('class') != 'at') {
                item.setAttribute('target', '_blank');
                item.setAttribute('rel', 'nofollow');
            }
        }
        var _vlist = root.el.querySelector('.vlist');
        var _vlis = _vlist.querySelectorAll('li');
        if (mt) _vlist.appendChild(_vcard);
        else _vlist.insertBefore(_vcard, _vlis[0]);
        var _vcontent = _vcard.querySelector('.vcontent');
        if (_vcontent) expandEvt(_vcontent);
        if (_vat) bindDevEvt(_vat);
    }

    
    // expand event
    var expandEvt = function(el){
        setTimeout(function () {
            if (el.offsetHeight > 180) {
                el.classList.add('expand');
                Event.on('click', el, function(e){
                    el.setAttribute('class', 'vcontent');
                })
            }
        }, 20)
    }

    var bindDevEvt = function(el){
        var id = el.getAttribute('rid')
        Event.on('click',el,function(e){
            if(confirm('确定删除该数据?')){
                root.D(id).then(ret=>{
                    console.log(ret)
                }).catch(ex=>{
                    console.log(ex)
                })
            }
        })
    }
}

LOL.prototype.Q = function(){
    var root = this,
        q = new root.v.Query('Comment');
    q.descending('createdAt');
    return q;
}

LOL.prototype.D = function(id){
    var root = this;
    var comment = root.v.Object.createWithoutData('Comment', id);
    return comment.destroy();
}

var Event = {
    on:function(type, el, handler, capture) {
        if (el.addEventListener) el.addEventListener(type, handler, capture || false);
        else if (el.attachEvent) el.attachEvent(`on${type}`, handler);
        else el[`on${type}`] = handler;
        return this;
    },
    off:function(type, el, handler, capture) {
        if (el.removeEventListener) el.removeEventListener(type, handler, capture || false);
        else if (el.detachEvent) el.detachEvent(`on${type}`, handler);
        else el[`on${type}`] = null;
        return this;
    }
}

const dateFormat = (date) => {
    var vDay = padWithZeros(date.getDate(), 2);
    var vMonth = padWithZeros(date.getMonth() + 1, 2);
    var vYear = padWithZeros(date.getFullYear(), 2);
    var vHour = padWithZeros(date.getHours(), 2);
    var vMinute = padWithZeros(date.getMinutes(), 2);
    var vSecond = padWithZeros(date.getSeconds(), 2);
    return `${vYear}-${vMonth}-${vDay} ${vHour}:${vMinute}:${vSecond}`;
}

var padWithZeros = function(vNumber, width){
    var numAsString = vNumber.toString();
    while (numAsString.length < width) {
        numAsString = '0' + numAsString;
    }
    return numAsString;
}

function lolFactory(opts){
    return new LOL(opts);
}

module.exports = lolFactory
