import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../providers/reminders_provider.dart';
import '../domain/reminder_model.dart';
import '../../../core/theme/app_theme.dart';

class RemindersScreen extends ConsumerWidget {
  const RemindersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(remindersProvider);
    final filtered = state.filtered;

    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: AppColors.of(context).background,
            expandedHeight: 100,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              title: Text(
                'Hatırlatıcılar',
                style: TextStyle(
                  color: AppColors.of(context).textPrimary,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
            ),
          ),

          // Filter chips
          SliverToBoxAdapter(
            child: SizedBox(
              height: 48,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _FilterChip(
                    label: 'Tümü',
                    value: 'all',
                    current: state.filterStatus,
                    onTap: () => ref
                        .read(remindersProvider.notifier)
                        .setFilterStatus('all'),
                  ),
                  _FilterChip(
                    label: 'Planlanan',
                    value: 'scheduled',
                    current: state.filterStatus,
                    color: AppColors.of(context).scheduled,
                    onTap: () => ref
                        .read(remindersProvider.notifier)
                        .setFilterStatus('scheduled'),
                  ),
                  _FilterChip(
                    label: 'Gönderilen',
                    value: 'sent',
                    current: state.filterStatus,
                    color: AppColors.of(context).sent,
                    onTap: () => ref
                        .read(remindersProvider.notifier)
                        .setFilterStatus('sent'),
                  ),
                  _FilterChip(
                    label: 'Beklemede',
                    value: 'paused',
                    current: state.filterStatus,
                    color: AppColors.of(context).paused,
                    onTap: () => ref
                        .read(remindersProvider.notifier)
                        .setFilterStatus('paused'),
                  ),
                  _FilterChip(
                    label: 'Başarısız',
                    value: 'failed',
                    current: state.filterStatus,
                    color: AppColors.of(context).failed,
                    onTap: () => ref
                        .read(remindersProvider.notifier)
                        .setFilterStatus('failed'),
                  ),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          // Content
          if (state.isLoading)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (_, i) => _ShimmerItem(),
                  childCount: 6,
                ),
              ),
            )
          else if (state.error != null)
            SliverFillRemaining(
              child: _ErrorState(
                message: state.error!,
                onRetry: () => ref.read(remindersProvider.notifier).loadAll(),
              ),
            )
          else if (filtered.isEmpty)
            const SliverFillRemaining(child: _EmptyState())
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _ReminderCard(reminder: filtered[i])
                        .animate()
                        .fadeIn(delay: (i * 50).ms)
                        .slideX(begin: 0.05, end: 0),
                  ),
                  childCount: filtered.length,
                ),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/reminders/create'),
        backgroundColor: AppColors.of(context).primary, // Temadan al
        foregroundColor: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30), // Pill shape
        ),
        child: const Icon(Icons.add_rounded, size: 24),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final String value;
  final String current;
  final Color? color;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.value,
    required this.current,
    this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = value == current;
    final activeColor = color ?? AppColors.of(context).primary;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isActive
              ? activeColor.withOpacity(0.2)
              : AppColors.of(context).surfaceVariant,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: isActive ? activeColor : AppColors.of(context).border),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? activeColor : AppColors.of(context).textSecondary,
            fontSize: 13,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _ReminderCard extends ConsumerWidget {
  final ReminderModel reminder;
  const _ReminderCard({required this.reminder});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Color statusColor;
    String statusLabel;
    switch (reminder.status) {
      case 'scheduled':
        statusColor = AppColors.of(context).scheduled;
        statusLabel = 'Planlandı';
        break;
      case 'sent':
        statusColor = AppColors.of(context).sent;
        statusLabel = 'Gönderildi';
        break;
      case 'paused':
        statusColor = AppColors.of(context).paused;
        statusLabel = 'Beklemede';
        break;
      default:
        statusColor = AppColors.of(context).failed;
        statusLabel = 'Başarısız';
    }

    return Dismissible(
      key: Key(reminder.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.of(context).error.withOpacity(0.15),
          borderRadius: BorderRadius.circular(14),
          border:
              Border.all(color: AppColors.of(context).error.withOpacity(0.3)),
        ),
        child: Icon(Icons.delete_rounded, color: AppColors.of(context).error),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppColors.of(context).surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            title: Text(
              'Silmek istiyor musunuz?',
              style: TextStyle(color: AppColors.of(context).textPrimary),
            ),
            content: Text(
              'Bu işlem geri alınamaz.',
              style: TextStyle(color: AppColors.of(context).textSecondary),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(false),
                child: const Text('İptal'),
              ),
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(true),
                child: Text(
                  'Sil',
                  style: TextStyle(color: AppColors.of(context).error),
                ),
              ),
            ],
          ),
        );
      },
      onDismissed: (_) async {
        await ref.read(remindersProvider.notifier).delete(reminder.id);
        if (context.mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Hatırlatıcı silindi')));
        }
      },
      child: GestureDetector(
        onTap: () => context.push('/reminders/edit/${reminder.id}'),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.of(context).cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.of(context).border),
          ),
          child: Row(
            children: [
              // Status bar
              Container(
                width: 4,
                height: 52,
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
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            reminder.title,
                            style: TextStyle(
                              color: AppColors.of(context).textPrimary,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
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
                        const Spacer(),
                        ...reminder.channels.map((ch) {
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
                            padding: const EdgeInsets.only(left: 6),
                            child: Icon(icon, color: color, size: 14),
                          );
                        }),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Pause/resume toggle
              if (reminder.isScheduled || reminder.isPaused)
                GestureDetector(
                  onTap: () async {
                    final newStatus =
                        reminder.isScheduled ? 'paused' : 'scheduled';
                    await ref
                        .read(remindersProvider.notifier)
                        .updateStatus(reminder.id, newStatus);
                  },
                  child: Icon(
                    reminder.isScheduled
                        ? Icons.pause_circle_rounded
                        : Icons.play_circle_rounded,
                    color: reminder.isScheduled
                        ? AppColors.of(context).paused
                        : AppColors.of(context).success,
                    size: 28,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.of(context).surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.notifications_off_outlined,
              color: AppColors.of(context).textMuted,
              size: 40,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Hatırlatıcı bulunamadı',
            style: TextStyle(
              color: AppColors.of(context).textSecondary,
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Yeni oluşturun veya filtreleri değiştirin',
            style:
                TextStyle(color: AppColors.of(context).textMuted, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline,
              color: AppColors.of(context).error, size: 48),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.of(context).textSecondary),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Tekrar Dene'),
          ),
        ],
      ),
    );
  }
}

class _ShimmerItem extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.of(context).cardBg,
        borderRadius: BorderRadius.circular(14),
      ),
    );
  }
}
