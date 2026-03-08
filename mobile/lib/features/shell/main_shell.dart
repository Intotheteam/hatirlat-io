import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: navigationShell,
      // Floating Bottom Navigation Bar (Pastel Modern UI)
      bottomNavigationBar: Container(
        margin: const EdgeInsets.all(20.0), // Ekran kenarlarından koparma
        padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 8.0),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surface : Colors.white,
          borderRadius: BorderRadius.circular(40), // Tam oval görünüm (Pill)
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(
                  isDark ? 0.03 : 0.04), // Neredeyse görünmez gölge
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home_rounded,
                label: 'Panel',
                index: 0,
                currentIndex: navigationShell.currentIndex,
                onTap: () => navigationShell.goBranch(0),
              ),
              _NavItem(
                icon: Icons.notifications_outlined,
                activeIcon: Icons.notifications_rounded,
                label: 'Hatırlatıcı',
                index: 1,
                currentIndex: navigationShell.currentIndex,
                onTap: () => navigationShell.goBranch(1),
              ),
              _NavItem(
                icon: Icons.group_outlined,
                activeIcon: Icons.group_rounded,
                label: 'Gruplar',
                index: 2,
                currentIndex: navigationShell.currentIndex,
                onTap: () => navigationShell.goBranch(2),
              ),
              _NavItem(
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profil',
                index: 3,
                currentIndex: navigationShell.currentIndex,
                onTap: () => navigationShell.goBranch(3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int currentIndex;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Mavi/Sarı renk paletine entegre navigasyon ikon renkleri
    final selectedColor = isDark ? AppColors.primary : AppColors.lightBlue;
    final selectedBg = isDark ? AppColors.primary : AppColors.lightBlue;
    final unselectedColor = isDark ? AppColors.textMuted : AppColors.textMuted;

    // Seçili eleman için yuvarlak arka plan (Circle)
    if (isActive) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selectedBg, // Aktif buton arka planı (orta teal)
            shape: BoxShape.circle, // İçi tam yuvarlak kalıyor
          ),
          child: Icon(
            activeIcon,
            color: Colors.white,
            size: 24,
          ),
        ),
      );
    }

    // Seçili olmayan elemanlar
    return IconButton(
      icon: Icon(icon, color: unselectedColor, size: 24),
      onPressed: onTap,
      splashColor: selectedBg.withOpacity(0.1),
      highlightColor: selectedBg.withOpacity(0.05),
    );
  }
}
