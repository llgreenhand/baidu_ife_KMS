(function (window, document) {
    // learn cloud初始化
    AV.initialize("x4wg7adtwqe58wyp20wfkiwflctzbgypi75kxwa14t7ivn7h", "b4t6fm6ej6zjwq1iemw7z3zypd2slava19va3xdxvci9wt21");


    //notebookObj.save({title: "设计",numberOfNote:"10"}, {
    //	success: function(object) {
    //		console.log(object);
    //	}
    //});


    /* for convient ,uses gloabl variable here */
    var global = {};
    global.notebooks = [];
    global.essays = [];
    global.selectedNotebook = null;
    global.selectedEssay = null;
    global.state = "read";   // state can be read or write or pending

    var MODALCODE = {
        duplicateNoteName: 1,
        removeNotebook: 2,
        removeNote: 3,
        previewEssay: 4
    };

    var modalCode = null;


    /* Handles all the logic here */
    $(document).ready(function () {


        /*================ Controller ================*/

        // 笔记本控制器，控制笔记本的行为
        var NotebooksCtrl = {};



        NotebooksCtrl.init = function(){

            console.log('Notebook init start...');
            NotebooksCtrl.$notebookArea = $('#notebooks');

            NotebooksCtrl.loadNotebooks(function(){
                console.log('Notebook init finished...');
                // console.log('Load all catalogue');
                NotebooksCtrl.set$notebooks();
                NotebooksCtrl.set$selectedNotebook();
            });

            $('.addNotebook').click(function () {
                console.log('click add notebook');
                $('.inputAddNotebook').show().focus();
            });

            var $inputAddNotebook =$('.inputAddNotebook');
            $inputAddNotebook.blur(inputAddNotebookBlur);

            $inputAddNotebook.keyup(function (event) {
                if (event.keyCode == 13) {
                    $inputAddNotebook.blur();
                }
            });
            // 添加目录对话框失去焦点事件；如果没有输入则隐藏输入框，有输入则保存
            function inputAddNotebookBlur(event) {
                console.log('Add notebook start...');
                var $target = $(event.target);
                if (!$target.val()) {
                    $target.hide();
                } else {
                    NotebooksCtrl.addNotebook($target.val());
                    $target.val('').hide();
                }
            }


            // 点击删除笔记本按钮
            $('.deleteNotebook').click(clickRemoveNotebook);

            // 点击删除笔记本
            function clickRemoveNotebook() {
                var message = {
                    title: "确定删除笔记本？",
                    content: "点击确定删除笔记本, 点击右上角的X取消删除"
                };
                modalCode = MODALCODE.removeNotebook;
                ModalCtrl.show(message);
            }


        };

        // 将具有selected类的元素选出来，作为$selectedNotebook,如果没有则选择第一个
        NotebooksCtrl.set$selectedNotebook = function () {
            NotebooksCtrl.$selectedNotebook = $('.notebook.selected');
            if (NotebooksCtrl.$selectedNotebook.length === 0 && NotebooksCtrl.$notebooks.length > 0) {
                NotebooksCtrl.$notebooks.first().click();
                NotebooksCtrl.$selectedNotebook = $('.notebook.selected');
            }

            return NotebooksCtrl.$selectedNotebook;
        };

        // 将所有的notebook元素选出来, 作为$notebooks, 并且为这些元素绑定点击事件
        NotebooksCtrl.set$notebooks = function () {
            NotebooksCtrl.$notebooks = $('.notebook');
            if (NotebooksCtrl.$notebooks.length > 0) {
                NotebooksCtrl.$notebooks.unbind();
                NotebooksCtrl.$notebooks.bind('click', NotebooksCtrl.clickNotebookEvent);
            }
        };

        NotebooksCtrl.loadNotebooks = function(callback){

            console.log('Load notebooks start...');
            NotebookModel.loadAll(loadNotebooksCallback);

            function loadNotebooksCallback(error, notebooks) {
                console.log('Load notebooks finished...');
                if (error) {
                    console.log('error');
                } else {
                    if (notebooks === undefined || notebooks.length === 0) {
                        notebooks = [];
                    }
                    NotebookView.render(NotebooksCtrl.$notebookArea, notebooks);
                }
                callback();
            }

        };

        // 单击notebook,选中当前notebook  该事件在util.checkNotebook中绑定
        NotebooksCtrl.clickNotebookEvent = function (event) {
            console.log('Click Notebook...');
            event.preventDefault();
            $target = $(this);
            if (!$target.hasClass('selected')) {

                NotebooksCtrl.$notebooks.removeClass('selected');
                $target.addClass('selected');
                $('.deleteNotebook').addClass('g_pointer');

                NotebooksCtrl.set$selectedNotebook();
                NotebookModel.selectNotebook($target.data('id'));

                global.state = 'read';
                console.log('Catalogue load...');
                if (NotebookModel.notebook.numberOfNote === 0) {
                    CatalogueView.render($('#catalogues'), []);
                    EssayCtrl.editEssay();
                    return 'no essay';
                }else{
                    CatalogurCtrl.loadCatalogue(NotebookModel.getId());
                }

            }
        };


        NotebooksCtrl.addNotebook = function (title) {
            var newNotebook = {
                title: title,
                numberOfNote: 0,
                alive: true
            };

            NotebookModel.add(newNotebook, addNotebookCallBack);

            function addNotebookCallBack(error, notebook) {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Add notebook success...');

                    if (notebook.id) {
                        console.log('Rend notebook node start...');
                        console.log(NotebooksCtrl.$notebookArea);
                        NotebookView.renderItem(NotebooksCtrl.$notebookArea, notebook);
                        NotebooksCtrl.set$notebooks();
                        NotebooksCtrl.$notebooks.first().click();
                    }
                }
            }
        };

        NotebooksCtrl.updateNotebook = function(){
            NotebookModel.update(NotebookModel.notebook, function(){
                NotebookView.update(NotebooksCtrl.$selectedNotebook, NotebookModel.notebook);
                NotebooksCtrl.set$notebooks();

            });
        };

        NotebooksCtrl.removeNotebook = function(){
            console.log('Remove notebook start...');
            $notebooksDeleted = NotebooksCtrl.$selectedNotebook;

            if ($notebooksDeleted.length > 0) {
                $notebooksDeleted.each(function (index, item) {
                    NotebookModel.remove($(item).data('id'), removeNotebookCallback);
                })
            }

            function removeNotebookCallback(error, notebook) {
                if (error) return console.log(error);
                //console.log('remove notebook');

                console.log('Remove notebook finish...');
                NotebooksCtrl.$selectedNotebook.remove();
                NotebooksCtrl.set$notebooks();
                NotebooksCtrl.set$selectedNotebook();
            }
        };



        // 目录控制器
        var CatalogurCtrl = {};

        CatalogurCtrl.init = function(){

            CatalogurCtrl.$catalogueArea = $('#catalogues');
            $('.create-essay').click(CatalogurCtrl.addCatalogue);

        };

        CatalogurCtrl.$selectedCatalogue = $('.catalogue.selected');
        CatalogurCtrl.$catalogues = $('.catalogue');

        CatalogurCtrl.set$selectedCatalogue = function(){
            CatalogurCtrl.$selectedCatalogue = $('.catalogue.selected');


            if(CatalogurCtrl.$catalogues.length > 0 && CatalogurCtrl.$selectedCatalogue.length==0){
                CatalogurCtrl.$catalogues.first().click();
                CatalogurCtrl.$selectedCatalogue = $('.catalogue.selected');
            }

            return CatalogurCtrl.$selectedCatalogue.first();
        };

        CatalogurCtrl.set$catalogues = function(){
            CatalogurCtrl.$catalogues = $('.catalogue');
            if(CatalogurCtrl.$catalogues.length > 0 ){
                $('.catalogue').unbind();
                CatalogurCtrl.$catalogues.click(CatalogurCtrl.clickCatalogueEvent);
            }

        };

        CatalogurCtrl.clickCatalogueEvent = function(){

            console.log('click catalogue...');

            var $target = $(this);
            if (!$target.hasClass('selected')) {


                if (global.state === "write") {
                    EssayCtrl.saveEssay();
                } else {
                    if (global.state === "pending"){
                        $('.catalogue').first().remove();
                    }
                    CatalogurCtrl.$catalogues.removeClass('selected');
                    $target.addClass('selected');
                    CatalogurCtrl.set$selectedCatalogue();
                    EssayModel.selectEssay($target.data('id'));
                    EssayCtrl.loadEssay();
                }
                global.state = 'read';
            }

        };

        CatalogurCtrl.loadCatalogue = function(id){

            console.log('Catalogue load start...');
            EssayModel.loadAll(id, loadEssaysCallback);


            function loadEssaysCallback(error, essays) {
                if (error) return console.log(error);

                console.log('Catalogue load finishing...');
                if (NotebookModel.notebook.numberOfNote !== essays.length) {
                    //console.log('update catalogue');

                    NotebookModel.NotebookModel.updateNumber('fix');
                    NotebooksCtrl.updateCatalogue();

                } else {
                    CatalogueView.render(CatalogurCtrl.$catalogueArea, essays);
                    CatalogurCtrl.set$catalogues();
                    CatalogurCtrl.set$selectedCatalogue();
                }

            }
        };

        CatalogurCtrl.addCatalogue  = function () {
            if (global.state === "read") {
                CatalogurCtrl.$catalogues.removeClass('selected');
                CreatingCatalogue.render(CatalogurCtrl.$catalogueArea);
                EssayCtrl.editEssay();
            }
        };
        
        CatalogurCtrl.updateCatalogue = function(){
            CatalogurCtrl.set$catalogues();
            CatalogurCtrl.set$selectedCatalogue().data('id', EssayModel.essay.id);
        };


        CatalogurCtrl.removeCatalogue = function(){
            EssayModel.remove(NotebookModel.getId(), EssayModel.essay.id, function (status, error) {
                if (status === "success") {

                    console.log('Remove essay finish...')
                    var nextCatalogue = CatalogurCtrl.$selectedCatalogue.next();
                    var prevCatalogue = CatalogurCtrl.$selectedCatalogue.prev();
                    CatalogurCtrl.$selectedCatalogue.remove();

                    if (nextCatalogue.length === 0) {

                        if (prevCatalogue.length === 0) {
                            // 没有文章了,重新渲染
                            CatalogueView.render(CatalogurCtrl.$catalogueArea, []);
                            EssayCtrl.editEssay();
                        } else {
                            prevCatalogue.trigger('click');
                        }
                    } else {
                        nextCatalogue.trigger('click');
                    }

                    NotebookModel.updateNumber(-1);
                    NotebooksCtrl.updateNotebook();

                } else if (status === "error") {
                    // report error
                    console.log(error);
                }
            })
        };



        /*
         * Essay Controller控制Essay Model和 Essay View的交互
         *
         */
        var EssayCtrl = {};



        EssayCtrl.init = function(){

            EssayCtrl.$essayArea = $('#content');
            EssayCtrl.$editorTitle = $('input.essay-title');
            EssayCtrl.$editorContent = $('div.editor-area');

            // 点击删除笔记按钮, 因为deleteEssay按钮可能没有生成，所以事件绑定在document上
            $(document).on('click', '.deleteEssay', function clickRemoveEssay(event) {

                event.preventDefault();
                var message = {
                    title: "确定删除笔记？",
                    content: "点击确定删除笔记, 点击右上角的X取消删除"
                };
                modalCode = MODALCODE.removeNote;
                ModalCtrl.show(message);


            });

            $(document).on('keyup', '.essay-title', function () {
                var title = $(this).val() || '标题';
                $('.catalogue.selected').find('h5').html(title);
                checkState();
            });

            $(document).on('keyup', '.editor-area', function () {
                var content = $(this).text() || '令人虎躯一震的内容';
                if (content.length > 80) {
                    content = content.slice(0, 80) + '...';
                }
                $('.catalogue.selected').find('p').html(content);
                checkState();
            });
            function checkState() {
                if ($('.essay-title').val() && $('.editor-area').html()) {
                    global.state = "write";
                }
            }
            // 点击预览按钮
            $('.preview-essay').click(function () {
                EssayCtrl.preview();
            });

            $('.add-essay').click(EssayCtrl.saveEssay);

            // content滚动，删除button一直在右上角显示效果
            EssayCtrl.$essayArea.scroll(function () {
                if ($('.content').scrollTop() > 139) {
                    $('.content_close').addClass('content_close-out');
                } else {
                    $('.content_close').removeClass('content_close-out');
                }

            })
        };

        // 处理内容得到Essay markdown HTML
        EssayCtrl.contentToHtml = function (content) {
            return markdown.toHTML(util.htmlFilter(content));
        };
        // 实现预览功能
        EssayCtrl.preview = function () {
            var content = this.$editorContent.html();
            var message = {
                title: this.$editorTitle.val(),
                content: this.contentToHtml(content)
            };
            console.log(message);
            modalCode = MODALCODE.previewEssay;
            ModalCtrl.show(message);
        };

        EssayCtrl.loadEssay = function(){
            EssayView.render(EssayCtrl.$essayArea, EssayModel.essay);
        };

        EssayCtrl.editEssay = function(){
            if (global.state === "read") {
                $('.essay-title').val('');
                $('.editor-area').html('');
                CreatingEssayView.render();
            }
            global.state = 'pending';
        };

        EssayCtrl.saveEssay = function(){
            console.log('Save essay start...');
            var newEssay = {};
            newEssay.title = EssayCtrl.$editorTitle.val();
            newEssay.content = util.htmlFilter(EssayCtrl.$editorContent.html());
            newEssay.alive = true;

            //console.log(newEssay.content);
            //console.log(markdown.toHTML(newEssay.content));

            if (newEssay.title && newEssay.content) {
                EssayModel.add(NotebookModel.getId(), newEssay, saveEssayCallback);
                function saveEssayCallback(error, essay) {
                    if (error) return console.log('Save Essay Faild some error occurred');

                    console.log('Save essay finish...');
                    NotebookModel.updateNumber(1);
                    NotebooksCtrl.updateNotebook();


                    EssayModel.selectEssay(essay.id);
                    CatalogurCtrl.updateCatalogue();


                    EssayView.render(EssayCtrl.$essayArea, EssayModel.essay);
                    global.state = 'read';
                }
            }
        }

        EssayCtrl.removeEssay = function clickRemoveEssay() {

            console.log('Remove essay starting...');
            CatalogurCtrl.removeCatalogue()
        };

        /*
         * Modal COntroller 控制弹窗的行为
         *
         */
        var ModalCtrl = {};

        ModalCtrl.message = {};

        ModalCtrl.init = function () {
            ModalCtrl.$modal = $('.modal-frame');
            ModalCtrl.$overlay = $('.modal-overlay');
            ModalCtrl.$confirmBtn = $('.modal-btn');
            ModalCtrl.$title = $('.modal-title');
            ModalCtrl.$content = $('.modal-content');

            /* Need this to clear out the keyframe classes so they dont clash with each other between ener/leave. Cheers. */
            ModalCtrl.$modal.bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
                if (ModalCtrl.$modal.hasClass('state-leave')) {
                    ModalCtrl.$modal.removeClass('state-leave');
                }
            });

            $(document).on('click', '.modal-close-action', ModalCtrl.hide);


        };
        ModalCtrl.show = function (message) {
            this.message = message;
            this.$confirmBtn.unbind();
            switch (modalCode) {
                case MODALCODE.duplicateNoteName:
                    break;
                case MODALCODE.removeNotebook:
                    this.$confirmBtn.click(NotebooksCtrl.removeNotebook);
                    break;
                case MODALCODE.removeNote:
                    this.$confirmBtn.click(EssayCtrl.removeEssay);
                    break;
                case MODALCODE.previewEssay:
                    this.$modal.addClass('modal-preview');
                    break;
            }
            this.$title.html(this.message.title);
            this.$content.html(this.message.content);
            this.$overlay.addClass('state-show');
            this.$modal.removeClass('state-leave').addClass('state-appear');
        };

        ModalCtrl.hide = function () {
            switch (modalCode) {
                case MODALCODE.duplicateNoteName:
                    $('.inputAddNotebook').focus();
                case MODALCODE.previewEssay:
                    ModalCtrl.$modal.removeClass('modal-preview');
                    break;
            }
            ModalCtrl.$overlay.removeClass('state-show');
            ModalCtrl.$modal.removeClass('state-appear').addClass('state-leave');
            ModalCtrl.message = {};
        };


        window.NotebooksCtrl = NotebooksCtrl;
        window.CataCtrl = CatalogurCtrl;
        window.EsssyCtrl = EssayCtrl;


        // ******************* 执行区域 ******************* \\
        NotebooksCtrl.init();
        CatalogurCtrl.init();
        EssayCtrl.init();
        ModalCtrl.init();

    });

    $('.editor-area').on('paste', function () {
        var $this = $(this);
        setTimeout(function () {
            $this.html($this.text());
        }, 3);
    });

    $('a').click(function (event) {
        event.preventDefault();
    });



})(this, this.document);
