(function(){
	var NotebookView = {};

	/* Rends the notebook area, show the notebooks , requires the $notebook node
	 * and  notebookData object
	 */
	NotebookView.render = function($notebook, notebookData){
		var notebookTemplate = Handlebars.compile($('#notebook-template').html());
		if($.isArray(notebookData)){
			// 如果是数组，则渲染所有元素
			// console.log('render Notebook: ', notebookData)
			var content = {
				notebooks: notebookData
			};

			if(notebookData){
				$notebook.html(notebookTemplate(content));
			}else{
				$notebook.html(notebookTemplate([]));
			}
		}else{
			// 不是数组，则在结尾添加一个节点
			var newLi = $('#notebookNode-template').html();
			notebookTemplate = Handlebars.compile(newLi);
			if(notebookData.id){
				newLi = notebookTemplate(notebookData);
				if($notebook.find('li').length>0){
					$(newLi).insertBefore($notebook.find('li')[0]);
				}else{
					$notebook.append($(newLi));
				}


			}

		}
	};

	NotebookView.renderItem = function($notebook, notebook){
		NotebookView.render($notebook, notebook);
	};


    NotebookView.update = function($notebookNode, notebookData){
        $notebookNode = $($notebookNode);
        var node = $('#notebookNode-template').html();
        var notebookTemplate = Handlebars.compile(node);

        if(notebookData.id){
            $notebookNode.html($(notebookTemplate(notebookData))[0].innerHTML);
        }
    };

	/* Rends the sidebar area, show the catalogue of one notebook. Requires the 
	 * object representing the catalogue of selected notebook. If this object is 
	 * null, suggets to create essay
	 */
	var CatalogueView = {};
	CatalogueView.render = function($catalogue, catalogueData){
	  // TODO
		var catalogueTemplate;
		if($.isArray(catalogueData)){
			// console.log("rend catalogue start...");

			var content ={
				catalogues: catalogueData
			}

			if(catalogueData.length){
				catalogueTemplate = Handlebars.compile($('#catalogue-template').html());
				$catalogue.html(catalogueTemplate(content));
			}else{
				var context = {
					title: "这儿还没有笔记呢",
					body: "赶紧动手写一篇吧~啦啦啦~啦啦啦~今天气晴朗呀~"
				};
				catalogueTemplate = Handlebars.compile($('#emptyCatalogue-template').html())
				$catalogue.html(catalogueTemplate(context));
			}
		}else{
			console.log('catalogueData is not an Array');

		}
	};

	/* Renders a view to allow the user to create a catalogue. Requires the $catalogues
	 * element and an object representing the active entry. */
	var CreatingCatalogue ={};
	CreatingCatalogue.render = function($catalogue) {
		// TODO
		var catalogueTemplate = Handlebars.compile($('#emptyCatalogue-template').html());
		var context ={
			title: "标题",
			body: "令人虎躯一震的内容"
			};
		$(catalogueTemplate(context)).insertBefore($catalogue.find('.catalogue:first-child'));

	};


	/* Renders an essay into the given $eessay element. Requires the object
	 * representing the active essay (activeEssayData). If this object is null,
	 * picks the first existing essay. If no entry exists, this view will display
	 * the CreatingEssayView. */
	var EssayView ={};
	EssayView.render = function($essay, activeEssay){
        $('.editor').hide();
        $('.content').show();
		var activeEssayData = util.clone(activeEssay);


        var essayTemplate = Handlebars.compile($('#essay-template').html());
        if(activeEssayData.title && activeEssayData.content){
			activeEssayData.content = markdown.toHTML(activeEssayData.content);
            $essay.html(essayTemplate(activeEssayData));
        }

	};

	/* Renders a view to allow the user to create an essay. Requires the $essay
   * element. */
	var CreatingEssayView ={};
	CreatingEssayView.render = function(){
		// TODO

		$('.content').hide();
		$('.editor').show();
		$('.editor').find('input').focus();
	}



	window.NotebookView  = NotebookView;
	window.CatalogueView = CatalogueView;
	window.CreatingCatalogue = CreatingCatalogue;
	window.EssayView     = EssayView;
	window.CreatingEssayView = CreatingEssayView;


    Handlebars.registerHelper('paragraphSplit', function(plaintext) {
        var i, output = '',
            lines = plaintext.split(/\r\n|\r|\n/g);
        for (i = 0; i < lines.length; i++) {
            if(lines[i]) {
                output += '<p>' + lines[i] + '</p>';
            }
        }
        return new Handlebars.SafeString(output);
    });

})(this, this.document);