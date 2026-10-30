// Generado por DSGBR. No editar a mano.
import SwiftUI
import UIKit

extension Color {
    init(argb: UInt32) {
        self.init(.sRGB,
                  red: Double((argb >> 16) & 0xFF) / 255,
                  green: Double((argb >> 8) & 0xFF) / 255,
                  blue: Double(argb & 0xFF) / 255,
                  opacity: Double((argb >> 24) & 0xFF) / 255)
    }
    /// Color que cambia solo entre claro y oscuro.
    init(light: UInt32, dark: UInt32) {
        self.init(UIColor { $0.userInterfaceStyle == .dark ? UIColor(Color(argb: dark)) : UIColor(Color(argb: light)) })
    }
}

// Colores primitivos
extension Color {
    public static let brand100 = Color(argb: 0xFFEBF2FF)
    public static let brand200 = Color(argb: 0xFFD3E2FF)
    public static let brand300 = Color(argb: 0xFFB1CBFF)
    public static let brand400 = Color(argb: 0xFF80A9FF)
    public static let brand500 = Color(argb: 0xFF4F84FF)
    public static let brand600 = Color(argb: 0xFF3062E2)
    public static let brand700 = Color(argb: 0xFF1F49B8)
    public static let brand800 = Color(argb: 0xFF113185)
    public static let brand900 = Color(argb: 0xFF071D59)
    public static let neutral50 = Color(argb: 0xFFF8FAFF)
    public static let neutral100 = Color(argb: 0xFFEFF4FC)
    public static let neutral200 = Color(argb: 0xFFE2E6EF)
    public static let neutral300 = Color(argb: 0xFFD0D4DC)
    public static let neutral400 = Color(argb: 0xFFA7ABB3)
    public static let neutral500 = Color(argb: 0xFF82868E)
    public static let neutral600 = Color(argb: 0xFF60636A)
    public static let neutral700 = Color(argb: 0xFF44484E)
    public static let neutral800 = Color(argb: 0xFF2B2E34)
    public static let neutral900 = Color(argb: 0xFF13161C)
    public static let neutral950 = Color(argb: 0xFF07090E)
    public static let baseWhite = Color(argb: 0xFFFFFFFF)
}

// Colores semánticos (claro y oscuro)
extension Color {
    public static let backgroundPrimary = Color(light: 0xFFFFFFFF, dark: 0xFF07090E)
    public static let backgroundHover = Color(light: 0xFFEFF4FC, dark: 0xFF13161C)
    public static let backgroundBrand = Color(light: 0xFF3062E2, dark: 0xFF80A9FF)
    public static let backgroundSelected = Color(light: 0xFFEBF2FF, dark: 0xFF071D59)
    public static let contentPrimary = Color(light: 0xFF13161C, dark: 0xFFFFFFFF)
    public static let contentSecondary = Color(light: 0xFF60636A, dark: 0xFFD0D4DC)
    public static let contentBrand = Color(light: 0xFF3062E2, dark: 0xFFB1CBFF)
    public static let contentLink = Color(light: 0xFF3062E2, dark: 0xFFB1CBFF)
    public static let borderPrimary = Color(light: 0xFFD0D4DC, dark: 0xFF44484E)
    public static let borderBrand = Color(light: 0xFF4F84FF, dark: 0xFF80A9FF)
}

// Medidas, tipografía y movimiento
public enum DS {
    public static let unit2: CGFloat = 2
    public static let unit4: CGFloat = 4
    public static let unit8: CGFloat = 8
    public static let unit12: CGFloat = 12
    public static let unit14: CGFloat = 14
    public static let unit16: CGFloat = 16
    public static let unit18: CGFloat = 18
    public static let unit20: CGFloat = 20
    public static let unit24: CGFloat = 24
    public static let unit32: CGFloat = 32
    public static let unit40: CGFloat = 40
    public static let unit48: CGFloat = 48
    public static let unit64: CGFloat = 64
    public static let unit72: CGFloat = 72
    public static let space2xs: CGFloat = 2
    public static let spaceXs: CGFloat = 4
    public static let spaceS: CGFloat = 8
    public static let spaceM: CGFloat = 12
    public static let spaceL: CGFloat = 16
    public static let spaceXl: CGFloat = 24
    public static let space2xl: CGFloat = 32
    public static let space3xl: CGFloat = 40
    public static let space4xl: CGFloat = 48
    public static let radiusNone: CGFloat = 0
    public static let radiusXs: CGFloat = 6
    public static let radiusS: CGFloat = 10
    public static let radiusM: CGFloat = 14
    public static let radiusL: CGFloat = 18
    public static let radiusXl: CGFloat = 28
    public static let radiusPill: CGFloat = 999
    public static let borderWidthXS: CGFloat = 1
    public static let borderWidthS: CGFloat = 1.5
    public static let borderWidthM: CGFloat = 2
    public static let fontSizeXs: CGFloat = 12
    public static let fontSizeS: CGFloat = 14
    public static let fontSizeM: CGFloat = 16
    public static let fontSizeL: CGFloat = 18
    public static let fontSizeXl: CGFloat = 20
    public static let fontSize2xl: CGFloat = 24
    public static let fontSize3xl: CGFloat = 32
    public static let elevation1Layer1Blur: Double = 2
    public static let elevation1Layer1OffsetY: Double = 0
    public static let elevation1Layer2Blur: Double = 4
    public static let elevation1Layer2OffsetY: Double = 2
    public static let elevation2Layer1Blur: Double = 4
    public static let elevation2Layer1OffsetY: Double = 0
    public static let elevation2Layer2Blur: Double = 8
    public static let elevation2Layer2OffsetY: Double = 4
    public static let motionDurationFast: Double = 120
    public static let motionDurationMedium: Double = 220
    public static let motionDurationSlow: Double = 320
    public static let motionDurationEmphasis: Double = 480
    public static let fontFamilyBrand = "Inter"
    public static let fontWeightRegular: Font.Weight = .regular
    public static let fontWeightSemibold: Font.Weight = .semibold
    public static let motionEasingStandard = "cubic-bezier(0.2, 0, 0, 1)"
    public static let motionEasingEnter = "cubic-bezier(0, 0, 0, 1)"
    public static let motionEasingExit = "cubic-bezier(0.3, 0, 1, 1)"
}
