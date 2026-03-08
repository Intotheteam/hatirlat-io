import 'package:flutter/material.dart';

class AppColorsExtension extends ThemeExtension<AppColorsExtension> {
  final Color background;
  final Color surface;
  final Color surfaceVariant;
  final Color cardBg;

  final Color primary;
  final Color primaryLight;
  final Color secondary;
  final Color accent;

  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;

  final Color success;
  final Color warning;
  final Color error;

  final Color border;
  final Color divider;

  final Color scheduled;
  final Color sent;
  final Color paused;
  final Color failed;

  final LinearGradient primaryGradient;
  final LinearGradient accentGradient;

  const AppColorsExtension({
    required this.background,
    required this.surface,
    required this.surfaceVariant,
    required this.cardBg,
    required this.primary,
    required this.primaryLight,
    required this.secondary,
    required this.accent,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.success,
    required this.warning,
    required this.error,
    required this.border,
    required this.divider,
    required this.scheduled,
    required this.sent,
    required this.paused,
    required this.failed,
    required this.primaryGradient,
    required this.accentGradient,
  });

  @override
  ThemeExtension<AppColorsExtension> copyWith({
    Color? background,
    Color? surface,
    Color? surfaceVariant,
    Color? cardBg,
    Color? primary,
    Color? primaryLight,
    Color? secondary,
    Color? accent,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? success,
    Color? warning,
    Color? error,
    Color? border,
    Color? divider,
    Color? scheduled,
    Color? sent,
    Color? paused,
    Color? failed,
    LinearGradient? primaryGradient,
    LinearGradient? accentGradient,
  }) {
    return AppColorsExtension(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceVariant: surfaceVariant ?? this.surfaceVariant,
      cardBg: cardBg ?? this.cardBg,
      primary: primary ?? this.primary,
      primaryLight: primaryLight ?? this.primaryLight,
      secondary: secondary ?? this.secondary,
      accent: accent ?? this.accent,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      error: error ?? this.error,
      border: border ?? this.border,
      divider: divider ?? this.divider,
      scheduled: scheduled ?? this.scheduled,
      sent: sent ?? this.sent,
      paused: paused ?? this.paused,
      failed: failed ?? this.failed,
      primaryGradient: primaryGradient ?? this.primaryGradient,
      accentGradient: accentGradient ?? this.accentGradient,
    );
  }

  @override
  ThemeExtension<AppColorsExtension> lerp(
      covariant ThemeExtension<AppColorsExtension>? other, double t) {
    if (other is! AppColorsExtension) {
      return this;
    }
    return AppColorsExtension(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceVariant: Color.lerp(surfaceVariant, other.surfaceVariant, t)!,
      cardBg: Color.lerp(cardBg, other.cardBg, t)!,
      primary: Color.lerp(primary, other.primary, t)!,
      primaryLight: Color.lerp(primaryLight, other.primaryLight, t)!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      error: Color.lerp(error, other.error, t)!,
      border: Color.lerp(border, other.border, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      scheduled: Color.lerp(scheduled, other.scheduled, t)!,
      sent: Color.lerp(sent, other.sent, t)!,
      paused: Color.lerp(paused, other.paused, t)!,
      failed: Color.lerp(failed, other.failed, t)!,
      primaryGradient: primaryGradient, // Gradients normally don't lerp easily
      accentGradient: accentGradient,
    );
  }
}

class AppColors {
  // Trip.com Brand Colors
  static const Color tripBlue = Color(0xFF003580); // Trip.com Primary Blue
  static const Color tripLightBlue = Color(0xFF0043A1); // Lighter Trip.com Blue

  // New Light Theme Colors (Vibrant & Modern)
  static const Color lightBlue =
      Color(0xFF287DFA); // Canlı Mavi - Ana etkileşim rengi
  static const Color lightYellow =
      Color(0xFFFFB400); // Enerjik Sarı - İkincil vurgu rengi

  // We keep static constants as the "Dark Theme" baseline
  // for compatibility with places that don't have a context yet.
  static const Color background = Color(0xFF080D1A);
  static const Color surface = Color(0xFF0F1729);
  static const Color surfaceVariant = Color(0xFF162035);
  static const Color cardBg = Color(0xFF131C33);

