import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);
    await ref.read(authProvider.notifier).register(
          _usernameCtrl.text.trim(),
          _emailCtrl.text.trim(),
          _passwordCtrl.text,
        );

    if (!mounted) return;
    final state = ref.read(authProvider);
    if (state is AuthError) {
      setState(() => _errorMessage = state.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authProvider) is AuthLoading;

    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 48),
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppColors.of(context).primaryGradient,
                    ),
                    child: const Icon(
                      Icons.notifications_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Hatirlat',
                    style: TextStyle(
                      color: AppColors.of(context).textPrimary,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ).animate().fadeIn(),
              const SizedBox(height: 40),
              Text(
                'Hesap\nOluşturun 🚀',
                style: TextStyle(
                  color: AppColors.of(context).textPrimary,
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  height: 1.2,
                  letterSpacing: -0.5,
                ),
              ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.3, end: 0),
              const SizedBox(height: 8),
              Text(
                'Ücretsiz hesabınızı oluşturun',
                style: TextStyle(
                    color: AppColors.of(context).textSecondary, fontSize: 16),
              ).animate().fadeIn(delay: 200.ms),
              const SizedBox(height: 40),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _usernameCtrl,
                      style: const TextStyle(
                          color: AppColors.of(context).textPrimary),
                      decoration: InputDecoration(
                        labelText: 'Kullanıcı Adı',
                        prefixIcon: Icon(
                          Icons.person_outline_rounded,
                          color: AppColors.of(context).textSecondary,
                        ),
                      ),
                      validator: (v) => (v == null || v.isEmpty)
                          ? 'Bu alan zorunludur'
                          : null,
                      textInputAction: TextInputAction.next,
                    ).animate().fadeIn(delay: 300.ms),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(
                          color: AppColors.of(context).textPrimary),
                      decoration: InputDecoration(
                        labelText: 'E-posta',
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: AppColors.of(context).textSecondary,
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Bu alan zorunludur';
                        if (!v.contains('@')) return 'Geçerli e-posta girin';
                        return null;
                      },
                      textInputAction: TextInputAction.next,
                    ).animate().fadeIn(delay: 350.ms),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordCtrl,
                      obscureText: _obscurePassword,
                      style: const TextStyle(
                          color: AppColors.of(context).textPrimary),
                      decoration: InputDecoration(
                        labelText: 'Şifre',
                        prefixIcon: Icon(
                          Icons.lock_outline_rounded,
                          color: AppColors.of(context).textSecondary,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: AppColors.of(context).textSecondary,
                          ),
                          onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword,
                          ),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Bu alan zorunludur';
                        if (v.length < 6) return 'En az 6 karakter olmalı';
                        return null;
                      },
                      onFieldSubmitted: (_) => _submit(),
                    ).animate().fadeIn(delay: 400.ms),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.of(context).error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: AppColors.of(context).error.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.error_outline,
                              color: AppColors.of(context).error,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: AppColors.of(context).error,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 28),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Hesap Oluştur',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                    ).animate().fadeIn(delay: 450.ms),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Zaten hesabınız var mı?',
                          style: TextStyle(
                              color: AppColors.of(context).textSecondary),
                        ),
                        TextButton(
                          onPressed: () => context.go('/login'),
                          child: Text(
                            'Giriş Yap',
                            style: TextStyle(
                              color: AppColors.of(context).primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ).animate().fadeIn(delay: 500.ms),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
