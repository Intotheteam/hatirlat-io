import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/reminders_provider.dart';
import '../../groups/data/group_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class CreateEditReminderScreen extends ConsumerStatefulWidget {
  final String? reminderId;
  const CreateEditReminderScreen({super.key, this.reminderId});

  @override
  ConsumerState<CreateEditReminderScreen> createState() =>
      _CreateEditReminderScreenState();
}

class _CreateEditReminderScreenState
    extends ConsumerState<CreateEditReminderScreen> {
  final _formKey = GlobalKey<FormState>();
  int _step = 0;
  bool _isLoading = false;
  bool _isFetchingEdit = false;

  // Form state
  final _titleCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  String _type = 'personal';
  String _repeat = 'none';
  List<String> _channels = [];
  DateTime _dateTime = DateTime.now().add(const Duration(hours: 1));

  // Personal contact
  final _contactNameCtrl = TextEditingController();
  final _contactEmailCtrl = TextEditingController();
  final _contactPhoneCtrl = TextEditingController();

  // Group
  String? _selectedGroupId;
  List<Map<String, dynamic>> _groups = [];

  bool get _isEdit => widget.reminderId != null;

  @override
  void initState() {
    super.initState();
    _loadGroups();
    if (_isEdit) _loadExisting();
  }

  Future<void> _loadGroups() async {
    try {
      final repo = GroupRepository();
      final groups = await repo.getAll();
      if (mounted) setState(() => _groups = groups);
    } catch (_) {}
  }

  Future<void> _loadExisting() async {
    setState(() => _isFetchingEdit = true);
    try {
      final reminders = ref.read(remindersProvider).reminders;
      final existing = reminders.firstWhere(
        (r) => r.id == widget.reminderId,
        orElse: () => throw Exception('Not found'),
      );
      _titleCtrl.text = existing.title;
      _messageCtrl.text = existing.message;
      _type = existing.type;
      _repeat = existing.repeat;
      _channels = List.from(existing.channels);
      if (existing.contact != null) {
        _contactNameCtrl.text = existing.contact!.name;
        _contactEmailCtrl.text = existing.contact!.email ?? '';
        _contactPhoneCtrl.text = existing.contact!.phone ?? '';
      }
      if (existing.group != null) {
        _selectedGroupId = existing.group!.id;
      }
      try {
        _dateTime = DateTime.parse(existing.dateTime);
      } catch (_) {}
    } catch (_) {}
    if (mounted) setState(() => _isFetchingEdit = false);
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _messageCtrl.dispose();
    _contactNameCtrl.dispose();
    _contactEmailCtrl.dispose();
    _contactPhoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _dateTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: ColorScheme.dark(
            primary: AppColors.of(context).primary,
            surface: AppColors.of(context).surface,
          ),
        ),
        child: child!,
      ),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_dateTime),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: ColorScheme.dark(
            primary: AppColors.of(context).primary,
            surface: AppColors.of(context).surface,
          ),
        ),
        child: child!,
      ),
    );
    if (time == null) return;
    setState(() {
      _dateTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }

  bool _validateStep() {
    switch (_step) {
      case 0:
        return _formKey.currentState?.validate() ?? false;
      case 1:
        return true;
      case 2:
        if (_channels.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('En az bir kanal seçin')),
          );
          return false;
        }
        return true;
      case 3:
        if (_type == 'personal') {
          if (_contactNameCtrl.text.isEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Kişi adı zorunludur')),
            );
            return false;
          }
        } else {
          if (_selectedGroupId == null) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(const SnackBar(content: Text('Grup seçin')));
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  }

  void _nextStep() {
    if (!_validateStep()) return;
    if (_step < 4) {
      setState(() => _step++);
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    setState(() => _isLoading = true);
    try {
      final dtStr =
          '${_dateTime.year.toString().padLeft(4, '0')}-${_dateTime.month.toString().padLeft(2, '0')}-${_dateTime.day.toString().padLeft(2, '0')}T${_dateTime.hour.toString().padLeft(2, '0')}:${_dateTime.minute.toString().padLeft(2, '0')}:00';

      final data = <String, dynamic>{
        'title': _titleCtrl.text.trim(),
        'message': _messageCtrl.text.trim(),
        'type': _type,
        'dateTime': dtStr,
        'status': 'scheduled',
        'channels': _channels,
        'repeat': _repeat,
        if (_type == 'personal')
          'contact': {
            'name': _contactNameCtrl.text.trim(),
            if (_contactEmailCtrl.text.isNotEmpty)
              'email': _contactEmailCtrl.text.trim(),
            if (_contactPhoneCtrl.text.isNotEmpty)
              'phone': _contactPhoneCtrl.text.trim(),
          },
        if (_type == 'group') 'groupId': _selectedGroupId,
      };

      bool success;
      if (_isEdit) {
        success = await ref
            .read(remindersProvider.notifier)
            .update(widget.reminderId!, data);
      } else {
        final created = await ref.read(remindersProvider.notifier).create(data);
        success = created != null;
      }

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isEdit ? 'Hatırlatıcı güncellendi' : 'Hatırlatıcı oluşturuldu',
            ),
          ),
        );
        context.pop();
      } else if (mounted) {
        final error = ref.read(remindersProvider).error;
        if (error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error)),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isFetchingEdit) {
      return Scaffold(
        backgroundColor: AppColors.of(context).background,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final steps = ['Temel', 'Tarih/Saat', 'Kanallar', 'Alıcı', 'Tekrar'];

    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      appBar: AppBar(
        title: Text(_isEdit ? 'Hatırlatıcıyı Düzenle' : 'Yeni Hatırlatıcı'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Step indicator
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Row(
              children: List.generate(steps.length, (i) {
                final isDone = i < _step;
                final isCurrent = i == _step;
                return Expanded(
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: isDone || isCurrent
                                ? AppColors.of(context).primary
                                : AppColors.of(context).border,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      if (i < steps.length - 1) const SizedBox(width: 4),
                    ],
                  ),
                );
              }),
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: [
                Text(
                  'Adım ${_step + 1}/${steps.length}',
                  style: TextStyle(
                    color: AppColors.of(context).textMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  steps[_step],
                  style: TextStyle(
                    color: AppColors.of(context).primary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),

          // Step content
          Expanded(
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _buildStep(),
              ),
            ),
          ),

          // Navigation buttons
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
            decoration: BoxDecoration(
              color: AppColors.of(context).surface,
              border:
                  Border(top: BorderSide(color: AppColors.of(context).border)),
            ),
            child: Row(
              children: [
                if (_step > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _step--),
                      child: const Text('Geri'),
                    ),
                  ),
                if (_step > 0) const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _nextStep,
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            _step < 4
                                ? 'İleri'
                                : (_isEdit ? 'Güncelle' : 'Oluştur'),
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return _buildBasicStep();
      case 1:
        return _buildDateTimeStep();
      case 2:
        return _buildChannelsStep();
      case 3:
        return _buildRecipientStep();
      case 4:
        return _buildRepeatStep();
      default:
        return const SizedBox();
    }
  }

  Widget _buildBasicStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle(icon: Icons.edit_rounded, title: 'Temel Bilgiler'),
        const SizedBox(height: 20),
        TextFormField(
          controller: _titleCtrl,
          style: TextStyle(color: AppColors.of(context).textPrimary),
          decoration: InputDecoration(
            labelText: 'Başlık',
            hintText: 'Hatırlatıcı başlığı',
            prefixIcon: Icon(
              Icons.title_rounded,
              color: AppColors.of(context).textSecondary,
            ),
          ),
          validator: (v) =>
              (v == null || v.isEmpty) ? 'Başlık zorunludur' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _messageCtrl,
          maxLines: 4,
          style: TextStyle(color: AppColors.of(context).textPrimary),
          decoration: InputDecoration(
            labelText: 'Mesaj',
            hintText: 'Gönderilecek mesaj...',
            prefixIcon: Icon(
              Icons.message_rounded,
              color: AppColors.of(context).textSecondary,
            ),
            alignLabelWithHint: true,
          ),
          validator: (v) =>
              (v == null || v.isEmpty) ? 'Mesaj zorunludur' : null,
        ),
        const SizedBox(height: 16),
        _SectionLabel(label: 'Tür'),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _TypeOption(
                label: 'Kişisel',
                icon: Icons.person_rounded,
                value: 'personal',
                selected: _type,
                onTap: () => setState(() => _type = 'personal'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _TypeOption(
                label: 'Grup',
                icon: Icons.group_rounded,
                value: 'group',
                selected: _type,
                onTap: () => setState(() => _type = 'group'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildDateTimeStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle(
          icon: Icons.calendar_today_rounded,
          title: 'Tarih ve Saat',
        ),
        const SizedBox(height: 24),
        GestureDetector(
          onTap: _pickDateTime,
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.of(context).surfaceVariant,
              borderRadius: BorderRadius.circular(14),
              border:
                  Border.all(color: AppColors.of(context).primary, width: 1.5),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.of(context).primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.event_rounded,
                    color: AppColors.of(context).primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Seçilen Tarih ve Saat',
                        style: TextStyle(
                          color: AppColors.of(context).textMuted,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_dateTime.day.toString().padLeft(2, '0')}.${_dateTime.month.toString().padLeft(2, '0')}.${_dateTime.year}  ${_dateTime.hour.toString().padLeft(2, '0')}:${_dateTime.minute.toString().padLeft(2, '0')}',
                        style: TextStyle(
                          color: AppColors.of(context).textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.edit_calendar_rounded,
                  color: AppColors.of(context).primary,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildChannelsStep() {
    final channelOptions = [
      {
        'value': 'email',
        'label': 'E-posta',
        'icon': Icons.email_rounded,
        'color': AppColors.of(context).accent,
      },
      {
        'value': 'sms',
        'label': 'SMS',
        'icon': Icons.sms_rounded,
        'color': AppColors.of(context).success,
      },
      {
        'value': 'whatsapp',
        'label': 'WhatsApp',
        'icon': Icons.chat_rounded,
        'color': const Color(0xFF25D366),
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle(icon: Icons.send_rounded, title: 'Bildirim Kanalları'),
        const SizedBox(height: 8),
        Text(
          'En az bir kanal seçin',
          style: TextStyle(
              color: AppColors.of(context).textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 20),
        ...channelOptions.map((ch) {
          final val = ch['value'] as String;
          final selected = _channels.contains(val);
          return GestureDetector(
            onTap: () {
              setState(() {
                if (selected) {
                  _channels.remove(val);
                } else {
                  _channels.add(val);
                }
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: selected
                    ? (ch['color'] as Color).withOpacity(0.1)
                    : AppColors.of(context).surfaceVariant,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: selected
                      ? ch['color'] as Color
                      : AppColors.of(context).border,
                  width: selected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    ch['icon'] as IconData,
                    color: ch['color'] as Color,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    ch['label'] as String,
                    style: TextStyle(
                      color: selected
                          ? ch['color'] as Color
                          : AppColors.of(context).textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  const Spacer(),
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color:
                          selected ? ch['color'] as Color : Colors.transparent,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected
                            ? ch['color'] as Color
                            : AppColors.of(context).border,
                        width: 2,
                      ),
                    ),
                    child: selected
                        ? const Icon(
                            Icons.check_rounded,
                            color: Colors.white,
                            size: 14,
                          )
                        : null,
                  ),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildRecipientStep() {
    if (_type == 'group') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _StepTitle(icon: Icons.group_rounded, title: 'Grup Seç'),
          const SizedBox(height: 20),
          if (_groups.isEmpty)
            Center(
              child: Text(
                'Grup bulunamadı',
                style: TextStyle(color: AppColors.of(context).textSecondary),
              ),
            )
          else
            ..._groups.map((g) {
              final id = g['id']?.toString() ?? '';
              final name = g['name']?.toString() ?? '';
              final selected = id == _selectedGroupId;
              return GestureDetector(
                onTap: () => setState(() => _selectedGroupId = id),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: selected
                        ? AppColors.of(context).primary.withOpacity(0.1)
                        : AppColors.of(context).surfaceVariant,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: selected
                          ? AppColors.of(context).primary
                          : AppColors.of(context).border,
                      width: selected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.group_rounded,
                          color: AppColors.of(context).primary),
                      const SizedBox(width: 12),
                      Text(
                        name,
                        style: TextStyle(
                          color: selected
                              ? AppColors.of(context).primary
                              : AppColors.of(context).textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      if (selected)
                        Icon(
                          Icons.check_circle_rounded,
                          color: AppColors.of(context).primary,
                        ),
                    ],
                  ),
                ),
              );
            }),
          const SizedBox(height: 20),
        ],
      );
    }

    // Personal contact
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle(
          icon: Icons.person_rounded,
          title: 'İletişim Bilgileri',
        ),
        const SizedBox(height: 20),
        TextFormField(
          controller: _contactNameCtrl,
          style: TextStyle(color: AppColors.of(context).textPrimary),
          decoration: InputDecoration(
            labelText: 'Ad Soyad *',
            prefixIcon: Icon(
              Icons.person_outline_rounded,
              color: AppColors.of(context).textSecondary,
            ),
          ),
        ),
        const SizedBox(height: 14),
        TextFormField(
          controller: _contactEmailCtrl,
          keyboardType: TextInputType.emailAddress,
          style: TextStyle(color: AppColors.of(context).textPrimary),
          decoration: InputDecoration(
            labelText: 'E-posta',
            prefixIcon: Icon(
              Icons.email_outlined,
              color: AppColors.of(context).textSecondary,
            ),
          ),
        ),
        const SizedBox(height: 14),
        TextFormField(
          controller: _contactPhoneCtrl,
          keyboardType: TextInputType.phone,
          style: TextStyle(color: AppColors.of(context).textPrimary),
          decoration: InputDecoration(
            labelText: 'Telefon',
            hintText: '+90 5xx xxx xx xx',
            prefixIcon: Icon(
              Icons.phone_outlined,
              color: AppColors.of(context).textSecondary,
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildRepeatStep() {
    final authState = ref.watch(authProvider);
    final isPremium =
        authState is AuthAuthenticated ? authState.user.premium : false;

    final options = [
      ('none', 'Yok', Icons.block_rounded, false),
      ('hourly', 'Saatlik', Icons.update_rounded, true), // Requires premium
      ('daily', 'Günlük', Icons.today_rounded, false),
      ('weekly', 'Haftalık', Icons.date_range_rounded, false),
      ('custom', 'Özel', Icons.settings_rounded, false),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle(icon: Icons.repeat_rounded, title: 'Tekrar Seçeneği'),
        const SizedBox(height: 20),
        ...options.map((opt) {
          final (value, label, icon, reqPremium) = opt;
          final selected = _repeat == value;
          final isLocked = reqPremium && !isPremium;

          return GestureDetector(
            onTap: () {
              if (isLocked) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text(
                          'Saatlik hatırlatmalar sadece Premium üyeler içindir.')),
                );
                return;
              }
              setState(() => _repeat = value);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: selected
                    ? AppColors.of(context).primary.withOpacity(0.1)
                    : AppColors.of(context).surfaceVariant,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: selected
                      ? AppColors.of(context).primary
                      : AppColors.of(context).border,
                  width: selected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    icon,
                    color: isLocked
                        ? AppColors.of(context).border
                        : selected
                            ? AppColors.of(context).primary
                            : AppColors.of(context).textSecondary,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: TextStyle(
                      color: isLocked
                          ? AppColors.of(context).textMuted
                          : selected
                              ? AppColors.of(context).primary
                              : AppColors.of(context).textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (isLocked) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.of(context).accent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'PREMIUM',
                        style: TextStyle(
                          color: AppColors.of(context).accent,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (selected)
                    Icon(
                      Icons.check_circle_rounded,
                      color: AppColors.of(context).primary,
                    )
                  else if (isLocked)
                    Icon(
                      Icons.lock_rounded,
                      color: AppColors.of(context).border,
                      size: 18,
                    ),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 20),
      ],
    );
  }
}

class _StepTitle extends StatelessWidget {
  final IconData icon;
  final String title;
  const _StepTitle({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.of(context).primary.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.of(context).primary, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: TextStyle(
            color: AppColors.of(context).textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _TypeOption extends StatelessWidget {
  final String label;
  final IconData icon;
  final String value;
  final String selected;
  final VoidCallback onTap;

  const _TypeOption({
    required this.label,
    required this.icon,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == selected;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.of(context).primary.withOpacity(0.15)
              : AppColors.of(context).surfaceVariant,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? AppColors.of(context).primary
                : AppColors.of(context).border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? AppColors.of(context).primary
                  : AppColors.of(context).textSecondary,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected
                    ? AppColors.of(context).primary
                    : AppColors.of(context).textSecondary,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: TextStyle(
        color: AppColors.of(context).textSecondary,
        fontSize: 13,
        fontWeight: FontWeight.w500,
      ),
    );
  }
}
