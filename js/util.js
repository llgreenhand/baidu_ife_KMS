(function (window, document) {
    var util = {};

    // 检查notebook，如果为空隐藏删除按钮，并且为所有笔记本绑定点击时间
    util.checkNotebook = function (clickNotebook) {
        if ($('#notebooks').children('li').length === 0) {
            $('.deleteNotebook').hide();
        } else {
            var $notebook = $('.notebook');
            $notebook.find('a').unbind();
            $('.deleteNotebook').show();
            //$('.notebook').find('a').click(clickNotebook);

            // 绑定事件之前首先清理事件，否则事件会触发多次
            $notebook.unbind();
            $notebook.bind('click', clickNotebook);
        }

    }

    util.checkCatalogue = function (clickCatalogue) {
        // console.log('check Catalogue');
        var $catalogue = $('.catalogue');
        $catalogue.unbind();
        $catalogue.bind('click', clickCatalogue);
        // $(document).on('click', '.catalogue', clickCatalogue);
    }

    util.setTimer = function (fn, interval) {
        var recurse, ref;
        ref = {};
        ref.continue = true;
        (recurse = function () {
            if (ref.continue) {
                ref.timeout = setTimeout(function () {
                    fn();
                    recurse();
                }, interval);
            }
        })();
        return ref;
    };

    util.clearTimer = function (ref) {
        ref['continue'] = false;
        clearTimeout(ref);
    };

    util.DataBinder = function (object_id) {
        // 使用一个jQuery对象作为简单的订阅者发布者
        var pubSub = $({});

        var data_attr = "bind-" + object_id,
            message = object_id + ":change";

        $(document).on('change', '[data-' + object_id + ']', function (event) {
            var $input = $(this);
            pubSub.trigger(message, [$input.data(data_attr), $input.val()]);
        });

        pubSub.on('message', function (event, prop_name, new_val) {
            $('[data-' + object_id + '=' + prop_name + ']').each(function () {
                var $bound = $(this);

                if ($bound.is("input,textarea,select")) {
                    $bound.val(new_val);
                } else {
                    $bound.html(new_val);
                }
            })
        });

        return pubSub;
    }


    // 将从learnCloud得到的notebook对象拷贝成我们需要的对象
    util.cloneNotebook = function (fromObj, toObj) {
        toObj = toObj || {};
        toObj.id = fromObj.id;
        toObj.title = fromObj.attributes.title;
        toObj.numberOfNote = parseInt(fromObj.attributes.numberOfNote);
        toObj.alive = fromObj.attributes.alive;
        return toObj;
    }
    util.findSelectOne = function (title, array) {
        var target = {};
        array.forEach(function (item) {
            if (item.title == title) {
                target = item;
            }
        });
        return target;
    };

    util.findById = function(id, array){
        return array.filter(function(item){
            return item.id === id;
        })[0];

    };

    util.clone = function(fromObj,toObj){
        var toObj = toObj || {};
        for(key in fromObj){
            if(fromObj.hasOwnProperty(key)){
                if(fromObj[key] instanceof Object){
                    util.clone(fromObj[key],toObj[key]);
                }else{
                    toObj[key] = fromObj[key];
                }
            }
        }
        return toObj;
    }

    util.cloneEssay = function (fromObj, toObj) {
        toObj = toObj || {};
        toObj.id = fromObj.id;
        toObj.title = fromObj.attributes.title;
        toObj.className = fromObj.attributes.className;
        toObj.content = fromObj.attributes.content;
        toObj.short = fromObj.attributes.content.replace(/\n/g, "").replace(/#|\*/g,' ').slice(0, 80);
        toObj.short += toObj.content.length > 80 ? '...' : '';
        toObj.date = new Date(fromObj.createdAt);
        return toObj;
    };

    util.htmlFilter = function(html){

        var string = html.replace(/<\/div>/g,'').replace(/<div>/g,'\n').replace(/<br>/g, '');
        return string;
    }
    window.util = util;
})(this, this.document)