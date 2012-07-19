<?php class DuplicatorMgrMainManagerController extends DuplicatorManagerController {
	
	
    public function process(array $scriptProperties = array()) {
		
	}//
    public function getPageTitle() { return $this->modx->lexicon('doodles'); }
    public function loadCustomCssJs() {
        $this->addJavascript($this->duplicator->config['jsUrl'].'mgr/widgets/main.panel.js');
        $this->addJavascript($this->duplicator->config['jsUrl'].'mgr/widgets/duplicator.grid.js');
        $this->addJavascript($this->duplicator->config['jsUrl'].'mgr/widgets/modx.tree.resource.js');
        $this->addLastJavascript($this->duplicator->config['jsUrl'].'mgr/sections/index.js');
    }
    public function getTemplateFile() { return $this->duplicator->config['templatesPath'].'main.tpl'; }
	
};// end class DuplicatorMgrMainManagerController