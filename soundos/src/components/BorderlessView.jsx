import { useRef } from 'react'
import './BorderlessView.css'

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const SCREENS = {
  MENU: 'menu', MUSIC: 'music', SONGS: 'songs', ARTISTS: 'artists',
  ARTIST_SONGS: 'artist_songs', ALBUMS: 'albums', ALBUM_SONGS: 'album_songs',
  PLAYLISTS: 'playlists', PLAYLIST_VIEW: 'playlist_view',
  NOW_PLAYING: 'now_playing', UPLOAD: 'upload', SETTINGS: 'settings',
}

const SCREEN_TITLES = {
  menu: 'SoundOS', music: 'Music', songs: 'Songs', artists: 'Artists',
  artist_songs: 'Artist', albums: 'Albums', album_songs: 'Album',
  playlists: 'Playlists', playlist_view: 'Playlist',
  now_playing: 'Now Playing', upload: 'Upload Songs', settings: 'Settings',
}

export default function BorderlessView(props) {
  const {
    screen, menuIndex, menuItems, audio, tracks, playlists,
    uploading, creatingPlaylist, newPlaylistName,
    onScroll, onSelect, onMenu, onPlayPause, onNext, onPrev,
    onUpload, onDeleteTrack, onCreatePlaylist, onDeletePlaylist,
    onNewPlaylistName, onCancelPlaylist, onToggleBorderless,
  } = props

  const fileInputRef = useRef(null)
  const isNowPlaying = screen === SCREENS.NOW_PLAYING
  const { currentTrack, isPlaying, progress, currentTime, duration } = audio

  const VISIBLE = 8
  const startIdx = Math.max(0, Math.min(menuIndex - 3, Math.max(0, menuItems.length - VISIBLE)))
  const visibleItems = menuItems.slice(startIdx, startIdx + VISIBLE)

  return (
    <div className="bl-root">
      {/* Blurred album art background */}
      {currentTrack?.cover && (
        <div
          className="bl-bg-art"
          style={{ backgroundImage: `url(${currentTrack.cover})` }}
        />
      )}
      <div className="bl-bg-overlay" />

      {/* Top bar */}
      <div className="bl-topbar">
        {screen !== SCREENS.MENU ? (
          <button className="bl-back" onClick={onMenu}>‹ Back</button>
        ) : (
          <div className="bl-logo">SoundOS</div>
        )}
        <div className="bl-topbar-title">{SCREEN_TITLES[screen] || ''}</div>
        <button className="bl-borderless-btn" onClick={onToggleBorderless} title="Classic Mode">
          ⬡
        </button>
      </div>

      {/* Content */}
      <div className="bl-content">
        {screen === SCREENS.NOW_PLAYING ? (
          <NowPlayingFull audio={audio} />
        ) : screen === SCREENS.UPLOAD ? (
          <UploadFull tracks={tracks} uploading={uploading} fileInputRef={fileInputRef} onUpload={onUpload} onDelete={onDeleteTrack} />
        ) : screen === SCREENS.SETTINGS ? (
          <SettingsFull tracks={tracks} onToggleBorderless={onToggleBorderless} borderless={true} />
        ) : screen === SCREENS.PLAYLISTS && creatingPlaylist ? (
          <NewPlaylistFull name={newPlaylistName} onChange={onNewPlaylistName} onCreate={onCreatePlaylist} onCancel={onCancelPlaylist} />
        ) : (
          <MenuFull items={visibleItems} selectedIndex={menuIndex - startIdx} onSelect={onSelect} onScroll={onScroll} />
        )}
      </div>

      {/* Bottom player bar */}
      {currentTrack && screen !== SCREENS.NOW_PLAYING && (
        <div className="bl-player-bar">
          <div className="bl-player-art">
            {currentTrack.cover
              ? <img src={currentTrack.cover} alt="" />
              : <div className="bl-player-art-placeholder">♪</div>}
          </div>
          <div className="bl-player-info">
            <div className="bl-player-title">{currentTrack.title}</div>
            <div className="bl-player-artist">{currentTrack.artist}</div>
          </div>
          <div className="bl-player-controls">
            <button onClick={onPrev}>⏮</button>
            <button className="bl-play-btn" onClick={onPlayPause}>{isPlaying ? '⏸' : '▶'}</button>
            <button onClick={onNext}>⏭</button>
          </div>
          <div className="bl-player-progress">
            <div className="bl-player-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

function MenuFull({ items, selectedIndex, onSelect, onScroll }) {
  if (!items.length) return <div className="bl-empty">No items</div>
  return (
    <ul className="bl-menu">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={`bl-menu-item${i === selectedIndex ? ' selected' : ''}`}
          onClick={onSelect}
          onMouseEnter={() => {
            const diff = i - selectedIndex
            if (diff !== 0) onScroll(diff)
          }}
        >
          <span className="bl-item-label">{item.label}</span>
          {item.sub && <span className="bl-item-sub">{item.sub}</span>}
          <span className="bl-item-arrow">›</span>
        </li>
      ))}
    </ul>
  )
}

function NowPlayingFull({ audio }) {
  const { currentTrack, isPlaying, progress, currentTime, duration, togglePlay, next, prev, seek } = audio
  if (!currentTrack) return (
    <div className="bl-np-empty">
      <div className="bl-np-empty-icon">♪</div>
      <div>No track selected</div>
    </div>
  )
  return (
    <div className="bl-np">
      <div className="bl-np-art">
        {currentTrack.cover
          ? <img src={currentTrack.cover} alt="cover" />
          : <div className="bl-np-art-ph">♪</div>}
      </div>
      <div className="bl-np-meta">
        <div className="bl-np-title">{currentTrack.title}</div>
        <div className="bl-np-artist">{currentTrack.artist}</div>
        <div className="bl-np-album">{currentTrack.album}</div>
      </div>
      <div
        className="bl-np-bar"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          seek(((e.clientX - rect.left) / rect.width) * 100)
        }}
      >
        <div className="bl-np-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="bl-np-times">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(duration - currentTime)}</span>
      </div>
      <div className="bl-np-controls">
        <button onClick={prev}>⏮</button>
        <button className="bl-np-play" onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</button>
        <button onClick={next}>⏭</button>
      </div>
    </div>
  )
}

