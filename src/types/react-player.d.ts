declare module 'react-player' {
  import { Component } from 'react'
  
  interface ReactPlayerProps {
    url?: string | string[] | MediaStream
    playing?: boolean
    loop?: boolean
    controls?: boolean
    volume?: number
    muted?: boolean
    playbackRate?: number
    width?: string | number
    height?: string | number
    style?: React.CSSProperties
    progressInterval?: number
    playsinline?: boolean
    pip?: boolean
    onReady?: () => void
    onStart?: () => void
    onPlay?: () => void
    onPause?: () => void
    onBuffer?: () => void
    onBufferEnd?: () => void
    onEnded?: () => void
    onError?: (error: any) => void
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void
    onDuration?: (duration: number) => void
    onSeek?: (seconds: number) => void
  }
  
  class ReactPlayer extends Component<ReactPlayerProps> {}
  
  export default ReactPlayer
}