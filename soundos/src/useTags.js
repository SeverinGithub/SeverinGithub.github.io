export function readTags(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // Try to extract ID3 tags manually from ArrayBuffer
        const buf = e.target.result
        const view = new DataView(buf)
        const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2))

        let title = file.name.replace(/\.[^.]+$/, '')
        let artist = 'Unknown Artist'
        let album = 'Unknown Album'
        let cover = null

        if (magic === 'ID3') {
          const result = parseID3v2(buf)
          if (result.title) title = result.title
          if (result.artist) artist = result.artist
          if (result.album) album = result.album
          if (result.cover) cover = result.cover
        }

        resolve({ title, artist, album, cover })
      } catch {
        resolve({
          title: file.name.replace(/\.[^.]+$/, ''),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          cover: null
        })
      }
    }
    reader.onerror = () => resolve({
      title: file.name.replace(/\.[^.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      cover: null
    })
    reader.readAsArrayBuffer(file.slice(0, 256 * 1024))
  })
}

function parseID3v2(buf) {
  const view = new DataView(buf)
  const result = {}

  // ID3v2 header: ID3 + version(2) + flags(1) + size(4 syncsafe)
  const majorVersion = view.getUint8(3)
  const flags = view.getUint8(5)
  const hasExtHeader = (flags & 0x40) !== 0

  let size = 0
  for (let i = 6; i < 10; i++) {
    size = (size << 7) | (view.getUint8(i) & 0x7f)
  }

  let offset = 10
  if (hasExtHeader) {
    const extSize = view.getUint32(10)
    offset += extSize
  }

  const end = Math.min(10 + size, buf.byteLength)

  while (offset < end - 10) {
    const frameId = readString(view, offset, 4)
    if (frameId === '\x00\x00\x00\x00') break

    let frameSize
    if (majorVersion >= 4) {
      frameSize = 0
      for (let i = 0; i < 4; i++) frameSize = (frameSize << 7) | (view.getUint8(offset + 4 + i) & 0x7f)
    } else {
      frameSize = view.getUint32(offset + 4)
    }

    if (frameSize <= 0 || offset + 10 + frameSize > end) break

    const encoding = view.getUint8(offset + 10)

    if (frameId === 'TIT2') result.title = decodeText(view, offset + 11, frameSize - 1, encoding)
    else if (frameId === 'TPE1') result.artist = decodeText(view, offset + 11, frameSize - 1, encoding)
    else if (frameId === 'TALB') result.album = decodeText(view, offset + 11, frameSize - 1, encoding)
    else if (frameId === 'APIC') {
      try {
        result.cover = extractCover(view, buf, offset + 10, frameSize)
      } catch {}
    }

    offset += 10 + frameSize
  }

  return result
}

function readString(view, offset, len) {
  let s = ''
  for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(offset + i))
  return s
}

function decodeText(view, offset, len, encoding) {
  const bytes = new Uint8Array(view.buffer, offset, len)
  if (encoding === 0) {
    return new TextDecoder('iso-8859-1').decode(bytes).replace(/\x00/g, '').trim()
  } else if (encoding === 3) {
    return new TextDecoder('utf-8').decode(bytes).replace(/\x00/g, '').trim()
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16 — skip BOM if present
    let start = 0
    if (bytes[0] === 0xff && bytes[1] === 0xfe) start = 2
    else if (bytes[0] === 0xfe && bytes[1] === 0xff) start = 2
    return new TextDecoder('utf-16le').decode(bytes.slice(start)).replace(/\x00/g, '').trim()
  }
  return new TextDecoder('utf-8').decode(bytes).replace(/\x00/g, '').trim()
}

function extractCover(view, buf, offset, frameSize) {
  // encoding(1) + mime(null-terminated) + picture type(1) + description(null-terminated) + data
  let pos = offset + 1
  const end = offset + frameSize
  // skip mime type until null
  while (pos < end && view.getUint8(pos) !== 0) pos++
  pos++ // skip null
  pos++ // skip picture type
  // skip description until null (or double null for utf16)
  while (pos < end && view.getUint8(pos) !== 0) pos++
  pos++ // skip null

  const imgData = new Uint8Array(buf, pos, end - pos)
  const blob = new Blob([imgData])
  return URL.createObjectURL(blob)
}
