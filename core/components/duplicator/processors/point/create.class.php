<?php class DuplicatorPointCreateProcessor extends modObjectCreateProcessor {
    public $classKey = 'DuplicatorElements';
    public $languageTopics = array('duplicator:default');
    public $objectType = 'duplicator.point';
 
    public function process() {
		
        $resId = (int) $this->getProperty('id');
		
		if(is_nan($resId) || $resId == 0){
			$this->failure('Invalid Resource Id');
			return false;
		};
		
		// Sanitize name
		$name = $this->getProperty('name')? $this->getProperty('name') : 'Not Named';
		
		
		// Grab base resource
		$baseResource = $this->modx->getObject('modResource',$resId);
		if(! $baseResource instanceOf modResource ){
			$this->failure('Invalid Resource Id');
			return false;
		};
		
		// Create json of tree
		$point = new DuplicatorPointObject(&$this->modx,$resId);
		$json = json_encode($point);
		
		
		// Create new DuplicatorPoint
		$DuplicatorPoint = new duplicatorElements(&$this->modx);
		$DuplicatorPoint->set('json',$json);
		$DuplicatorPoint->set('name',$name);
		$DuplicatorPoint->save();
		
		
		// Create menu item
		$MenuEntry = $this->modx->newObject('modMenu');
		$MenuEntry->fromArray(array(
			'text' => $name,
			'parent' => 'duplicator.menuEntry',
			'menuindex' => 0,
			'params' => '',
			'handler' => file_get_contents(dirname(__FILE__).'/recreate.js')
		),'',true,true);
		$MenuEntry->save();

		return $this->success('Duplicator Point created');
	}//
	
};// end class



class DuplicatorPointObject {
	
function __construct($modx,$resId){
		$res = $modx->getObject('modResource',$resId);
		$params = $res->toArray();
		
		
		$toCopy = array(
			'type','contentType','published','isFolder','richtext','template','menuindex','pagetitle',
			'searchable','cacheable','content_dispo','hidemenu','class_key','content_type'
		);
		
		foreach($toCopy as $key){
			if(isset($params[$key])){
				$this->$key = $params[$key];
			};
		};
		
		$this->pagetitle = '_'.$this->pagetitle;
		
		$this->children = array();
		
		$children = $res->getMany('Children');
		foreach($children as $child){
			$childId = $child->get('id');
			$this->children[] = new DuplicatorPointObject($modx,$childId);
		};
		
	}//
	
	
};// end class DuplicatorPoint


return 'DuplicatorPointCreateProcessor';