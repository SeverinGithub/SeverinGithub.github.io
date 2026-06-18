import { useState, useEffect, useCallback } from 'react'
import { saveTracks, loadTracks, deleteTrack, loadPlaylists, savePlaylist, deletePlaylist } from './db'
import { readTags } from './useTags'
import { useAudio } from './useAudio'
import IPodShell from './components/iPodShell'
import BorderlessView from './components/BorderlessView'
import './App.css'

const SCREENS = {
  MENU: 'menu',
  MUSIC: 'music',
  SONGS: 'songs',
  ARTISTS: 'artists',
  ARTIST_SONGS: 'artist_songs',
  ALBUMS: 'albums',
  ALBUM_SONGS: 'album_songs',
  PLAYLISTS: 'playlists',
  PLAYLIST_VIEW: 'playlist_view',
  NOW_PLAYING: 'now_playing',
  UPLOAD: 'upload',
  SETTINGS: 'settings',
}

const MAIN_MENU = [
  { id: 'music', label: 'Music', screen: SCREENS.MUSIC },
  { id: 'playlists', label: 'Playlists', screen: SCREENS.PLAYLISTS },
  { id: 'upload', label: 'Upload Songs', screen: SCREENS.UPLOAD },
  { id: 'now_playing', label: 'Now Playing', screen: SCREENS.NOW_PLAYING },
  { id: 'settings', label: 'Settings', screen: SCREENS.SETTINGS },
]

const MUSIC_MENU = [
  { id: 'songs', label: 'All Songs', screen: SCREENS.SONGS },
  { id: 'artists', label: 'Artists', screen: SCREENS.ARTISTS },
  { id: 'albums', label: 'Albums', screen: SCREENS.ALBUMS },
]

