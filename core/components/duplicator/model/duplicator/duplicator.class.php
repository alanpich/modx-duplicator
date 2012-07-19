<?php class duplicator {
	public $modx;
	public $config = array();
	
    function __construct(modX &$modx,array $config = array()) {
        $this->modx =& $modx;
 
        $basePath = $this->modx->getOption('duplicator.core_path',$config,$this->modx->getOption('core_path').'components/duplicator/');
        $assetsUrl = $this->modx->getOption('duplicator.assets_url',$config,$this->modx->getOption('assets_url').'components/duplicator/');
        $this->config = array_merge(array(
            'basePath' => $basePath,
            'corePath' => $basePath,
            'modelPath' => $basePath.'model/',
            'processorsPath' => $basePath.'processors/',
            'templatesPath' => $basePath.'elements/templates/',
            'chunksPath' => $basePath.'elements/chunks/',
            'jsUrl' => $assetsUrl.'js/',
            'cssUrl' => $assetsUrl.'css/',
            'assetsUrl' => $assetsUrl,
            'connectorUrl' => $assetsUrl.'connector.php',
        ),$config);
		
        $this->modx->addPackage('duplicator',$this->config['modelPath']);
    }
	
};// end class duplicator