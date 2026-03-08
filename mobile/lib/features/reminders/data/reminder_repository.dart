import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/base_response.dart';
import '../domain/reminder_model.dart';

class ReminderRepository {
  final Dio _dio;

  ReminderRepository() : _dio = buildDio();

  Future<List<ReminderModel>> getAll() async {
    try {
      final response = await _dio.get('/reminders');
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => (json as List<dynamic>)
            .map((e) => ReminderModel.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
      return wrapper.data ?? [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<ReminderModel> getById(String id) async {
    try {
      final response = await _dio.get('/reminders/$id');
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => ReminderModel.fromJson(json as Map<String, dynamic>),
      );
      return wrapper.data!;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<ReminderModel> create(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/reminders', data: data);
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => ReminderModel.fromJson(json as Map<String, dynamic>),
      );
      return wrapper.data!;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<ReminderModel> update(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/reminders/$id', data: data);
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => ReminderModel.fromJson(json as Map<String, dynamic>),
      );
      return wrapper.data!;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> updateStatus(String id, String status) async {
    try {
      await _dio.put('/reminders/$id/status', data: {'status': status});
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete('/reminders/$id');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
