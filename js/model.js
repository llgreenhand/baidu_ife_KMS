(function (window, document) {

    /* Learn cloud Models
     *  从learncloud加载内容，并且支持对learn cloud上的内容进行编辑
     *  Notebook: 是笔记本对象，有两个属性 title和numberOfNote
     *
     */
    var Notebook = AV.Object.extend("Notebook");
    window.Notebook = Notebook;
    //var notebookObj = new Notebook();

    var leanNotebooks = [];
    var leanEssays = [];
    var NotebookModel = {};


    // 定义notebook对象, objectId是leancloud生成，作为笔记本的类名
    NotebookModel.notebook = {
        title: '',
        alive: false,
        numberOfNote: 0,
        id: ''
    };

    NotebookModel.notebooks = [];

    /*  从LeanCloud获得所有的笔记本数据。
     *
     *  Calls: callback(error, entries)
     *  error -- the error that occurred or NULL if no error occurred
     *  notebooks -- an array of entries
     */
    NotebookModel.loadAll = function (callback) {
        var query = new AV.Query(Notebook);
        query.equalTo("alive", true);
        var notebookCollection = query.collection();

        notebookCollection.comparator = function (object) {
            return object.createdAt.getTime();
        };

        notebookCollection.fetch({
            success: function (collection) {
                NotebookModel.notebooks = [];
                collection.models.forEach(function (item) {

                    var notebook = util.cloneNotebook(item);
                    NotebookModel.notebooks.unshift(notebook);

                });

                callback(false, NotebookModel.notebooks);
            },
            error: function (collection, error) {
                console.log(error);
                callback(error, null);
            }
        });


    }

    /* Adds the given notebook to the list of notebooks. The notebook must *not* have
     * an id associated with it.
     *
     *  Calls: callback(error, notebook)
     *  error -- the error that occurred or NULL if no error occurred
     *  notebook -- the notebook added, with an id attribute
     */
    NotebookModel.add = function (notebook, callback) {
        // TODO
        var notebookObj = new Notebook();
        NotebookModel.checkNotebook(notebook);

        notebookObj.save(notebook,
            {
                success: function (notebook) {
                    var retNotebook = util.cloneNotebook(notebook);
                    //util.cloneNotebook(notebook, retNotebook); // TODO DELETE
                    //leanNotebooks.push(notebook); // TODO DELETE

                    NotebookModel.notebooks.push(retNotebook);
                    callback(null, retNotebook);
                },
                error: function (notebook, error) {
                    console.log(error);
                    callback(error, notebook);
                }
            });

    };

    /* Updates the given entry. The entry must have an id attribute that
     * identifies it.
     *
     * Calls: callback(error)
     *  error -- the error that occurred or NULL if no error occurred
     */

    NotebookModel.update = function (notebook, callback) {

        var query = new AV.Query(Notebook);
        NotebookModel.checkNotebook(notebook);

        query.get(notebook.id, {
            success: function (notebookObj) {
                notebookObj.set('numberOfNote', notebook.numberOfNote);
                notebookObj.save()
                    .done(function (notebookObj) {
                        var notebook = util.cloneNotebook(notebookObj);

                        NotebookModel.notebooks.forEach(function (item) {
                            if (item.id === notebook.id) {
                                util.cloneNotebook(notebook, item);
                            }
                        });

                        callback(null, notebook);


                    })

                    .fail(function (notebookObj, error) {
                        console.error(arguments);
                        callback(error, notebookObj);
                    });
            },
            error: function (notebook, error) {
                console.error(arguments);
                callback(error, notebook);
            }
        });
    }

    /* Deletes the entry with the given id.
     *
     * Calls: callback(error)
     *  error -- the error that occurred or NULL if no error occurred
     */
    NotebookModel.remove = function (id, callback) {

        //console.log('remove called');
        console.log(id);
        console.log(NotebookModel.notebooks);


        var query = new AV.Query(Notebook);

        query.get(id, {
            success: function (notebookObj) {
                notebookObj.set('alive', false);
                notebookObj.save();

                var temp = NotebookModel.notebooks.filter(function (item) {
                    return item.id !== notebookObj.id;
                });

                NotebookModel.notebooks = temp;
                callback(null, notebookObj);
            },
            error: function (notebook, error) {
                console.error(arguments);
                callback(error, notebook);
            }
        });


    };


    NotebookModel.checkNotebook = function (notebook) {

        notebook.title = notebook.title || "untitled";
        notebook.alive = notebook.alive || true;
        notebook.numberOfNote = notebook.numberOfNote || 0;

    };

    NotebookModel.getId = function () {
        return this.notebook.id;
    };

    NotebookModel.selectNotebook = function (id) {
        NotebookModel.notebook = util.findById(id, NotebookModel.notebooks);
    };

    NotebookModel.updateNumber = function (num) {
        if (typeof num === "number") {
            NotebookModel.notebook.numberOfNote += num;
        } else if (num === "fix") {
            NotebookModel.notebook.numberOfNote = EssayModel.essays.length;
        }
    };


    var EssayModel = {};

    EssayModel.essay = {
        id: '',
        className: '',
        title: '',
        content: '',
        alive: false
    };

    EssayModel.essays = [];


    /* Loads all catalogues of the notebook from the server.
     *
     *  Calls: callback(error, entries)
     *  error -- the error that occurred or NULL if no error occurred
     *  notebooks -- an array of entries
     */
    EssayModel.loadAll = function (className, callback) {

        className = 'x' + className;
        var Notes = AV.Object.extend(className);
        var NoteCollection = AV.Collection.extend({
            model: Notes,
            query: (new AV.Query(Notes)).equalTo("alive", true)
        });
        var noteCollection = new NoteCollection();

        noteCollection.fetch().then(success, failed);
        function success(collection) {
            EssayModel.essays = [];
            collection.models.forEach(function (item) {
                var essay = {};
                util.cloneEssay(item, essay);
                essay.className = className;
                EssayModel.essays.unshift(essay);
            });
            callback(null, EssayModel.essays);
        }

        function failed() {
            console.error(arguments);
        }

    }

    /* Adds the given essay to the specific notebook. The essay must *not* have
     * an id associated with it.
     *
     *  Calls: callback(error, essay)
     *  error -- the error that occurred or NULL if no error occurred
     *  essay -- the notebook added, with an id attribute
     */
    EssayModel.add = function (className, essay, callback) {

        if ((typeof className) !== "string") {
            console.error("Essay class name is wrong");
            return
        }
        var notebookTitle = 'x' + className;

        EssayModel.checkEssay(essay);

        var Essay = AV.Object.extend(notebookTitle);
        var essayObj = new Essay();
        essayObj.save(essay)
            .done(function (response) {
                var essay = util.cloneEssay(response);
                EssayModel.essays.push(essay);
                callback(null, essay);
            })
            .fail(function (essay, error) {
                // console.log(error);
                console.error(arguments);
                callback(error);
            })
    };

    /* Updates the given entry. The entry must have an id attribute that
     * identifies it.
     *
     * Calls: callback(error)
     *  error -- the error that occurred or NULL if no error occurred
     */
    EssayModel.update = function (essay, callback) {
        // TODO
    }

    /* Removes the given essay. The essay must have an id attribute that
     * identifies it.
     *
     * Calls: callback(error)
     *  error -- the error that occurred or NULL if no error occurred
     */
    EssayModel.remove = function (className, id, callback) {
        // TODO
        console.log(arguments);
        //console.log("The essay " + id + " will be deleted");
        className = 'x' + className;
        var Essay = AV.Object.extend(className);
        var query = new AV.Query(Essay);
        query.get(id, {
            success: function (essay) {
                // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
                essay.set('alive', false);
                essay.save().done(function(){
                    console.log(arguments);
                    var essays = EssayModel.essays.filter(function (item) {
                        return item.id !== id;
                    });
                    EssayModel.essays = essays;
                    callback('success');
                }).failed(function(){
                    console.log(arguments)
                    var essays = EssayModel.essays.filter(function (item) {
                        return item.id !== id;
                    });
                    EssayModel.essays = essays;
                    callback('success');
                });



            },
            error: function (object, error) {
                // 失败了.
                console.error(arguments);
                callback('error', object);
            }
        });

    };

    EssayModel.checkEssay = function (essay) {

        essay.title = essay.title || "untitled";
        essay.alive = essay.alive || true;
        essay.content = essay.content || "This shouldn't be seen. Something wrong happened";

    };

    EssayModel.selectEssay = function (id) {
        EssayModel.essay = util.findById(id, EssayModel.essays);
    };

    window.NotebookModel = NotebookModel;
    window.EssayModel = EssayModel;


})(this, this.document)