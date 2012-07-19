Duplicator.panel.Main = function(config) {
    config = config || {};
    Ext.apply(config,{
        border: false
        ,baseCls: 'modx-formpanel'
        ,cls: 'container'
        ,items: [{
            html: '<h2>Duplicator</h2>'
            ,border: false
            ,cls: 'modx-page-header'
        },{
            xtype: 'modx-tabs'
            ,defaults: { border: false ,autoHeight: true }
            ,border: true
            ,items: [{
                title: 'Saved Duplicates'
                ,defaults: { autoHeight: true }
                ,items: [{
                    xtype: 'duplicator-grid-elements'
                    ,cls: 'main-wrapper'
                    ,preventRender: true
                }]
            },{
                title: '+ Add New'
                ,defaults: { autoHeight: true }
                ,items: [{
                    xtype: 'modx-formpanel'
                    ,cls: 'main-wrapper'
                    ,preventRender: true
                }]
            }]
        }]
    });
    Duplicator.panel.Main.superclass.constructor.call(this,config);
};
Ext.extend(Duplicator.panel.Main,MODx.Panel);
Ext.reg('duplicator-panel-main',Duplicator.panel.Main);