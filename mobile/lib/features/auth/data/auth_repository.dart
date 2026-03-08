import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/storage_service.dart';
import '../domain/user_model.dart';

class AuthRepository {
  final Dio _dio;

  AuthRepository() : _dio = buildDio();

  /// Login → backend returns AuthResponse directly (no BaseResponse wrapper)
  /// { token, refreshToken, type, expiresIn, user: {...} }
  Future<UserModel> login(String username, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'username': username, 'password': password},
      );
      final wrapper = response.data as Map<String, dynamic>;
      if (wrapper['success'] != true || wrapper['data'] == null) {
        throw ApiException(wrapper['message']?.toString() ?? 'Giriş başarısız');
      }
      final data = wrapper['data'] as Map<String, dynamic>;
      final token = data['token'] as String?;
      final refreshToken = data['refreshToken'] as String?;
      if (token != null) await StorageService.saveToken(token);
      if (refreshToken != null)
        await StorageService.saveRefreshToken(refreshToken);
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      return user;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  /// Register → backend returns AuthResponse directly (same as login)
  Future<UserModel> register(
    String username,
    String email,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {'username': username, 'email': email, 'password': password},
      );
      final wrapper = response.data as Map<String, dynamic>;
      if (wrapper['success'] != true || wrapper['data'] == null) {
        throw ApiException(wrapper['message']?.toString() ?? 'Kayıt başarısız');
      }
      final data = wrapper['data'] as Map<String, dynamic>;
      final token = data['token'] as String?;
      final refreshToken = data['refreshToken'] as String?;
      if (token != null) await StorageService.saveToken(token);
      if (refreshToken != null)
        await StorageService.saveRefreshToken(refreshToken);
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      return user;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  /// GET /api/auth/me → returns UserResponse directly (no wrapper)
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await _dio.get('/auth/me');
      final wrapper = response.data as Map<String, dynamic>;
      if (wrapper['success'] != true || wrapper['data'] == null) {
        throw ApiException(
            wrapper['message']?.toString() ?? 'Kullanıcı bilgisi alınamadı');
      }
      return UserModel.fromJson(wrapper['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    try {
      await _dio.post(
        '/auth/change-password',
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> logout() async {
    await StorageService.clearAll();
  }
}
