import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/reminder_repository.dart';
import '../domain/reminder_model.dart';

// State
class RemindersState {
  final List<ReminderModel> reminders;
  final bool isLoading;
  final String? error;
  final String
  filterStatus; // "all" | "scheduled" | "sent" | "paused" | "failed"
  final String filterType; // "all" | "personal" | "group"

  const RemindersState({
    this.reminders = const [],
    this.isLoading = false,
    this.error,
    this.filterStatus = 'all',
    this.filterType = 'all',
  });

  RemindersState copyWith({
    List<ReminderModel>? reminders,
    bool? isLoading,
    String? error,
    String? filterStatus,
    String? filterType,
  }) {
    return RemindersState(
      reminders: reminders ?? this.reminders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      filterStatus: filterStatus ?? this.filterStatus,
      filterType: filterType ?? this.filterType,
    );
  }

  List<ReminderModel> get filtered {
    return reminders.where((r) {
      final statusMatch = filterStatus == 'all' || r.status == filterStatus;
      final typeMatch = filterType == 'all' || r.type == filterType;
      return statusMatch && typeMatch;
    }).toList();
  }
}

// Notifier
class RemindersNotifier extends StateNotifier<RemindersState> {
  final ReminderRepository _repo;

  RemindersNotifier(this._repo) : super(const RemindersState()) {
    loadAll();
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _repo.getAll();
      state = state.copyWith(reminders: list, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<ReminderModel?> create(Map<String, dynamic> data) async {
    try {
      final created = await _repo.create(data);
      state = state.copyWith(reminders: [...state.reminders, created]);
      return created;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<bool> update(String id, Map<String, dynamic> data) async {
    try {
      final updated = await _repo.update(id, data);
      state = state.copyWith(
        reminders: state.reminders
            .map((r) => r.id == id ? updated : r)
            .toList(),
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> updateStatus(String id, String status) async {
    try {
      await _repo.updateStatus(id, status);
      state = state.copyWith(
        reminders: state.reminders
            .map(
              (r) => r.id == id
                  ? ReminderModel(
                      id: r.id,
                      title: r.title,
                      type: r.type,
                      message: r.message,
                      dateTime: r.dateTime,
                      status: status,
                      contact: r.contact,
                      group: r.group,
                      channels: r.channels,
                      repeat: r.repeat,
                    )
                  : r,
            )
            .toList(),
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> delete(String id) async {
    try {
      await _repo.delete(id);
      state = state.copyWith(
        reminders: state.reminders.where((r) => r.id != id).toList(),
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  void setFilterStatus(String status) {
    state = state.copyWith(filterStatus: status);
  }

  void setFilterType(String type) {
    state = state.copyWith(filterType: type);
  }
}

// Providers
final reminderRepositoryProvider = Provider<ReminderRepository>(
  (ref) => ReminderRepository(),
);

final remindersProvider =
    StateNotifierProvider<RemindersNotifier, RemindersState>((ref) {
      return RemindersNotifier(ref.watch(reminderRepositoryProvider));
    });
