Duplicator.grid.Elements = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        id: 'duplicator-grid-elements'
        ,url: Duplicator.config.connectorUrl
        ,baseParams: { action: 'mgr/duplicatorelement/getList' }
        ,fields: ['id','name','data']
        ,paging: true
        ,remoteSort: true
        ,anchor: '97%'
        ,autoExpandColumn: 'name'
        ,columns: [{
            header: _('id')
            ,dataIndex: 'id'
            ,sortable: true
            ,width: 60
        },{
            header: 'Name'
            ,dataIndex: 'name'
            ,sortable: true
            ,width: 100
            ,editor: { xtype: 'textfield' }
        },{
            header: _('duplicator.description')
            ,dataIndex: 'description'
            ,sortable: false
            ,width: 350
            ,editor: { xtype: 'textfield' }
        }]
    });
    Duplicator.grid.Elements.superclass.constructor.call(this,config)
};
Ext.extend(Duplicator.grid.Elements,MODx.grid.Grid);
Ext.reg('duplicator-grid-elements',Duplicator.grid.Elements);