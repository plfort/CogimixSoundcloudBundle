<?php
namespace Cogipix\CogimixSoundcloudBundle\Services;

use Soundcloud\Service;

use Cogipix\CogimixCommonBundle\Model\ParsedUrl;

use Cogipix\CogimixCommonBundle\MusicSearch\UrlSearcherInterface;

class SoundcloudUrlSearch implements UrlSearcherInterface
{
    private $regexHost = '#^(?:www\.)?(?:soundcloud\.com|w\.soundcloud\.com|player\.soundcloud\.com)#';
    private $resultBuilder;
    private $soundcloudApi;

    public function __construct(ResultBuilder $resultBuilder,Service $soundcloudApi){
        $this->resultBuilder = $resultBuilder;
        $this->soundcloudApi = $soundcloudApi;
    }

    public function canParse($host)
    {

        preg_match($this->regexHost, $host,$matches);

       return isset($matches[0]) ? $matches[0] : false;

    }


    public function searchByUrl(ParsedUrl $url)
    {

        if( ($match = $this->canParse($url->host)) !== false){

            if($match == 'w.soundcloud.com' || $match =='player.soundcloud.com'){
                if(isset($url->query['url'])){
                    $soundcloudUrl = new ParsedUrl($url->query['url']);

                    if(in_array('playlists',$soundcloudUrl->path)){
                        $playlistTracksJson= $this->soundcloudApi->get('playlists/'.end($soundcloudUrl->path).'/tracks');
                        $playlistTracks=json_decode($playlistTracksJson,true);
                        return $this->resultBuilder->createArrayFromSoundcloudTracks($playlistTracks);
                    }
                    if(in_array('tracks',$soundcloudUrl->path)){

                        $playlistTrackJson= $this->soundcloudApi->get($soundcloudUrl->url);

                        $playlistTrack=json_decode($playlistTrackJson,true);

                        return $this->resultBuilder->createFromSoundcloudTrack($playlistTrack);
                    }
                }
            }else{

                $response=$this->soundcloudApi->get('https://api.soundcloud.com/resolve.json',array('url'=>$url->url),array(CURLOPT_FOLLOWLOCATION=>true));
                $result = json_decode($response,true);
               if(isset($result['kind']) ){
                   if($result['kind'] == 'track'){
                       return  $this->resultBuilder->createFromSoundcloudTrack($result);
                   }

                   if($result['kind']=='user'){
                      $userTracksJson= $this->soundcloudApi->get('users/'.$result['id'].'/tracks');
                      $userTracks=json_decode($userTracksJson,true);
                      return $this->resultBuilder->createArrayFromSoundcloudTracks($userTracks);
                   }

                   /*if($result['kind'] == 'group'){
                       $groupTracksJson= $this->soundcloudApi->get('users/'.$result['id'].'/tracks');
                       $groupTracks=json_decode($groupTracksJson,true);
                       return $this->resultBuilder->createArrayFromSoundcloudTracks($groupTracks);
                   }*/

               }
            }
        }else{
            return null;
        }
        return null;

    }

}
