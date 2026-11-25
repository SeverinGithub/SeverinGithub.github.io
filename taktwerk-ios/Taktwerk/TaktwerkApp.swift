import SwiftUI

@main
struct TaktwerkApp: App {
    @State private var tw = Taktwerk()

    var body: some Scene {
        WindowGroup {
            // Die Tastatur legt sich über die App, statt sie hochzuschieben
            GeometryReader { _ in MainView() }
                .ignoresSafeArea(.keyboard)
                .environment(tw)
                .preferredColorScheme(.dark)
                .persistentSystemOverlays(.hidden)
                .statusBarHidden()
        }
    }
}
