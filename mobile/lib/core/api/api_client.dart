import 'package:dio/dio.dart';
import '../constants.dart';
import '../storage/storage_service.dart';

// Singleton Dio instance with JWT interceptor
Dio buildDio() {
  final dio = Dio(
    BaseOptions(
      baseUrl: kApiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await StorageService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (DioException err, handler) async {
        if (err.response?.statusCode == 401) {
          await StorageService.clearAll();
        }
        handler.next(err);
      },
    ),
  );

  // Debug: tüm istek ve yanıtları logla
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    requestHeader: false,
    responseHeader: false,
    error: true,
    logPrint: (o) => print(o),
  ));

  return dio;
}

// Api exception types
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  factory ApiException.fromDio(DioException e) {
    final statusCode = e.response?.statusCode;
    final data = e.response?.data;
    String message;

    if (data is Map && data['error'] != null) {
      message = (data['error'] as Map)['message']?.toString() ?? 'API Error';
    } else if (data is Map && data['message'] != null) {
      message = data['message'].toString();
    } else if (statusCode == 401) {
      message = 'Oturum süresi doldu';
    } else if (statusCode == 429) {
      message = 'Çok fazla istek. Lütfen bekleyin.';
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.connectionError) {
      message = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
    } else {
      message = 'Bir hata oluştu';
    }

    return ApiException(message, statusCode: statusCode);
  }

  @override
  String toString() => message;
}
