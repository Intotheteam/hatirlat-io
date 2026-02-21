import java.util.stream.Collectors;
import java.util.List;
import java.util.Arrays;

public class TestEnum2 {
    public enum NotificationChannel {
        EMAIL, SMS, WHATSAPP, PUSH
    }

    private static <T extends Enum<T>> T parseEnumSafely(String value, Class<T> enumClass, T defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            System.out.println("EXCEPTION CAUGHT: " + e.getMessage());
            e.printStackTrace();
            return defaultValue;
        }
    }

    public static void main(String[] args) {
        System.out.println(parseEnumSafely("email", NotificationChannel.class, null));
    }
}
