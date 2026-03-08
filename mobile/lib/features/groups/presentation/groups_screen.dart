import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../data/group_repository.dart';
import '../../../core/theme/app_theme.dart';

class GroupsScreen extends StatefulWidget {
  const GroupsScreen({super.key});

  @override
  State<GroupsScreen> createState() => _GroupsScreenState();
}

class _GroupsScreenState extends State<GroupsScreen> {
  final _repo = GroupRepository();
  List<Map<String, dynamic>> _groups = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final groups = await _repo.getAll();
      setState(() {
        _groups = groups;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _showCreateDialog() async {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();

    await showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.of(context).surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.of(context).border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Yeni Grup Oluştur',
              style: TextStyle(
                color: AppColors.of(context).textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: nameCtrl,
              style: TextStyle(color: AppColors.of(context).textPrimary),
              decoration: const InputDecoration(
                labelText: 'Grup Adı *',
                hintText: 'örn. Proje Ekibi',
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: descCtrl,
              style: TextStyle(color: AppColors.of(context).textPrimary),
              decoration: const InputDecoration(labelText: 'Açıklama'),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (nameCtrl.text.isEmpty) return;
                  try {
                    await _repo.create(
                      nameCtrl.text.trim(),
                      descCtrl.text.trim(),
                    );
                    if (ctx.mounted) Navigator.of(ctx).pop();
                    await _load();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Grup oluşturuldu')),
                      );
                    }
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(
                        ctx,
                      ).showSnackBar(SnackBar(content: Text(e.toString())));
                    }
                  }
                },
                child: const Text(
                  'Oluştur',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showJoinDialog() async {
    final codeCtrl = TextEditingController();

    await showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.of(context).surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.of(context).border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Davet Kodu ile Katıl',
              style: TextStyle(
                color: AppColors.of(context).textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: codeCtrl,
              style: TextStyle(color: AppColors.of(context).textPrimary),
              decoration: const InputDecoration(
                labelText: 'Davet Kodu *',
                hintText: 'örn. aB3xY9',
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (codeCtrl.text.isEmpty) return;
                  try {
                    await _repo.join(codeCtrl.text.trim(), {});
                    if (ctx.mounted) Navigator.of(ctx).pop();
                    await _load();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Gruba başarıyla katıldınız')),
                      );
                    }
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(
                        ctx,
                      ).showSnackBar(SnackBar(content: Text(e.toString())));
                    }
                  }
                },
                child: const Text(
                  'Katıl',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteGroup(String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.of(context).surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Grubu Sil',
          style: TextStyle(color: AppColors.of(context).textPrimary),
        ),
        content: Text(
          '"$name" grubunu silmek istiyor musunuz?',
          style: TextStyle(color: AppColors.of(context).textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('İptal'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text('Sil',
                style: TextStyle(color: AppColors.of(context).error)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await _repo.delete(id);
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
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
                'Gruplar',
                style: TextStyle(
                  color: AppColors.of(context).textPrimary,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
            ),
          ),
          if (_isLoading)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (_, i) => Container(
                    height: 80,
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: AppColors.of(context).cardBg,
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  childCount: 4,
                ),
              ),
            )
          else if (_error != null)
            SliverFillRemaining(
              child: Center(
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
                      style:
                          TextStyle(color: AppColors.of(context).textSecondary),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: _load,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Tekrar Dene'),
                    ),
                  ],
                ),
              ),
            )
          else if (_groups.isEmpty)
            SliverFillRemaining(
              child: Center(
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
                        Icons.group_off_rounded,
                        color: AppColors.of(context).textMuted,
                        size: 40,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Henüz grup yok',
                      style: TextStyle(
                        color: AppColors.of(context).textSecondary,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Toplu bildirim için grup oluşturun',
                      style: TextStyle(
                        color: AppColors.of(context).textMuted,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: _showCreateDialog,
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('Grup Oluştur'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(160, 48),
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _showJoinDialog,
                      icon: const Icon(Icons.group_add_rounded),
                      label: const Text('Davet ile Katıl'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(160, 48),
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
                delegate: SliverChildBuilderDelegate((ctx, i) {
                  final g = _groups[i];
                  final id = g['id']?.toString() ?? '';
                  final name = g['name']?.toString() ?? '';
                  final desc = g['description']?.toString();
                  final memberCount = g['memberCount'] as int? ?? 0;
                  return GestureDetector(
                    onTap: () => context.push('/groups/$id'),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.of(context).cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.of(context).border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.of(context).primary.withOpacity(
                                    0.15,
                                  ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.group_rounded,
                              color: AppColors.of(context).primary,
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
                                    color: AppColors.of(context).textPrimary,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 15,
                                  ),
                                ),
                                if (desc != null && desc.isNotEmpty) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    desc,
                                    style: TextStyle(
                                      color: AppColors.of(context).textMuted,
                                      fontSize: 12,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                                const SizedBox(height: 4),
                                Text(
                                  '$memberCount üye',
                                  style: TextStyle(
                                    color: AppColors.of(context).accent,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              Icons.delete_outline_rounded,
                              color: AppColors.of(context).textMuted,
                              size: 20,
                            ),
                            onPressed: () => _deleteGroup(id, name),
                          ),
                          Icon(
                            Icons.chevron_right_rounded,
                            color: AppColors.of(context).textMuted,
                          ),
                        ],
                      ),
                    )
                        .animate()
                        .fadeIn(delay: (i * 50).ms)
                        .slideX(begin: 0.05, end: 0),
                  );
                }, childCount: _groups.length),
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButton: _groups.isNotEmpty
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FloatingActionButton.small(
                  heroTag: 'join',
                  onPressed: _showJoinDialog,
                  backgroundColor: AppColors.of(context).surfaceVariant,
                  foregroundColor: AppColors.of(context).primary,
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(20), // Smaller pill for small FAB
                  ),
                  child: const Icon(Icons.group_add_rounded),
                ),
                const SizedBox(height: 12),
                FloatingActionButton(
                  heroTag: 'create',
                  onPressed: _showCreateDialog,
                  backgroundColor:
                      AppColors.of(context).primary, // Yeni canlı mavi
                  foregroundColor: Colors.white,
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30), // Pill shape
                  ),
                  child: const Icon(Icons.add_rounded, size: 24),
                ),
              ],
            )
          : null,
    );
  }
}
