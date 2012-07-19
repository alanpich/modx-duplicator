console.log(this.innerHTML);

MODx.Ajax.request({
	url: MODx.config.assets_url+'components/duplicator/connector.php'
	,params: {
			action: 'point/recreate',
			pointName: this.innerHTML
		}
	,method: 'post'
	,listeners: {
		'success':{fn:function(r) {
			MODx.msg.status({
				title: 'Duplicator'
				,message: 'The Duplicator Point has been recreated'
			});
			Ext.getCmp('modx-resource-tree').refresh()
		},scope:this}
		,'failure':{fn:function(r) {
			MODx.msg.status({
				title: 'Duplicator Point re-creation failed'
				,message: 'The point seems to be corrupt or deleted'
			});
		},scope:this}
	}
});