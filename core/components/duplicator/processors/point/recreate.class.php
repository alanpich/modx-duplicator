<?php class DuplicatorPointRecreateProcessor extends modProcessor {
    public $classKey = 'DuplicatorElements';
    public $languageTopics = array('duplicator:default');
    public $objectType = 'duplicator.point';
 
    public function process() {
		
		$pointName = $this->getProperty('pointName');
		
		$point = $this->modx->getObject('DuplicatorElements',array(
			'name' => $pointName
		));
		
		if(! $point instanceof DuplicatorElements ){
			die('FAIL');
			return $this->failure('Point does not exist');
			return false;
		};
		
		$data = $point->toArray();
		$resources = json_decode($data['json']);
		
		
		// Create root element]
		$this->createResource($resources);
		
		
        $resId = (int) $this->getProperty('id');

		return $this->success('Duplicator Point created');
	}//
	
	
	
	private function createResource($resource,$parent = 0){
		$resInfo = $resource;
		$children = $resource->children;
		unset($resInfo->children);
		
		$res = $this->modx->newObject('modResource');
		$res->fromArray($resInfo);
		$res->set('parent',$parent);
		$res->save();
		$thisID = $res->get('id');
		
		foreach($children as $child){
			$this->createResource($child,$thisID);
		};
		
	}//
	
};// end class
return 'DuplicatorPointRecreateProcessor';