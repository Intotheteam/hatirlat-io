class ReminderModel {
  final String id;
  final String title;
  final String type; // "personal" | "group"
  final String message;
  final String dateTime; // "yyyy-MM-ddTHH:mm:ss"
  final String status; // "scheduled" | "sent" | "paused" | "failed"
  final ContactInfo? contact;
  final GroupInfo? group;
  final List<String> channels; // ["email", "sms", "whatsapp"]
  final String repeat; // "none" | "hourly" | "daily" | "weekly" | "custom"

  const ReminderModel({
    required this.id,
    required this.title,
    required this.type,
    required this.message,
    required this.dateTime,
    required this.status,
    this.contact,
    this.group,
    required this.channels,
    required this.repeat,
  });

  factory ReminderModel.fromJson(Map<String, dynamic> json) {
    return ReminderModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      type: json['type']?.toString() ?? 'personal',
      message: json['message']?.toString() ?? '',
      dateTime: json['dateTime']?.toString() ?? '',
      status: json['status']?.toString() ?? 'scheduled',
      contact: json['contact'] != null
          ? ContactInfo.fromJson(json['contact'] as Map<String, dynamic>)
          : null,
      group: json['group'] != null
          ? GroupInfo.fromJson(json['group'] as Map<String, dynamic>)
          : null,
      channels:
          (json['channels'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      repeat: json['repeat']?.toString() ?? 'none',
    );
  }

  Map<String, dynamic> toJson() => {
    'title': title,
    'type': type,
    'message': message,
    'dateTime': dateTime,
    'status': status,
    if (contact != null) 'contact': contact!.toJson(),
    if (group != null) 'groupId': group!.id,
    'channels': channels,
    'repeat': repeat,
  };

  bool get isScheduled => status == 'scheduled';
  bool get isSent => status == 'sent';
  bool get isPaused => status == 'paused';
  bool get isFailed => status == 'failed';
  bool get isPersonal => type == 'personal';
}

class ContactInfo {
  final String name;
  final String? phone;
  final String? email;

  const ContactInfo({required this.name, this.phone, this.email});

  factory ContactInfo.fromJson(Map<String, dynamic> json) => ContactInfo(
    name: json['name']?.toString() ?? '',
    phone: json['phone']?.toString(),
    email: json['email']?.toString(),
  );

  Map<String, dynamic> toJson() => {
    'name': name,
    if (phone != null) 'phone': phone,
    if (email != null) 'email': email,
  };
}

class GroupInfo {
  final String id;
  final String name;
  final int? memberCount;

  const GroupInfo({required this.id, required this.name, this.memberCount});

  factory GroupInfo.fromJson(Map<String, dynamic> json) => GroupInfo(
    id: json['id']?.toString() ?? '',
    name: json['name']?.toString() ?? '',
    memberCount: json['memberCount'] as int?,
  );
}
