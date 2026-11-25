// Zeichnet das App-Icon (1024×1024): Schiefer-Gehäuse mit einem 4×4-Step-Raster in den Teilfarben.
// Aufruf: swift tools/make_icon.swift Taktwerk/Assets.xcassets/AppIcon.appiconset/icon-1024.png
import AppKit

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "icon-1024.png"
let size = 1024
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
                           samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
                           bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
func hex(_ h: UInt32, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((h >> 16) & 255) / 255, green: CGFloat((h >> 8) & 255) / 255, blue: CGFloat(h & 255) / 255, alpha: a)
}
// Hintergrund mit leichtem Verlauf
NSGradient(colors: [hex(0x232833), hex(0x14171d)])!.draw(in: NSRect(x: 0, y: 0, width: size, height: size), angle: -90)

let colors: [UInt32] = [0xff7a59, 0xffb547, 0x4fd1a5, 0xc58cff]
// Muster: welche Zellen leuchten (oben nach unten: Hat, Clap, Perc, Kick)
let on: [[Double]] = [
    [0.55, 0.3, 0.55, 0.3],
    [0, 1, 0, 1],
    [0, 0.45, 0, 0.75],
    [1, 0, 1, 0],
]
let pad = 150.0, gap = 34.0
let cell = (Double(size) - 2 * pad - 3 * gap) / 4
for r in 0..<4 {
    for c in 0..<4 {
        let x = pad + Double(c) * (cell + gap)
        let y = pad + Double(3 - r) * (cell + gap)
        let rect = NSRect(x: x, y: y, width: cell, height: cell)
        let path = NSBezierPath(roundedRect: rect, xRadius: 34, yRadius: 34)
        let v = on[r][c]
        if v > 0 { hex(colors[r], 0.35 + 0.65 * v).setFill() } else { hex(0x2a303b).setFill() }
        path.fill()
    }
}
// Playhead unter der zweiten Spalte
hex(0xe8ebf1).setFill()
NSBezierPath(roundedRect: NSRect(x: pad + cell + gap, y: pad - 62, width: cell, height: 18), xRadius: 9, yRadius: 9).fill()
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
print("Icon geschrieben: \(out)")
