<?php
namespace Cogipix\CogimixSoundcloudBundle\Services;
use Cogipix\CogimixSoundcloudBundle\Entity\SoundcloudResult;

use Cogipix\CogimixCommonBundle\Entity\TrackResult;

use Cogipix\CogimixCommonBundle\ResultBuilder\ResultBuilderInterface;
class ResultBuilder implements ResultBuilderInterface
{

    private $defaultThumbnails = '/bundles/cogimixsoundcloud/images/soundcloud-default.png';
    public function createFromSoundcloudTrack($soundcloudTrack)
    {
        $item =null;
        if(!empty($soundcloudTrack) && isset($soundcloudTrack['streamable']) && $soundcloudTrack['streamable']==true){
            $item = new SoundcloudResult();
           
            $item->setEntryId($soundcloudTrack['id']);
            $item->setArtist($soundcloudTrack['user']['username']);
            $item->setTitle($soundcloudTrack['title']);
            $item->setUrl($soundcloudTrack['stream_url']);
            if(isset($soundcloudTrack['artwork_url']) && $soundcloudTrack['artwork_url']!==null ){
                $item->setThumbnails($soundcloudTrack['artwork_url']);
            }else{
                $item->setThumbnails($this->defaultThumbnails);
            }

            $item->setTag($this->getResultTag());
            $item->setIcon($this->getDefaultIcon());
            $item->setDuration(round($soundcloudTrack['duration']/1000));

        }
        return $item;
    }

    public function createArrayFromSoundcloudTracks($soundcloudTracks)
    {
        $tracks =array();
        if(!empty($soundcloudTracks)){
            foreach($soundcloudTracks as $soundcloudTrack){
                $item = $this->createFromSoundcloudTrack($soundcloudTrack);
                if($item !==null){
                    $tracks[]=$item;
                }
            }
        }
        return $tracks;
    }


    public function getResultTag(){
        return 'sc';
    }

    public function getDefaultIcon(){
        return '/bundles/cogimixsoundcloud/images/sc-icon.png';
    }

}