function UploadFull({ tracks, uploading, fileInputRef, onUpload, onDelete }) {
  return (
    <div className="bl-upload">
      <button className="bl-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Importing...' : '+ Add MP3 Files'}
      </button>
      <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.m4a" multiple style={{ display: 'none' }}
        onChange={e => onUpload(Array.from(e.target.files))} />
      <div className="bl-track-count">{tracks.length} song{tracks.length !== 1 ? 's' : ''} in library</div>
      <div className="bl-track-list">
        {tracks.map(t => (
          <div key={t.id} className="bl-track-row">
            <div className="bl-track-info">
              <span className="bl-track-title">{t.title}</span>
              <span className="bl-track-artist">{t.artist}</span>
            </div>
            <button className="bl-delete-btn" onClick={() => onDelete(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsFull({ tracks, onToggleBorderless }) {
  return (
    <div className="bl-settings">
      <div className="bl-settings-item">
        <span>SoundOS</span><span className="bl-settings-val">v1.0</span>
      </div>
      <div className="bl-settings-item">
        <span>Songs</span><span className="bl-settings-val">{tracks.length}</span>
      </div>
      <div className="bl-settings-item toggle-row">
        <span>Borderless Mode</span>
        <button className="bl-toggle active" onClick={onToggleBorderless}>ON</button>
      </div>
      <div className="bl-settings-about">SoundOS — a classic experience</div>
    </div>
  )
}

function NewPlaylistFull({ name, onChange, onCreate, onCancel }) {
  return (
    <div className="bl-new-playlist">
      <div className="bl-pl-label">Playlist Name</div>
      <input className="bl-pl-input" type="text" value={name} onChange={e => onChange(e.target.value)}
        placeholder="My Playlist" autoFocus />
      <div className="bl-pl-actions">
        <button className="bl-pl-create" onClick={() => onCreate(name || 'Untitled')}>Create</button>
        <button className="bl-pl-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
