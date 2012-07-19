Ext.onReady(function() {
    MODx.load({ xtype: 'duplicator-page-home'});
});
 
Duplicator.page.Home = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        components: [{
            xtype: 'duplicator-panel-main'
            ,renderTo: 'duplicator-panel-main-div'
        }]
    });
    Duplicator.page.Home.superclass.constructor.call(this,config);
};
Ext.extend(Duplicator.page.Home,MODx.Component);
Ext.reg('duplicator-page-home',Duplicator.page.Home);