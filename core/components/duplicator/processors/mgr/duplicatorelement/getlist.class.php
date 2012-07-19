<?php
class DuplicatorElementGetListProcessor extends modObjectGetListProcessor {
    public $classKey = 'DuplicatorElements';
    public $languageTopics = array('duplicator:default');
    public $defaultSortField = 'name';
    public $defaultSortDirection = 'ASC';
    public $objectType = 'duplicator.duplicatorelement';
}
return 'DuplicatorElementGetListProcessor';