/**
 * Overrides native resource tree to provide extra context menu function
 * 
 * @class MODx.tree.Resource
 * @extends MODx.tree.Tree
 * @param {Object} config An object of options.
 * @xtype modx-tree-resource
 */
MODx.tree.Resource = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        url: MODx.config.connectors_url+'resource/index.php'
        ,title: ''
        ,rootVisible: false
        ,expandFirst: true
        ,enableDD: !Ext.isEmpty(MODx.config.enable_dragdrop) ? true : false
        ,ddGroup: 'modx-treedrop-dd'
        ,remoteToolbar: true
        ,sortBy: this.getDefaultSortBy(config)
        ,tbarCfg: {
            id: config.id ? config.id+'-tbar' : 'modx-tree-resource-tbar'
        }
        ,baseParams: {
            action: 'getNodes'
            ,sortBy: this.getDefaultSortBy(config)
            ,currentResource: MODx.request.id || 0
            ,currentAction: MODx.request.a || 0
        }
    });
    MODx.tree.Resource.superclass.constructor.call(this,config);
    this.on('render',function() {
        var el = Ext.get('modx-resource-tree');
        el.createChild({tag: 'div', id: 'modx-resource-tree_tb'});
        el.createChild({tag: 'div', id: 'modx-resource-tree_filter'});
    },this);
    this.addEvents('loadCreateMenus');
    this.on('afterSort',this._handleAfterDrop,this);
    this.addSearchToolbar();
};
Ext.extend(MODx.tree.Resource,MODx.tree.Tree,{
    forms: {}
    ,windows: {}
    ,stores: {}

    ,_initExpand: function() {
        var treeState = Ext.state.Manager.get(this.treestate_id);
        if ((Ext.isString(treeState) || Ext.isEmpty(treeState)) && this.root) {
            if (this.root) {this.root.expand();}
            var wn = this.getNodeById('web_0');
            if (wn && this.config.expandFirst) {
                wn.select();
                wn.expand();
            }
        } else {
            for (var i=0;i<treeState.length;i++) {
                this.expandPath(treeState[i]);
            }
        }
    }

    ,addSearchToolbar: function() {
        var t = Ext.get(this.config.id+'-tbar');
        var fbd = t.createChild({tag: 'div' ,cls: 'modx-formpanel' ,autoHeight: true, id: 'modx-resource-searchbar'});
        var tb = new Ext.Toolbar({
            applyTo: fbd
            ,autoHeight: true
            ,width: '100%'
        });
        var tf = new Ext.form.TextField({
            name: 'search'
            ,value: ''
			,ctCls: 'modx-leftbar-second-tb'
            ,width: Ext.getCmp('modx-resource-tree').getWidth() - 12
            ,emptyText: _('search_ellipsis')
            ,listeners: {
                'change': {fn: this.search,scope:this}
                ,'render': {fn: function(cmp) {
                    new Ext.KeyMap(cmp.getEl(), {
                        key: Ext.EventObject.ENTER
                        ,fn: function() {
                            this.fireEvent('change',this.getValue());
                            this.blur();
                            return true;}
                        ,scope: cmp
                    });
                },scope:this}
            }
        });
        tb.add(tf);
        tb.doLayout();
        this.searchBar = tb;
    }

    ,search: function(nv) {
        Ext.state.Manager.set(this.treestate_id+'-search',nv);
        this.config.search = nv;
        this.getLoader().baseParams = {
            action: this.config.action
            ,search: this.config.search
        };
        this.refresh();
    }

    /**
     * Shows the current context menu.
     * @param {Ext.tree.TreeNode} n The current node
     * @param {Ext.EventObject} e The event object run.
     */
    ,_showContextMenu: function(n,e) {
        n.select();
        this.cm.activeNode = n;
        this.cm.removeAll();
        if (n.attributes.menu && n.attributes.menu.items) {
            this.addContextMenuItem(n.attributes.menu.items);
            this.cm.show(n.getUI().getEl(),'t?');
        } else {
            var m = [];
            switch (n.attributes.type) {
                case 'modResource':
                case 'modDocument':
                    m = this._getModResourceMenu(n);
                    break;
                case 'modContext':
                    m = this._getModContextMenu(n);
                    break;
            }
            
            this.addContextMenuItem(m);
            this.cm.showAt(e.xy);
        }
        e.stopEvent();
    }

    ,duplicateResource: function(item,e) {
        var node = this.cm.activeNode;
        var id = node.id.split('_');id = id[1];

        var r = {
            resource: id
            ,is_folder: node.getUI().hasClass('folder')
        };
        var w = MODx.load({
            xtype: 'modx-window-resource-duplicate'
            ,resource: id
            ,hasChildren: node.attributes.hasChildren
            ,listeners: {
                'success': {fn:function() {this.refreshNode(node.id);},scope:this}
            }
        });
        w.config.hasChildren = node.attributes.hasChildren;
        w.setValues(r);
        w.show(e.target);
    }

    ,duplicateContext: function(itm,e) {
        var node = this.cm.activeNode;
        var key = node.attributes.pk;
        
        var r = { 
            key: key
            ,newkey: ''
        };
        if (!this.windows.duplicateContext) {
            this.windows.duplicateContext = MODx.load({
                xtype: 'modx-window-context-duplicate'
                ,record: r
                ,listeners: {
                    'success': {fn:function() {this.refresh();},scope:this}
                }
            });
        }
        this.windows.duplicateContext.setValues(r);
        this.windows.duplicateContext.show(e.target);
    }
    ,removeContext: function(itm,e) {
        var node = this.cm.activeNode;
        var key = node.attributes.pk;
        MODx.msg.confirm({
            title: _('context_remove')
            ,text: _('context_remove_confirm')
            ,url: MODx.config.connectors_url+'context/index.php'
            ,params: {
                action: 'remove'
                ,key: key
            }
            ,listeners: {
                'success': {fn:function() {this.refresh();},scope:this}
            }
        });
    }
    	
    ,preview: function() {
        window.open(this.cm.activeNode.attributes.preview_url);
    }
    
    ,deleteDocument: function(itm,e) {
        var node = this.cm.activeNode;
        var id = node.id.split('_');id = id[1];
        MODx.msg.confirm({
            title: _('resource_delete')
            ,text: _('resource_delete_confirm')
            ,url: MODx.config.connectors_url+'resource/index.php'
            ,params: {
                action: 'delete'
                ,id: id
            }
            ,listeners: {
                'success': {fn:function() {
                    var n = this.cm.activeNode;
                    var ui = n.getUI();
                    
                    ui.addClass('deleted');
                    n.cascade(function(nd) {
                        nd.getUI().addClass('deleted');
                    },this);
                    Ext.get(ui.getEl()).frame();
                },scope:this}
            }
        });
    }

    ,undeleteDocument: function(itm,e) {
        var node = this.cm.activeNode;
        var id = node.id.split('_');id = id[1];
        MODx.Ajax.request({
            url: MODx.config.connectors_url+'resource/index.php'
            ,params: {
                action: 'undelete'
                ,id: id
            }
            ,listeners: {
                'success': {fn:function() {
                    var n = this.cm.activeNode;
                    var ui = n.getUI();

                    ui.removeClass('deleted');
                    n.cascade(function(nd) {
                        nd.getUI().removeClass('deleted');
                    },this);
                    Ext.get(ui.getEl()).frame();
                },scope:this}
            }
        });
    }

    ,publishDocument: function(itm,e) {
        var node = this.cm.activeNode;
        var id = node.id.split('_');id = id[1];
        MODx.msg.confirm({
            title: _('resource_publish')
            ,text: _('resource_publish_confirm')
            ,url: MODx.config.connectors_url+'resource/index.php'
            ,params: {
                action: 'publish'
                ,id: id
            }
            ,listeners: {
                'success': {fn:function() {
                    var ui = this.cm.activeNode.getUI();
                    ui.removeClass('unpublished');
                    Ext.get(ui.getEl()).frame();
                },scope:this}
            }
        });
    }

    ,unpublishDocument: function(itm,e) {
        var node = this.cm.activeNode;
        var id = node.id.split('_');id = id[1];
        MODx.msg.confirm({
            title: _('resource_unpublish')
            ,text: _('resource_unpublish_confirm')
            ,url: MODx.config.connectors_url+'resource/index.php'
            ,params: {
                action: 'unpublish'
                ,id: id
            }
            ,listeners: {
                'success': {fn:function() {
                    var ui = this.cm.activeNode.getUI();
                    ui.addClass('unpublished');
                    Ext.get(ui.getEl()).frame();
                },scope:this}
            }
        });
    }

    ,emptyRecycleBin: function() {
        MODx.msg.confirm({
            title: _('empty_recycle_bin')
            ,text: _('empty_recycle_bin_confirm')
            ,url: MODx.config.connectors_url+'resource/index.php'
            ,params: {
                action: 'emptyRecycleBin'
            }
            ,listeners: {
                'success':{fn:function() {
                    Ext.select('div.deleted',this.getRootNode()).remove();
                    MODx.msg.status({
                        title: _('success')
                        ,message: _('empty_recycle_bin_emptied')
                    })
                },scope:this}
            }
        });
    }

    ,showFilter: function(itm,e) {
        if (this._filterVisible) {return false;}

        var t = Ext.get(this.config.id+'-tbar');
        var fbd = t.createChild({tag: 'div' ,cls: 'modx-formpanel' ,autoHeight: true});
        var tb = new Ext.Toolbar({
            applyTo: fbd
            ,autoHeight: true
            ,width: '100%'
        });
        var cb = new Ext.form.ComboBox({
            store: new Ext.data.SimpleStore({
                fields: ['name','value']
                ,data: [
                    [_('menu_order'),'menuindex']
                    ,[_('page_title'),'pagetitle']
                    ,[_('publish_date'),'pub_date']
                    ,[_('unpublish_date'),'unpub_date']
                    ,[_('createdon'),'createdon']
                    ,[_('editedon'),'editedon']
                    ,[_('publishedon'),'publishedon']
                    ,[_('alias'),'alias']
                ]
            })
            ,displayField: 'name'
            ,valueField: 'value'
            ,forceSelection: false
            ,editable: true
            ,mode: 'local'
            ,id: 'modx-resource-tree-sortby'
            ,triggerAction: 'all'
            ,selectOnFocus: false
            ,width: 100
            ,value: this.getDefaultSortBy(this.config)
            ,listeners: {
                'select': {fn:this.filterSort,scope:this}
                ,'change': {fn:this.filterSort,scope:this}
            }
        });
        tb.add(_('sort_by')+':');
        tb.addField(cb);
        tb.add('-',{
            scope: this
            ,cls: 'x-btn-text'
            ,text: _('close')
            ,handler: this.hideFilter
        });
        tb.doLayout();
        this.filterBar = tb;
        this._filterVisible = true;
        return true;
    }
    ,getDefaultSortBy: function(config) {
        var v = 'menuindex';
        if (!Ext.isEmpty(config) && !Ext.isEmpty(config.sortBy)) {
            v = config.sortBy;
        } else {
            var d = Ext.state.Manager.get(this.treestate_id+'-sort-default');
            if (d != MODx.config.tree_default_sort) {
                v = MODx.config.tree_default_sort;
                Ext.state.Manager.set(this.treestate_id+'-sort-default',v);
                Ext.state.Manager.set(this.treestate_id+'-sort',v);
            } else {
                v = Ext.state.Manager.get(this.treestate_id+'-sort') || MODx.config.tree_default_sort;
            }
        }
        return v;
    }

    ,filterSort: function(cb,r,i) {
        Ext.state.Manager.set(this.treestate_id+'-sort',cb.getValue());
        this.config.sortBy = cb.getValue();
        this.getLoader().baseParams = {
            action: this.config.action
            ,sortBy: this.config.sortBy
        };
        this.refresh();
    }

    ,hideFilter: function(itm,e) {
        this.filterBar.destroy();
        this._filterVisible = false;
    }
    ,_handleAfterDrop: function(o,r) {
        var targetNode = o.event.target;
        if (o.event.point == 'append' && targetNode) {
            var ui = targetNode.getUI();
            ui.addClass('haschildren');
            ui.removeClass('icon-resource');
        }
    }

    ,_handleDrop:  function(e){
        var dropNode = e.dropNode;
        var targetParent = e.target;
        
        if (targetParent.findChild('id',dropNode.attributes.id) !== null) {return false;}
        
        if (dropNode.attributes.type == 'modContext' && (targetParent.getDepth() > 1 || (targetParent.attributes.id == targetParent.attributes.pk + '_0' && e.point == 'append'))) {
        	return false;
        }
        
        if (dropNode.attributes.type !== 'modContext' && targetParent.getDepth() <= 1 && e.point !== 'append') {
        	return false;
        }
        if (targetParent.attributes.hide_children_in_tree) { return false; }
        
        return dropNode.attributes.text != 'root' && dropNode.attributes.text !== '' 
            && targetParent.attributes.text != 'root' && targetParent.attributes.text !== '';
    }

    ,getContextSettingForNode: function(node,ctx,setting,dv) {
        var val = dv || null;
        if (node.attributes.type != 'modContext') {
            var t = node.getOwnerTree();
            var rn = t.getRootNode();
            var cn = rn.findChild('ctx',ctx,false);
            if (cn) {
                val = cn.attributes.settings[setting];
            }
        } else {
            val = node.attributes.settings[setting];
        }
        return val;
    }
    
    

    ,_getModContextMenu: function(n) {
        var a = n.attributes;
        var ui = n.getUI();
        var m = [];

        m.push({
            text: '<b>'+a.text+'</b>'
            ,handler: function() {return false;}
            ,header: true
        });
        m.push('-');
        if (ui.hasClass('pedit')) {
            m.push({
                text: _('edit_context')
                ,handler: function() {
                    var at = this.cm.activeNode.attributes;
                    this.loadAction('a=context/update&key='+at.pk);
                }
            });
        }
        m.push({
            text: _('context_refresh')
            ,handler: function() {
                this.refreshNode(this.cm.activeNode.id,true);
            }
        });
        if (ui.hasClass('pnewdoc')) {
            m.push('-');
            this._getCreateMenus(m,'0',ui);
        }
        if (ui.hasClass('pnew')) {
            m.push({
                text: _('context_duplicate')
                ,handler: this.duplicateContext
            });
        }
        if (ui.hasClass('pdelete')) {
            m.push('-');
            m.push({
                text: _('context_remove')
                ,handler: this.removeContext
            });
        }
        return m;
    }

    ,overviewResource: function() {this.loadAction('a=resource/data')}
    ,quickUpdateResource: function(itm,e) {
        Ext.getCmp("modx-resource-tree").quickUpdate(itm,e,itm.classKey);
    }
    ,editResource: function() {this.loadAction('a=resource/update');}

    ,_getModResourceMenu: function(n) {
        var a = n.attributes;
        var ui = n.getUI();
        var m = [];
		/*DUPLICATOR - add context option */
		m.push({
            text: 'Create Duplicator point'
            ,handler: function() {
					var node = this.cm.activeNode;
					var id = node.id.split('_');id = id[1];
					Duplicator.createPoint(node,id);
				}
            ,header: true
		});
		
		
        return m;
    }
	
    ,refreshResource: function() {
        this.refreshNode(this.cm.activeNode.id);
    }

    ,createResourceHere: function(itm) {
        var at = this.cm.activeNode.attributes;
        var p = itm.usePk ? itm.usePk : at.pk;
        Ext.getCmp('modx-resource-tree').loadAction(
            'a=resource/create&class_key=' + itm.classKey + '&parent=' + p + (at.ctx ? '&context_key='+at.ctx : '')
        );
    }
    ,createResource: function(itm,e) {
        var at = this.cm.activeNode.attributes;
        var p = itm.usePk ? itm.usePk : at.pk;
        Ext.getCmp('modx-resource-tree').quickCreate(itm,e,itm.classKey,at.ctx,p);
    }

    ,_getCreateMenus: function(m,pk,ui) {
        var types = MODx.config.resource_classes;
        var o = this.fireEvent('loadCreateMenus',types);
        if (Ext.isObject(o)) {
            Ext.apply(types,o);
        }
        var coreTypes = ['modDocument','modWebLink','modSymLink','modStaticResource'];
        var ct = [];
        var qct = [];
        for (var k in types) {
            if (coreTypes.indexOf(k) != -1) {
                if (!ui.hasClass('pnew_'+k)) {
                    continue;
                }
            }
            ct.push({
                text: types[k]['text_create_here']
                ,classKey: k
                ,usePk: pk ? pk : false
                ,handler: this.createResourceHere
                ,scope: this
            });
            if (ui && ui.hasClass('pqcreate')) {
                qct.push({
                    text: types[k]['text_create']
                    ,classKey: k
                    ,handler: this.createResource
                    ,scope: this
                });
            }
        }
        m.push({
            text: _('create')
            ,handler: Ext.emptyFn
            ,menu: {items: ct}
        });
        if (ui && ui.hasClass('pqcreate')) {
            m.push({
               text: _('quick_create')
               ,handler: Ext.emptyFn
               ,menu: {items: qct}
            });
        }
        return m;
    }
});
Ext.reg('modx-tree-resource',MODx.tree.Resource);