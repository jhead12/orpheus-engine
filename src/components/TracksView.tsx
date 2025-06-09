import { useTracksManager } from "../hooks/useTracksManager";
import { TrackType, Track, Clip } from "../types/core";

export function TracksView() {
  const { tracks, loading, error, addNewTrack } = useTracksManager();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleAddTrack = () => {
    addNewTrack("New Track", TrackType.Audio);
  };

  return (
    <div>
      <button onClick={handleAddTrack}>Add Track</button>
      <div>
        {tracks.map((track: Track) => (
          <div key={track.id}>
            <h3>{track.name}</h3>
            <div>Type: {track.type}</div>
            <div>Volume: {typeof track.volume === 'number' ? track.volume : track.volume.value}dB</div>
            <div>Pan: {typeof track.pan === 'number' ? track.pan : track.pan.value}</div>
            {track.clips.length > 0 && (
              <div>
                <h4>Clips</h4>
                {track.clips.map((clip: Clip) => (
                  <div key={clip.id}>{clip.name}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
