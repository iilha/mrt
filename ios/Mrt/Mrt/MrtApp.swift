import SwiftUI

@main
struct MrtApp: App {
    var body: some Scene {
        WindowGroup {
            WebViewScreen()
                .ignoresSafeArea()
        }
    }
}