export default function App() {
  const [tracks, setTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [screen, setScreen] = useState(SCREENS.MENU)
  const [menuIndex, setMenuIndex] = useState(0)
  const [screenStack, setScreenStack] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)
  const [borderless, setBorderless] = useState(() => localStorage.getItem('soundos-borderless') === 'true')

  const audio = useAudio()

  useEffect(() => {
    loadTracks().then(setTracks)
    loadPlaylists().then(setPlaylists)
  }, [])

  const toggleBorderless = useCallback(() => {
    setBorderless(prev => {
      const next = !prev
      localStorage.setItem('soundos-borderless', String(next))
      if (next) {
        document.documentElement.requestFullscreen?.().catch(() => {})
      } else {
        document.exitFullscreen?.().catch(() => {})
      }
      return next
    })
  }, [])

  const navigate = useCallback((newScreen, index = 0) => {
    setScreenStack(s => [...s, { screen, menuIndex }])
    setScreen(newScreen)
    setMenuIndex(index)
  }, [screen, menuIndex])

  const goBack = useCallback(() => {
    if (screenStack.length === 0) return
    const prev = screenStack[screenStack.length - 1]
    setScreenStack(s => s.slice(0, -1))
    setScreen(prev.screen)
    setMenuIndex(prev.menuIndex)
  }, [screenStack])

  const handleUpload = useCallback(async (files) => {
    setUploading(true)
    const newTracks = []
    for (const file of files) {
      const tags = await readTags(file)
      const blob = file
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      newTracks.push({
        id, blob, filename: file.name,
        title: tags.title, artist: tags.artist,
        album: tags.album, cover: tags.cover,
        size: file.size,
      })
    }
    await saveTracks(newTracks)
    setTracks(prev => [...prev, ...newTracks])
    setUploading(false)
  }, [])

  const handleDeleteTrack = useCallback(async (id) => {
    await deleteTrack(id)
    setTracks(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleCreatePlaylist = useCallback(async (name) => {
    const pl = { id: `pl-${Date.now()}`, name, trackIds: [] }
    await savePlaylist(pl)
    setPlaylists(prev => [...prev, pl])
    setCreatingPlaylist(false)
    setNewPlaylistName('')
  }, [])

  const handleAddToPlaylist = useCallback(async (playlistId, trackId) => {
    const pl = playlists.find(p => p.id === playlistId)
    if (!pl || pl.trackIds.includes(trackId)) return
    const updated = { ...pl, trackIds: [...pl.trackIds, trackId] }
    await savePlaylist(updated)
    setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p))
  }, [playlists])

  const handleDeletePlaylist = useCallback(async (id) => {
    await deletePlaylist(id)
    setPlaylists(prev => prev.filter(p => p.id !== id))
  }, [])

  const artists = [...new Set(tracks.map(t => t.artist))].sort()
  const albums = [...new Set(tracks.map(t => t.album))].sort()

  const getMenuItems = () => {
    switch (screen) {
      case SCREENS.MENU: return MAIN_MENU
      case SCREENS.MUSIC: return MUSIC_MENU
      case SCREENS.SONGS: return tracks.map(t => ({ id: t.id, label: t.title, sub: t.artist, track: t }))
      case SCREENS.ARTISTS: return artists.map(a => ({ id: a, label: a }))
      case SCREENS.ARTIST_SONGS: return tracks.filter(t => t.artist === selectedArtist).map(t => ({ id: t.id, label: t.title, sub: t.album, track: t }))
      case SCREENS.ALBUMS: return albums.map(a => ({ id: a, label: a }))
      case SCREENS.ALBUM_SONGS: return tracks.filter(t => t.album === selectedAlbum).map(t => ({ id: t.id, label: t.title, sub: t.artist, track: t }))
      case SCREENS.PLAYLISTS: return [...playlists.map(p => ({ id: p.id, label: p.name, playlist: p })), { id: '__new__', label: '+ New Playlist' }]
      case SCREENS.PLAYLIST_VIEW: {
        const pl = playlists.find(p => p.id === selectedPlaylist)
        return pl ? pl.trackIds.map(tid => {
          const t = tracks.find(tr => tr.id === tid)
          return t ? { id: t.id, label: t.title, sub: t.artist, track: t } : null
        }).filter(Boolean) : []
      }
      default: return []
    }
  }

  const handleSelect = (item) => {
    switch (screen) {
      case SCREENS.MENU:
        if (item.screen === SCREENS.NOW_PLAYING && !audio.currentTrack) return
        navigate(item.screen)
        break
      case SCREENS.MUSIC:
        navigate(item.screen)
        break
      case SCREENS.SONGS:
        audio.playQueue(tracks, tracks.indexOf(item.track))
        navigate(SCREENS.NOW_PLAYING)
        break
      case SCREENS.ARTISTS:
        setSelectedArtist(item.id)
        navigate(SCREENS.ARTIST_SONGS)
        break
      case SCREENS.ARTIST_SONGS: {
        const artistTracks = tracks.filter(t => t.artist === selectedArtist)
        audio.playQueue(artistTracks, artistTracks.indexOf(item.track))
        navigate(SCREENS.NOW_PLAYING)
        break
      }
      case SCREENS.ALBUMS:
        setSelectedAlbum(item.id)
        navigate(SCREENS.ALBUM_SONGS)
        break
      case SCREENS.ALBUM_SONGS: {
        const albumTracks = tracks.filter(t => t.album === selectedAlbum)
        audio.playQueue(albumTracks, albumTracks.indexOf(item.track))
        navigate(SCREENS.NOW_PLAYING)
        break
      }
      case SCREENS.PLAYLISTS:
        if (item.id === '__new__') {
          setCreatingPlaylist(true)
        } else {
          setSelectedPlaylist(item.playlist.id)
          navigate(SCREENS.PLAYLIST_VIEW)
        }
        break
      case SCREENS.PLAYLIST_VIEW: {
        const pl = playlists.find(p => p.id === selectedPlaylist)
        if (!pl) break
        const plTracks = pl.trackIds.map(tid => tracks.find(t => t.id === tid)).filter(Boolean)
        audio.playQueue(plTracks, plTracks.indexOf(item.track))
        navigate(SCREENS.NOW_PLAYING)
        break
      }
    }
  }

  const scrollMenu = (dir) => {
    const items = getMenuItems()
    if (!items.length) return
    setMenuIndex(prev => {
      let next = prev + dir
      if (next < 0) next = items.length - 1
      if (next >= items.length) next = 0
      return next
    })
  }

  const sharedProps = {
    screen,
    menuIndex,
    menuItems: getMenuItems(),
    audio,
    tracks,
    playlists,
    uploading,
    creatingPlaylist,
    newPlaylistName,
    borderless,
    onScroll: scrollMenu,
    onSelect: () => handleSelect(getMenuItems()[menuIndex]),
    onMenu: goBack,
    onPlayPause: audio.togglePlay,
    onNext: audio.next,
    onPrev: audio.prev,
    onUpload: handleUpload,
    onDeleteTrack: handleDeleteTrack,
    onCreatePlaylist: handleCreatePlaylist,
    onDeletePlaylist: handleDeletePlaylist,
    onNewPlaylistName: setNewPlaylistName,
    onCancelPlaylist: () => { setCreatingPlaylist(false); setNewPlaylistName('') },
    onToggleBorderless: toggleBorderless,
  }

  if (borderless) {
    return <BorderlessView {...sharedProps} />
  }

  return <IPodShell {...sharedProps} />
}
