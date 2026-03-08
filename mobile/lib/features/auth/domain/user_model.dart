class UserModel {
  final String id;
  final String username;
  final String email;
  final String role;
  final bool premium;
  final int credits;
  final String? createdAt;

  const UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.premium,
    required this.credits,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'USER',
      premium: json['premium'] as bool? ?? false,
      credits: json['credits'] as int? ?? 0,
      createdAt: json['createdAt']?.toString(),
    );
  }

  bool get isAdmin => role == 'ADMIN';
}
