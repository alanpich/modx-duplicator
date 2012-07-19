Duplicator = {
	page: {}
	,grid: {}
	,panel: {}
	,connectorURL: MODx.config.assets_url+'components/duplicator/connector.php'
	
	
	,createPoint: function(menuItem, resID){
		
		console.log(this.connectorURL);
		
		Ext.Msg.prompt('New Duplicator Point','Please enter a name for your new Duplicator Point',function(e,name){
				console.log(arguments);
				if (e == 'ok') {
					MODx.Ajax.request({
						url: Duplicator.connectorURL
						,params: {
                				action: 'point/create',
								id: resID,
								name: name
							}
						,method: 'post'
						,scope: Duplicator
						,listeners: {
							'success':{fn:function(r) {
								MODx.msg.status({
									title: 'Duplicator Point created'
									,message: 'This subtree can now be duplicated from the Components menu'
								});
								document.location.reload();
							},scope:this}
							,'failure':{fn:function(r) {
								MODx.msg.status({
									title: 'Duplicator'
									,message: 'Point creation failed :('
								});
							},scope:this}
						}
					});
					console.log('connector request sent');
				} else {
					console.log('Cancelled');
				};			
			},this);
			
		return;
			
        MODx.msg.confirm({
            title: 'Create Duplicator Point'
            ,text: 'Do you want to create a Duplicator point from this resource?'
            ,url: Duplicator.connectorURL
            ,params: {
                action: 'point/create'
                ,id: resID
            }
            ,listeners: {
                'success': {fn:function() {
					MODx.msg.status({
						title: 'Duplicator Point created'
						,message: 'This subtree can now be duplicated from the Components menu'
					});
                },scope:this}
				,'failure': {fn:function() {
					MODx.msg.status({
						title: 'Duplicator'
						,message: 'Point creation failed :('
					});
                },scope:this}

            }
        });
	}
};