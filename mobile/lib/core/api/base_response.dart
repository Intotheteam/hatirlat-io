class BaseResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final Map<String, dynamic>? error;

  const BaseResponse({
    required this.success,
    this.data,
    this.message,
    this.error,
  });

  factory BaseResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json) fromJsonT,
  ) {
    return BaseResponse<T>(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      message: json['message'] as String?,
      error: json['error'] as Map<String, dynamic>?,
    );
  }

  String? get errorMessage =>
      error?['message'] as String? ?? message ?? 'An error occurred';
}
