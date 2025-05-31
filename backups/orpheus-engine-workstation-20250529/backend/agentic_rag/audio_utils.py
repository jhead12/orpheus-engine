def sanitize_filename(name):
    return re.sub(r'[\\\\/*?:\"<>|]', "_", name).strip()

def save_audio_segments(audio_path, segments, query, output_base="audio_clips"):
    """
    Save relevant audio segments as separate files.
    """
    folder_name = sanitize_filename(query)
    output_dir = os.path.join(output_base, folder_name)
    os.makedirs(output_dir, exist_ok=True)
    waveform, sr = torchaudio.load(audio_path)
    for seg in segments:
        start_sample = int(seg['start'] * sr)
        end_sample = int(seg['end'] * sr)
        clip_waveform = waveform[:, start_sample:end_sample]
        out_path = os.path.join(output_dir, f"segment_{seg['id']}_{int(seg['start'])}-{int(seg['end'])}.wav")
        torchaudio.save(out_path, clip_waveform, sr)
        print(f"Saved: {out_path}")