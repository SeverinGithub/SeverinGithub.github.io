const DB_NAME = 'SoundOS'
const DB_VERSION = 2

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('tracks')) {
        const store = db.createObjectStore('tracks', { keyPath: 'id' })
        store.createIndex('artist', 'artist', { unique: false })
        store.createIndex('album', 'album', { unique: false })
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveTracks(tracks) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite')
    const store = tx.objectStore('tracks')
    tracks.forEach(t => store.put(t))
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadTracks() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readonly')
    const req = tx.objectStore('tracks').getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteTrack(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite')
    tx.objectStore('tracks').delete(id)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadPlaylists() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readonly')
    const req = tx.objectStore('playlists').getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePlaylist(playlist) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readwrite')
    tx.objectStore('playlists').put(playlist)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function deletePlaylist(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readwrite')
    tx.objectStore('playlists').delete(id)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}
