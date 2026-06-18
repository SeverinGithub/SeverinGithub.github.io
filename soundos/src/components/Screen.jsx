import { useRef } from 'react'
import './Screen.css'

const SCREENS = {
  MENU: 'menu', MUSIC: 'music', SONGS: 'songs', ARTISTS: 'artists',
  ARTIST_SONGS: 'artist_songs', ALBUMS: 'albums', ALBUM_SONGS: 'album_songs',
  PLAYLISTS: 'playlists', PLAYLIST_VIEW: 'playlist_view',
  NOW_PLAYING: 'now_playing', UPLOAD: 'upload', SETTINGS: 'settings',
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const SCREEN_TITLES = {
  menu: 'SoundOS', music: 'Music', songs: 'Songs', artists: 'Artists',
  artist_songs: 'Artist', albums: 'Albums', album_songs: 'Album',
  playlists: 'Playlists', playlist_view: 'Playlist',
  now_playing: 'Now Playing', upload: 'Upload', settings: 'Settings',
}

export default function Screen({
  screen, menuIndex, menuItems, audio, tracks,
  uploading, creatingPlaylist, newPlaylistName,
  onUpload, onDeleteTrack, onCreatePlaylist, onDeletePlaylist,
  onNewPlaylistName, onCancelPlaylist, playlists, onChangeViewMode, viewMode,
  screenTheme = 'classic', onChangeScreenTheme,
}) {
  const fileInputRef = useRef(null)

  const isNowPlaying = screen === SCREENS.NOW_PLAYING
  const title = SCREEN_TITLES[screen] || 'SoundOS'

  const VISIBLE = 5
  const startIdx = Math.max(0, Math.min(menuIndex - 2, Math.max(0, menuItems.length - VISIBLE)))
  const visible = menuItems.slice(startIdx, startIdx + VISIBLE)

  return (
    <div className={`screen screen--${screenTheme}`}>
      <div className="screen-header">
        <div className="screen-title">{title}</div>
        <div className="screen-battery">
          <span className="battery-icon">🔋</span>
        </div>
      </div>

      {screen === SCREENS.NOW_PLAYING ? (
        <NowPlaying audio={audio} screenTheme={screenTheme} />
      ) : screen === SCREENS.UPLOAD ? (
        <UploadScreen
          tracks={tracks}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onUpload={onUpload}
          onDelete={onDeleteTrack}
        />
      ) : screen === SCREENS.SETTINGS ? (
        <SettingsScreen tracks={tracks} viewMode={viewMode} onChangeViewMode={onChangeViewMode}
          screenTheme={screenTheme} onChangeScreenTheme={onChangeScreenTheme} />
      ) : screen === SCREENS.PLAYLISTS && creatingPlaylist ? (
        <NewPlaylistScreen
          name={newPlaylistName}
          onChange={onNewPlaylistName}
          onCreate={onCreatePlaylist}
          onCancel={onCancelPlaylist}
        />
      ) : (
        <MenuList
          items={visible}
          selectedIndex={menuIndex - startIdx}
          hasNowPlaying={!!audio.currentTrack}
        />
      )}

      {audio.currentTrack && screen !== SCREENS.NOW_PLAYING && (
        <div className="mini-player">
          <span className="mini-title">{audio.currentTrack.title}</span>
          <span className="mini-state">{audio.isPlaying ? '▶' : '❙❙'}</span>
        </div>
      )}
    </div>
  )
}

function MenuList({ items, selectedIndex }) {
  if (!items.length) {
    return <div className="screen-empty">No items</div>
  }
  return (
    <ul className="menu-list">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={`menu-item${i === selectedIndex ? ' selected' : ''}`}
        >
          <span className="menu-item-label">{item.label}</span>
          {item.sub && <span className="menu-item-sub">{item.sub}</span>}
          {i === selectedIndex && <span className="menu-arrow">›</span>}
        </li>
      ))}
    </ul>
  )
}

