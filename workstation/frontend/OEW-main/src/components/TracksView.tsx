import { useTracksManager } from "../hooks/useTracksManager";
import { TrackType } from "../types/core";

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
        {tracks.map((track) => (
          <div key={track.id}>
            <h3>{track.name}</h3>
            <div>Type: {track.type}</div>
            <div>Volume: {track.volume}dB</div>
            <div>Pan: {track.pan}</div>
            {track.clips.length > 0 && (
              <div>
                <h4>Clips</h4>
                {track.clips.map((clip) => (
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
