import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class StorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<void> saveToken(String token) async {
    await _storage.write(key: kJwtTokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return _storage.read(key: kJwtTokenKey);
  }

  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: kRefreshTokenKey, value: token);
  }

  static Future<String?> getRefreshToken() async {
    return _storage.read(key: kRefreshTokenKey);
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