function NowPlaying({ audio, screenTheme }) {
  const { currentTrack, isPlaying, progress, currentTime, duration } = audio
  if (!currentTrack) {
    return (
      <div className="now-playing-empty">
        <div className="now-playing-icon">♪</div>
        <div>No track selected</div>
        <div className="now-playing-hint">Go to Music to play a song</div>
      </div>
    )
  }
  if (screenTheme === 'retro') {
    return (
      <div className="now-playing now-playing--retro">
        <div className="np-art np-art--retro">
          {currentTrack.cover
            ? <img src={currentTrack.cover} alt="cover" />
            : <div className="np-art-placeholder">♪</div>}
        </div>
        <div className="np-retro-right">
          <div className="np-info">
            <div className="np-title">{currentTrack.title}</div>
            <div className="np-artist">{currentTrack.artist}</div>
            <div className="np-album">{currentTrack.album}</div>
          </div>
          <div className="np-progress-bar">
            <div className="np-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="np-times">
            <span>{formatTime(currentTime)}</span>
            <span className="np-state">{isPlaying ? '▶' : '❙❙'}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="now-playing">
      <div className="np-art">
        {currentTrack.cover
          ? <img src={currentTrack.cover} alt="cover" />
          : <div className="np-art-placeholder">♪</div>}
      </div>
      <div className="np-info">
        <div className="np-title">{currentTrack.title}</div>
        <div className="np-artist">{currentTrack.artist}</div>
        <div className="np-album">{currentTrack.album}</div>
      </div>
      <div className="np-progress-bar">
        <div className="np-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="np-times">
        <span>{formatTime(currentTime)}</span>
        <span className="np-state">{isPlaying ? '▶' : '❙❙'}</span>
        <span>-{formatTime(duration - currentTime)}</span>
      </div>
    </div>
  )
}

function UploadScreen({ tracks, uploading, fileInputRef, onUpload, onDelete }) {
  return (
    <div className="upload-screen">
      <button
        className="upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Importing...' : '+ Add MP3 Files'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,.mp3,.m4a,audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => onUpload(Array.from(e.target.files))}
      />
      <div className="track-count">{tracks.length} song{tracks.length !== 1 ? 's' : ''} in library</div>
      <div className="upload-list">
        {tracks.map(t => (
          <div key={t.id} className="upload-track-row">
            <div className="upload-track-info">
              <span className="upload-track-title">{t.title}</span>
              <span className="upload-track-artist">{t.artist}</span>
            </div>
            <button className="delete-btn" onClick={() => onDelete(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const VIEW_MODES = [
  { value: 'ipod', label: 'iPod Sim.' },
  { value: 'borderless', label: 'Borderless' },
  { value: 'modern', label: 'Modern' },
]

const SCREEN_THEMES = [
  { value: 'classic', label: 'Classic' },
  { value: 'retro', label: 'Retro' },
]

function SettingsScreen({ tracks, viewMode, onChangeViewMode, screenTheme, onChangeScreenTheme }) {
  return (
    <div className="settings-screen">
      <div className="settings-item">
        <span>SoundOS</span>
        <span className="settings-value">v1.0</span>
      </div>
      <div className="settings-item">
        <span>Songs</span>
        <span className="settings-value">{tracks.length}</span>
      </div>
      <div className="settings-item settings-mode-row">
        <span>View</span>
        <div className="settings-mode-select">
          {VIEW_MODES.map(m => (
            <button
              key={m.value}
              className={`settings-mode-btn${viewMode === m.value ? ' active' : ''}`}
              onClick={() => onChangeViewMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-item settings-mode-row">
        <span>Screen</span>
        <div className="settings-mode-select">
          {SCREEN_THEMES.map(t => (
            <button
              key={t.value}
              className={`settings-mode-btn${screenTheme === t.value ? ' active' : ''}`}
              onClick={() => onChangeScreenTheme?.(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-about">
        <div>SoundOS — a classic experience</div>
      </div>
    </div>
  )
}

function NewPlaylistScreen({ name, onChange, onCreate, onCancel }) {
  return (
    <div className="new-playlist-screen">
      <div className="new-playlist-label">Playlist Name:</div>
      <input
        className="new-playlist-input"
        type="text"
        value={name}
        onChange={e => onChange(e.target.value)}
        placeholder="My Playlist"
        autoFocus
      />
      <div className="new-playlist-actions">
        <button className="pl-btn pl-create" onClick={() => onCreate(name || 'Untitled')}>Create</button>
        <button className="pl-btn pl-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
