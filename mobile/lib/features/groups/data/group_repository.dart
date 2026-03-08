import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/base_response.dart';

class GroupRepository {
  final Dio _dio;

  GroupRepository() : _dio = buildDio();

  Future<List<Map<String, dynamic>>> getAll() async {
    try {
      final response = await _dio.get('/groups');
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => (json as List<dynamic>)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList(),
      );
      return wrapper.data ?? [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Map<String, dynamic>> getById(String id) async {
    try {
      final response = await _dio.get('/groups/$id');
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => Map<String, dynamic>.from(json as Map),
      );
      return wrapper.data!;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Map<String, dynamic>> create(String name, String? description) async {
    try {
      final response = await _dio.post(
        '/groups',
        data: {
          'name': name,
          if (description != null && description.isNotEmpty)
            'description': description,
        },
      );
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => Map<String, dynamic>.from(json as Map),
      );
      return wrapper.data!;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete('/groups/$id');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<List<Map<String, dynamic>>> getMembers(String groupId) async {
    try {
      final response = await _dio.get('/groups/$groupId/members');
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => (json as List<dynamic>)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList(),
      );
      return wrapper.data ?? [];
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Map<String, dynamic>> addMember(
    String groupId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.post('/groups/$groupId/members', data: data);
      final wrapper = BaseResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => Map<String, dynamic>.from(json as Map),
      );
      return wrapper.data!;
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> removeMember(String groupId, String memberId) async {
    try {
      await _dio.delete('/groups/$groupId/members/$memberId');
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> join(String code, Map<String, dynamic> data) async {
    try {
      await _dio.post('/public/invite/$code/join', data: data);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
