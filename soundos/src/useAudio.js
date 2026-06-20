import { useState, useRef, useEffect, useCallback } from 'react'

export function useAudio() {
  const audioRef = useRef(new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)

  useEffect(() => {
    const audio = audioRef.current
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      setQueueIndex(prev => {
        const next = prev + 1
        if (next < queue.length) return next
        setIsPlaying(false)
        return prev
      })
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [queue])

  useEffect(() => {
    if (queueIndex >= 0 && queueIndex < queue.length) {
      const track = queue[queueIndex]
      setCurrentTrack(track)
      const audio = audioRef.current
      if (audio.src) URL.revokeObjectURL(audio.src)
      const url = URL.createObjectURL(track.blob)
      audio.src = url
      audio.play().catch(() => {})

      // MediaSession: lock screen widget + cover art
      if ('mediaSession' in navigator) {
        const artwork = track.cover
          ? [{ src: track.cover, sizes: '512x512', type: track.cover.startsWith('data:image/png') ? 'image/png' : 'image/jpeg' }]
          : []
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title || 'Unknown',
          artist: track.artist || 'Unknown Artist',
          album: track.album || '',
          artwork,
        })
      }
    }
  }, [queueIndex, queue])

  // MediaSession action handlers (registered once)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    ms.setActionHandler('play', () => audioRef.current.play().catch(() => {}))
    ms.setActionHandler('pause', () => audioRef.current.pause())
    ms.setActionHandler('previoustrack', () => setQueueIndex(i => Math.max(i - 1, 0)))
    ms.setActionHandler('nexttrack', () => setQueueIndex(i => {
      const next = i + 1
      return next < queue.length ? next : i
    }))
    ms.setActionHandler('seekto', (d) => {
      if (d.seekTime != null && audioRef.current.duration)
        audioRef.current.currentTime = d.seekTime
    })
    return () => {
      ['play','pause','previoustrack','nexttrack','seekto'].forEach(a => {
        try { ms.setActionHandler(a, null) } catch {}
      })
    }
  }, [queue.length])

  const playQueue = useCallback((tracks, startIndex = 0) => {
    setQueue(tracks)
    setQueueIndex(startIndex)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (audio.paused) {
      // iOS suspends audio after backgrounding — re-set src if needed
      if (!audio.src && queue[queueIndex]) {
        const url = URL.createObjectURL(queue[queueIndex].blob)
        audio.src = url
      }
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [queue, queueIndex])

  const next = useCallback(() => {
    setQueueIndex(prev => Math.min(prev + 1, queue.length - 1))
  }, [queue.length])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio.currentTime > 3) {
      audio.currentTime = 0
    } else {
      setQueueIndex(prev => Math.max(prev - 1, 0))
    }
  }, [])

  const seek = useCallback((pct) => {
    const audio = audioRef.current
    if (audio.duration) audio.currentTime = (pct / 100) * audio.duration
  }, [])

  return {
    isPlaying, progress, duration, currentTime, currentTrack, queue, queueIndex,
    playQueue, togglePlay, next, prev, seek
  }
}
