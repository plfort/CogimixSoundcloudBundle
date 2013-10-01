<?php
namespace Cogipix\CogimixSoundcloudBundle\Services;

use Cogipix\CogimixCommonBundle\Entity\TrackResult;
use Soundcloud\Exception\InvalidHttpResponseCodeException;
use Cogipix\CogimixCommonBundle\MusicSearch\AbstractMusicSearch;

class SoundcloudMusicSearch extends AbstractMusicSearch{

    private $soundCloudApi;
    private $soundCloudQuery;
    private $resultBuilder;
    public function __construct($soundCloudApi,$resultBuilder){
        $this->soundCloudApi=$soundCloudApi;
        $this->resultBuilder=$resultBuilder;
    }

    protected function parseResponse($results){

        return $this->resultBuilder->createArrayFromSoundcloudTracks($results);

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

    protected function executePopularQuery(){
        $this->soundCloudQuery=array();
        $this->soundCloudQuery['filter']='streamable';
        $this->soundCloudQuery['order']='hotness';
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

    public function getDefaultIcon(){
        return '/bundles/cogimixsoundcloud/images/sc-icon.png';
    }

    public function getResultTag(){
        return 'sc';
    }


}

?>