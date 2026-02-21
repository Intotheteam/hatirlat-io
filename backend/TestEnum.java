import java.util.stream.Collectors;
import java.util.List;
import java.util.Arrays;

public class TestEnum {
    public enum NotificationChannel {
        EMAIL, SMS, WHATSAPP
    }

    private static <T extends Enum<T>> T parseEnumSafely(String value, Class<T> enumClass, T defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return defaultValue;
        }
    }

    private static List<NotificationChannel> convertChannelStringsToEnums(List<String> channelStrings) {
        if (channelStrings == null)
            return null;
        return channelStrings.stream()
                .map(channel -> parseEnumSafely(channel, NotificationChannel.class, null))
                .filter(java.util.Objects::nonNull) // Filter out any invalid enum values
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        List<String> req = Arrays.asList("email");
        List<NotificationChannel> enums = convertChannelStringsToEnums(req);
        System.out.println("Result size: " + enums.size());
        if (!enums.isEmpty()) {
            System.out.println("Result[0]: " + enums.get(0));
        }
    }
}
