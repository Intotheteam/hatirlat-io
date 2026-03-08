import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../data/group_repository.dart';
import '../../../core/theme/app_theme.dart';

class GroupDetailScreen extends StatefulWidget {
  final String groupId;
  const GroupDetailScreen({super.key, required this.groupId});

  @override
  State<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends State<GroupDetailScreen> {
  final _repo = GroupRepository();
  List<Map<String, dynamic>> _members = [];
  Map<String, dynamic>? _groupInfo;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  Future<void> _loadMembers() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final members = await _repo.getMembers(widget.groupId);
      final groupInfo = await _repo.getById(widget.groupId);
      setState(() {
        _members = members;
        _groupInfo = groupInfo;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _showInviteDialog() async {
    final code = _groupInfo?['inviteCode']?.toString() ?? 'Bilinmiyor';

    await showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.of(context).surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.of(context).border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 24),
                Icon(Icons.qr_code_2_rounded,
                    size: 64, color: AppColors.of(context).primary),
                const SizedBox(height: 16),
                Text(
                  'Gruba Davet Et',
                  style: TextStyle(
                    color: AppColors.of(context).textPrimary,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Aşağıdaki kodu paylaşarak arkadaşlarınızı bu gruba davet edebilirsiniz.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.of(context).textSecondary),
                ),
                const SizedBox(height: 32),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.of(context).surfaceVariant,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: AppColors.of(context).primary.withOpacity(0.5)),
                  ),
                  child: Text(
                    code,
                    style: TextStyle(
                      color: AppColors.of(context).primary,
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 4,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      final link = 'https://app.hatirlat.com/invite/$code';
                      Share.share(
                        'Hatırlat.io uygulamasında "${_groupInfo?['name'] ?? ''}" grubuna katılmak için şu linke tıkla: $link',
                        subject: 'Hatırlat.io Grup Daveti',
                      );
                      Navigator.of(ctx).pop();
                    },
                    icon: const Icon(Icons.share_rounded),
                    label: const Text('Davet Linkini Paylaş'),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: code));
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Davet kodu panoya kopyalandı')),
                      );
                    },
                    icon: const Icon(Icons.copy_rounded),
                    label: const Text('Sadece Kodu Kopyala'),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _removeMember(String memberId, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.of(context).surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Üyeyi Çıkar',
          style: TextStyle(color: AppColors.of(context).textPrimary),
        ),
        content: Text(
          '"$name" üyeyi gruptan çıkarmak istiyor musunuz?',
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
              'Çıkar',
              style: TextStyle(color: AppColors.of(context).error),
            ),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await _repo.removeMember(widget.groupId, memberId);
      await _loadMembers();
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Üye çıkarıldı')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      appBar: AppBar(
        title: Text(_groupInfo?['name'] ?? 'Grup Detayı'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded),
            onPressed: _showInviteDialog,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: AppColors.of(context).error,
                        size: 48,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: TextStyle(
                            color: AppColors.of(context).textSecondary),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _loadMembers,
                        child: const Text('Tekrar Dene'),
                      ),
                    ],
                  ),
                )
              : _members.isEmpty
                  ? Center(
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
                              Icons.person_off_rounded,
                              color: AppColors.of(context).textMuted,
                              size: 40,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Henüz üye yok',
                            style: TextStyle(
                              color: AppColors.of(context).textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _showInviteDialog,
                            icon: const Icon(Icons.group_add_rounded),
                            label: const Text('Davet Et'),
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(140, 48),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: _members.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (ctx, i) {
                        final m = _members[i];
                        final id = m['id']?.toString() ?? '';
                        final name = m['name']?.toString() ?? '';
                        final email = m['email']?.toString() ?? '';
                        final role = m['role']?.toString() ?? 'Member';
                        final isAdmin = role == 'Admin';
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.of(context).cardBg,
                            borderRadius: BorderRadius.circular(14),
                            border:
                                Border.all(color: AppColors.of(context).border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: (isAdmin
                                          ? AppColors.of(context).secondary
                                          : AppColors.of(context).primary)
                                      .withOpacity(0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    name.isNotEmpty
                                        ? name[0].toUpperCase()
                                        : '?',
                                    style: TextStyle(
                                      color: isAdmin
                                          ? AppColors.of(context).secondary
                                          : AppColors.of(context).primary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 18,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: TextStyle(
                                        color:
                                            AppColors.of(context).textPrimary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    if (email.isNotEmpty)
                                      Text(
                                        email,
                                        style: TextStyle(
                                          color:
                                              AppColors.of(context).textMuted,
                                          fontSize: 12,
                                        ),
                                      ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: (isAdmin
                                                ? AppColors.of(context)
                                                    .secondary
                                                : AppColors.of(context).primary)
                                            .withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        isAdmin ? 'Yönetici' : 'Üye',
                                        style: TextStyle(
                                          color: isAdmin
                                              ? AppColors.of(context).secondary
                                              : AppColors.of(context).primary,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: Icon(
                                  Icons.remove_circle_outline_rounded,
                                  color: AppColors.of(context).error,
                                  size: 22,
                                ),
                                onPressed: () => _removeMember(id, name),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
      floatingActionButton: _members.isNotEmpty
          ? FloatingActionButton(
              onPressed: _showInviteDialog,
              backgroundColor: AppColors.of(context).primary, // Temadan al
              foregroundColor: Colors.white,
              mini: true,
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius:
                    BorderRadius.circular(20), // Smaller pill for mini FAB
              ),
              child: const Icon(Icons.share_rounded),
            )
          : null,
    );
  }
}
