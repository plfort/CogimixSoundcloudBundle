<?php
namespace Cogipix\CogimixSoundcloudBundle\Services;
use Cogipix\CogimixBundle\Entity\TrackResult;

use Soundcloud\Exception\InvalidHttpResponseCodeException;
use Cogipix\CogimixBundle\Services\AbstractMusicSearch;

class SoundcloudMusicSearch extends AbstractMusicSearch{

    private $soundCloudApi;
    private $soundCloudQuery;

    public function __construct($soundCloudApi){
        $this->soundCloudApi=$soundCloudApi;
    }

    protected function parseResponse($results){
        $return = array();
        foreach($results as $result){
            if($result['streamable']==true){
               $item = new TrackResult();
               $item->setTag($this->getResultTag());
               $item->setEntryId($result['id']);
               $item->setArtist($result['user']['username']);
               $item->setTitle($result['title']);
               if(isset($result['artwork_url']) && $result['artwork_url']!==null ){
               $item->setThumbnails($result['artwork_url']);
               }else{
                   $item->setThumbnails('bundles/cogimix/images/soundcloud/soundcloud-default.png');
               }
               $return[]=$item;
            }
        }

        return $return;
    }

    protected function buildQuery(){
        $this->soundCloudQuery=array();
          $this->soundCloudQuery['q']=$this->searchQuery->getSongQuery();
       }

    protected function executeQuery(){
        $this->logger->info('Soundcloud executeQuery');
        try{
            $results= $this->soundCloudApi->get('tracks', $this->soundCloudQuery);

            if($results){
                return $this->parseResponse(json_decode($results,true));
            }
        }catch(InvalidHttpResponseCodeException $ex){
            $this->logger->err($ex->getHttpBody());
            return array();
        }
    }

    public function getName(){
        return 'SoundCloud';
    }

    public function getAlias(){
        return 'scservice';
    }

    public function getResultTag(){
        return 'sc';
    }


}

?>