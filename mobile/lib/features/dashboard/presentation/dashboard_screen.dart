import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';
import '../../reminders/providers/reminders_provider.dart';
import '../../reminders/domain/reminder_model.dart';
import '../../../core/theme/app_theme.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final remindersState = ref.watch(remindersProvider);
    final user = authState is AuthAuthenticated ? authState.user : null;

    final reminders = remindersState.reminders;
    final total = reminders.length;
    final active = reminders.where((r) => r.isScheduled).length;
    final completed = reminders.where((r) => r.isSent).length;

    final upcoming = reminders.where((r) => r.isScheduled).take(5).toList();

    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 56, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Merhaba, ${user?.username ?? ''} 👋',
                            style: TextStyle(
                              color: AppColors.of(context).textSecondary,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Genel Bakış',
                            style: TextStyle(
                              color: AppColors.of(context).textPrimary,
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                      // Premium badge
                      if (user?.premium == true)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            gradient: AppColors.of(context).primaryGradient,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.star_rounded,
                                color: Colors.white,
                                size: 12,
                              ),
                              SizedBox(width: 4),
                              Text(
                                'Premium',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ]
                    .animate(interval: 100.ms)
                    .fadeIn()
                    .slideX(begin: -0.1, end: 0),
              ),
            ),
          ),

          // Stats cards
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverToBoxAdapter(
              child: remindersState.isLoading
                  ? _StatsShimmer()
                  : Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            label: 'Toplam',
                            value: total,
                            icon: Icons.list_rounded,
                            color: AppColors.of(context).primary,
                          )
                              .animate()
                              .fadeIn(delay: 200.ms)
                              .slideY(begin: 0.2, end: 0),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            label: 'Aktif',
                            value: active,
                            icon: Icons.schedule_rounded,
                            color: AppColors.of(context).accent,
                          )
                              .animate()
                              .fadeIn(delay: 300.ms)
                              .slideY(begin: 0.2, end: 0),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            label: 'Tamamlanan',
                            value: completed,
                            icon: Icons.check_circle_rounded,
                            color: AppColors.of(context).success,
                          )
                              .animate()
                              .fadeIn(delay: 400.ms)
                              .slideY(begin: 0.2, end: 0),
                        ),
                      ],
                    ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 28)),

          // Upcoming section header
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverToBoxAdapter(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Yaklaşan Hatırlatıcılar',
                    style: TextStyle(
                      color: AppColors.of(context).textPrimary,
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.go('/reminders'),
                    child: Text(
                      'Tümünü Gör',
                      style: TextStyle(
                          color: AppColors.of(context).primary, fontSize: 13),
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 500.ms),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // Upcoming list
          if (remindersState.isLoading)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (_, i) => _ShimmerCard(),
                  childCount: 3,
                ),
              ),
            )
          else if (upcoming.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 32,
                ),
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.of(context).surfaceVariant,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.notifications_off_outlined,
                        color: AppColors.of(context).textMuted,
                        size: 36,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Yaklaşan hatırlatıcı yok',
                      style: TextStyle(
                        color: AppColors.of(context).textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Yeni bir hatırlatıcı oluşturarak başlayın',
                      style: TextStyle(
                        color: AppColors.of(context).textMuted,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _UpcomingCard(reminder: upcoming[i])
                        .animate()
                        .fadeIn(delay: (600 + i * 80).ms)
                        .slideX(begin: 0.1, end: 0),
                  ),
                  childCount: upcoming.length,
                ),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/reminders/create'),
        backgroundColor: AppColors.of(context).primary, // Temadan al
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30), // Pill shape (Yumuşak kavis)
        ),
        icon: const Icon(
          Icons.add_rounded,
          color: Colors.white,
          size: 24,
        ),
        label: const Text(
          'Hatırlatıcı Ekle',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 14,
            letterSpacing: 0.3,
          ),
        ),
      ).animate().fadeIn(delay: 800.ms).scale(delay: 800.ms),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20), // Daha geniş padding
      decoration: BoxDecoration(
        // Pastel Modern UI: Açık soft teal/buz mavisi veya beyaz
        color: isDark
            ? AppColors.of(context).cardBg
            : AppColors.of(context).cardBg, // Pastel card color
        borderRadius: BorderRadius.circular(24), // YÜKSEK kavis
        // Minimal veya hiç gölge yok (Flat ve clean UI)
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          // İkon için beyaz yuvarlak arka plan
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isDark ? color.withOpacity(0.15) : Colors.white,
              shape: BoxShape.circle, // Tam yuvarlak
            ),
            child: Icon(
              icon,
              color: isDark ? color : AppColors.lightBlue,
              size: 20,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '$value',
            style: TextStyle(
              color: isDark ? color : AppColors.of(context).textPrimary,
              fontSize: 28,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: isDark
                  ? AppColors.of(context).textMuted
                  : AppColors.of(context).textSecondary, // Tema uyarlanmış
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  final ReminderModel reminder;
  const _UpcomingCard({required this.reminder});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color statusColor;
    switch (reminder.status) {
      case 'scheduled':
        statusColor = AppColors.of(context).scheduled;
        break;
      case 'sent':
        statusColor = AppColors.of(context).sent;
        break;
      case 'paused':
        statusColor = AppColors.of(context).paused;
        break;
      default:
        statusColor = AppColors.of(context).failed;
    }

    return Container(
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.of(context).cardBg
            : AppColors.of(context).cardBg, // Pastel card
        borderRadius: BorderRadius.circular(24), // YÜKSEK kavis
        // Minimal gölge veya yok
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          splashColor: (isDark ? AppColors.primary : AppColors.lightBlue)
              .withOpacity(0.1),
          highlightColor: (isDark ? AppColors.primary : AppColors.lightBlue)
              .withOpacity(0.05),
          onTap: () {
            // Mevcut onTap yönlendirmesi veya işlevleri burada kalacak
          },
          child: Padding(
            padding: const EdgeInsets.all(20), // Daha geniş padding
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: 40,
                  decoration: BoxDecoration(
                    color: statusColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        reminder.title,
                        style: TextStyle(
                          color: isDark
                              ? AppColors.of(context).textPrimary
                              : AppColors.of(context).textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.schedule_rounded,
                            color: AppColors.of(context).textMuted,
                            size: 12,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            reminder.dateTime.replaceAll('T', ' '),
                            style: TextStyle(
                              color: AppColors.of(context).textMuted,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                _ChannelIcons(channels: reminder.channels),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ChannelIcons extends StatelessWidget {
  final List<String> channels;
  const _ChannelIcons({required this.channels});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: channels.map((ch) {
        IconData icon;
        Color color;
        switch (ch) {
          case 'email':
            icon = Icons.email_rounded;
            color = AppColors.of(context).accent;
            break;
          case 'sms':
            icon = Icons.sms_rounded;
            color = AppColors.of(context).success;
            break;
          case 'whatsapp':
            icon = Icons.chat_rounded;
            color = const Color(0xFF25D366);
            break;
          default:
            icon = Icons.notifications_rounded;
            color = AppColors.of(context).primary;
        }
        return Padding(
          padding: const EdgeInsets.only(left: 4),
          child: Icon(icon, color: color, size: 14),
        );
      }).toList(),
    );
  }
}

class _StatsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
        3,
        (i) => Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: i < 2 ? 12 : 0),
            child: Container(
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.of(context).cardBg,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.of(context).cardBg,
        borderRadius: BorderRadius.circular(14),
      ),
    );
  }
}