  static const Color primary = Color(0xFF6366F1); // Indigo
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color secondary = Color(0xFF8B5CF6); // Violet
  static const Color accent = Color(0xFF06B6D4); // Cyan

  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF475569);

  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);

  static const Color border = Color(0xFF1E2D4A);
  static const Color divider = Color(0xFF1A2540);

  // Status badge colors
  static const Color scheduled = Color(0xFF6366F1);
  static const Color sent = Color(0xFF10B981);
  static const Color paused = Color(0xFFF59E0B);
  static const Color failed = Color(0xFFEF4444);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF06B6D4), Color(0xFF6366F1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static final AppColorsExtension darkExtension = AppColorsExtension(
    background: const Color(0xFF080D1A),
    surface: const Color(0xFF0F1729),
    surfaceVariant: const Color(0xFF162035),
    cardBg: const Color(0xFF131C33),
    primary: const Color(0xFF6366F1),
    primaryLight: const Color(0xFF818CF8),
    secondary: const Color(0xFF8B5CF6),
    accent: const Color(0xFF06B6D4),
    textPrimary: const Color(0xFFF1F5F9),
    textSecondary: const Color(0xFF94A3B8),
    textMuted: const Color(0xFF475569),
    success: const Color(0xFF10B981),
    warning: const Color(0xFFF59E0B),
    error: const Color(0xFFEF4444),
    border: const Color(0xFF1E2D4A),
    divider: const Color(0xFF1A2540),
    scheduled: const Color(0xFF6366F1),
    sent: const Color(0xFF10B981),
    paused: const Color(0xFFF59E0B),
    failed: const Color(0xFFEF4444),
    primaryGradient: const LinearGradient(
      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    accentGradient: const LinearGradient(
      colors: [Color(0xFF06B6D4), Color(0xFF6366F1)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
  );

  static final AppColorsExtension lightExtension = AppColorsExtension(
    background: const Color(0xFFF8F9FA), // Hafif gri arkaplan
    surface: Colors.white, // Beyaz kart zeminleri
    surfaceVariant: const Color(0xFFF1F5F9), // Slate 100
    cardBg: Colors.white, // Beyaz kart arka planı
    primary: lightBlue, // Yeni Canlı Mavi (#287DFA)
    primaryLight: lightBlue, // Yeni Canlı Mavi
    secondary: lightYellow, // Yeni Enerjik Sarı (#FFB400)
    accent: lightYellow, // Yeni Enerjik Sarı
    textPrimary: Colors.black87, // Siyah metin
    textSecondary: const Color(0xFF64748B), // Orta gri
    textMuted: const Color(0xFF94A3B8), // Açık gri
    success: const Color(0xFF10B981), // Yeşil
    warning: lightYellow, // Sarı uyarı rengi
    error: const Color(0xFFEF4444), // Kırmızı
    border: const Color(0xFFE2E8F0), // Çok açık gri border
    divider: const Color(0xFFCBD5E1), // Açık gri divider
    scheduled: lightBlue,
    sent: const Color(0xFF10B981),
    paused: lightYellow,
    failed: const Color(0xFFEF4444),
    primaryGradient: LinearGradient(
      colors: [lightBlue, lightBlue.withOpacity(0.8)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    accentGradient: LinearGradient(
      colors: [lightYellow, const Color(0xFFFFD700)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
  );

  static AppColorsExtension of(BuildContext context) {
    return Theme.of(context).extension<AppColorsExtension>() ?? darkExtension;
  }
}

class AppTheme {
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.surface,
          error: AppColors.error,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: AppColors.textPrimary,
          onError: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: AppColors.cardBg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.border, width: 1),
          ),
          margin: EdgeInsets.zero,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.surfaceVariant,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          labelStyle: const TextStyle(color: AppColors.textSecondary),
          hintStyle: const TextStyle(color: AppColors.textMuted),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.3,
            ),
            elevation: 0,
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            minimumSize: const Size(double.infinity, 52),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            side: const BorderSide(color: AppColors.primary),
            textStyle:
                const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.surfaceVariant,
          selectedColor: AppColors.primary.withOpacity(0.2),
          labelStyle:
              const TextStyle(color: AppColors.textSecondary, fontSize: 13),
          side: const BorderSide(color: AppColors.border),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.divider,
          thickness: 1,
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 4,
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: AppColors.surface,
          contentTextStyle: const TextStyle(color: AppColors.textPrimary),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          behavior: SnackBarBehavior.floating,
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
          displayMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
          headlineLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
          headlineMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
          headlineSmall: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
          titleLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
          titleMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w500,
          ),
          bodyLarge: TextStyle(color: AppColors.textPrimary),
          bodyMedium: TextStyle(color: AppColors.textSecondary),
          bodySmall: TextStyle(color: AppColors.textMuted),
          labelLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        extensions: [AppColors.darkExtension],
      );

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8F9FA), // Hafif gri arkaplan
        colorScheme: const ColorScheme.light(
          primary: AppColors.lightBlue, // Yeni Mavi (#287DFA)
          onPrimary: Colors.white, // Mavinin üzerindeki yazı
          secondary: AppColors.lightYellow, // Yeni Sarı (#FFB400)
          onSecondary: Colors.black87, // Sarının üzerindeki yazı
          surface: Colors.white, // Kart ve Dialog zeminleri
          onSurface: Colors.black87, // Metin Rengi
          error: Color(0xFFEF4444),
          onError: Colors.white,
        ),
        // Tıklama efektleri
        splashColor: AppColors.lightBlue.withOpacity(0.1),
        highlightColor: AppColors.lightBlue.withOpacity(0.05),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: Color(0xFF0F172A),
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        // Pastel Card Theme - Yüksek kavisli köşeler
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24), // YÜKSEK kavis
          ),
          margin: EdgeInsets.zero,
        ),
        // Pastel Input Decoration
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF1F5F9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16), // Yuvarlak köşeler
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.lightBlue, width: 2),
          ),
          labelStyle: const TextStyle(color: Color(0xFF64748B)),
          hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
        // Elevated Button - Yeni Mavi ile
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.lightBlue, // Yeni Mavi
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30), // Tam oval (Pill)
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.3,
            ),
            elevation: 0,
            shadowColor: Colors.transparent,
          ),
        ),
        // Outlined Button - Yeni Mavi ile
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.lightBlue, // Yeni Mavi
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30), // Oval
            ),
            side: const BorderSide(color: AppColors.lightBlue),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        // Pastel Chip Theme
        chipTheme: ChipThemeData(
          backgroundColor: const Color(0xFFF1F5F9),
          selectedColor: AppColors.lightBlue.withOpacity(0.15),
          labelStyle: const TextStyle(
            color: Color(0xFF0F172A),
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20), // Oval chip
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: AppColors.lightBlue, // Yeni canlı mavi (#287DFA)
          foregroundColor: Colors.white,
          elevation: 2,
          focusElevation: 4,
          hoverElevation: 4,
          highlightElevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius:
                BorderRadius.circular(30), // Pill shape (Yumuşak kavis)
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.lightBlue,
          unselectedItemColor: Color(0xFF94A3B8),
          selectedIconTheme: IconThemeData(size: 24),
          unselectedIconTheme: IconThemeData(size: 24),
          selectedLabelStyle: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w400,
          ),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        // DatePicker Tema - Beyaz yazı sorununu çözer
        datePickerTheme: DatePickerThemeData(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors
              .transparent, // Material 3'te takvimin renkli atmasını engeller

          // Üst taraf başlık bölgesi
          headerBackgroundColor: AppColors.lightBlue, // Yeni mavi
          headerForegroundColor: Colors.white,

          // Haftanın günleri metin stili
          weekdayStyle: const TextStyle(
            color: Colors.black54,
            fontWeight: FontWeight.w500,
          ),

          // Takvim içindeki rakamlar (Normal günler) - SORUN BURASI!
          dayStyle: const TextStyle(
            color:
                Colors.black87, // Sayıları siyah yapar (Beyaz ekranda görünür!)
          ),

          // Sayıların durumu (Seçili, Boş vs.)
          dayForegroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return Colors.white; // Seçildiğinde içindeki yazı beyaz
            } else if (states.contains(WidgetState.disabled)) {
              return Colors.black26; // Geçersiz tarihler silik gri
            }
            return Colors.black87; // Normal tarihler siyah
          }),

          // Seçili tarihin arka planı
          dayBackgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return AppColors.lightBlue; // Mavi seçili
            }
            return Colors.transparent;
          }),

          // Bugünün belirteç rengi
          todayForegroundColor:
              WidgetStateProperty.all(AppColors.lightYellow), // Bugünü sarı!
          todayBorder: const BorderSide(color: AppColors.lightYellow, width: 2),

          // Buton stilleri
          cancelButtonStyle: ButtonStyle(
            foregroundColor: WidgetStateProperty.all(AppColors.lightBlue),
          ),
          confirmButtonStyle: ButtonStyle(
            foregroundColor: WidgetStateProperty.all(AppColors.lightBlue),
          ),
        ),

        // TimePicker Tema
        timePickerTheme: TimePickerThemeData(
          backgroundColor: Colors.white,
          dialHandColor: AppColors.lightBlue,
          dialBackgroundColor: const Color(0xFFF0F0F0),
          hourMinuteTextColor: WidgetStateColor.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return Colors.white;
            }
            return Colors.black87;
          }),
          dayPeriodTextColor: WidgetStateColor.resolveWith((states) {
            return Colors.black87;
          }),
          helpTextStyle: const TextStyle(color: Colors.black87),
          dialTextColor: WidgetStateColor.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return Colors.white;
            }
            return Colors.black87;
          }),
          entryModeIconColor: AppColors.lightBlue,
        ),
        extensions: [AppColors.lightExtension],
      );
}
