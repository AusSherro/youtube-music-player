export interface NowPlayingMetadata {
  title: string | null
  artist: string | null
  albumArtUrl: string | null
  duration: number // total seconds, 0 if unknown
  progress: number // elapsed seconds, 0 if unknown
  isPlaying: boolean
  shuffleEnabled: boolean
  repeatMode: 'none' | 'one' | 'all'
}

export type PlaybackCommand = 'play-pause' | 'next' | 'previous'
