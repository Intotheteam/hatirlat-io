import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import '../domain/user_model.dart';
import '../../../core/storage/storage_service.dart';

// Auth state
sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  const AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthInitial()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    state = const AuthLoading();
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        state = const AuthUnauthenticated();
        return;
      }
      final user = await _repo.getCurrentUser();
      state = AuthAuthenticated(user);
    } catch (_) {
      await StorageService.clearAll();
      state = const AuthUnauthenticated();
    }
  }

  Future<void> login(String username, String password) async {
    state = const AuthLoading();
    try {
      final user = await _repo.login(username, password);
      state = AuthAuthenticated(user);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> register(String username, String email, String password) async {
    state = const AuthLoading();
    try {
      await _repo.register(username, email, password);
      // Auto-login after register
      final user = await _repo.login(username, password);
      state = AuthAuthenticated(user);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthUnauthenticated();
  }

  Future<void> changePassword(String current, String newPass) async {
    await _repo.changePassword(current, newPass);
  }

  UserModel? get currentUser {
    final s = state;
    if (s is AuthAuthenticated) return s.user;
    return null;
  }
}

// Providers
final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(),
);

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authRepositoryProvider));
});
