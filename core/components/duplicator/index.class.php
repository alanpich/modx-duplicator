<?php
require_once dirname(__FILE__) . '/model/duplicator/duplicator.class.php';
abstract class DuplicatorManagerController extends modExtraManagerController {
    public function initialize() {
        $this->duplicator = new duplicator(&$this->modx);
 
        $this->addCss($this->duplicator->config['cssUrl'].'mgr.css');
        $this->addJavascript($this->duplicator->config['jsUrl'].'mgr/duplicator.js');
        $this->addHtml('<script type="text/javascript">
        Ext.onReady(function() {
            Duplicator.config = '.$this->modx->toJSON($this->duplicator->config).';
        });
        </script>');
        return parent::initialize();
    }
    public function getLanguageTopics() {
        return array('duplicator:default');
    }
    public function checkPermissions() { return true;}
}

class IndexManagerController extends DuplicatorManagerController {
    public static function getDefaultController() { return 'mgr/main'; }
}