package com.hatirlat.backend.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

class EntityTests {

    @Test
    void reminder_GettersAndSetters() {
        Reminder reminder = new Reminder();
        reminder.setId(1L);
        reminder.setTitle("Test Reminder");
        reminder.setType(ReminderType.PERSONAL);
        reminder.setMessage("Test message");
        reminder.setDateTime(LocalDateTime.now());
        reminder.setStatus(ReminderStatus.SCHEDULED);
        reminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        reminder.setRepeat(RepeatType.DAILY);

        // Use foreign key IDs instead of setting full entity objects
        reminder.setContactId(1L);
        reminder.setGroupId(1L);
        reminder.setCustomRepeatId(1L);

        assertEquals(1L, reminder.getId());
        assertEquals("Test Reminder", reminder.getTitle());
        assertEquals(ReminderType.PERSONAL, reminder.getType());
        assertEquals("Test message", reminder.getMessage());
        assertEquals(ReminderStatus.SCHEDULED, reminder.getStatus());
        assertEquals(Arrays.asList(NotificationChannel.EMAIL), reminder.getChannels());
        assertEquals(RepeatType.DAILY, reminder.getRepeat());
        assertEquals(Long.valueOf(1L), reminder.getContactId());
        assertEquals(Long.valueOf(1L), reminder.getGroupId());
        assertEquals(Long.valueOf(1L), reminder.getCustomRepeatId());
    }

    @Test
    void contact_GettersAndSetters() {
        Contact contact = new Contact();
        contact.setId(1L);
        contact.setName("Test Contact");
        contact.setPhone("1234567890");
        contact.setEmail("test@example.com");

        assertEquals(1L, contact.getId());
        assertEquals("Test Contact", contact.getName());
        assertEquals("1234567890", contact.getPhone());
        assertEquals("test@example.com", contact.getEmail());

        Contact contactWithConstructor = new Contact("Name", "Phone", "Email");
        assertEquals("Name", contactWithConstructor.getName());
        assertEquals("Phone", contactWithConstructor.getPhone());
        assertEquals("Email", contactWithConstructor.getEmail());
    }

    @Test
    void group_GettersAndSetters() {
        Group group = new Group();
        group.setId(1L);
        group.setName("Test Group");
        group.setDescription("Test Description");
        group.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, group.getId());
        assertEquals("Test Group", group.getName());
        assertEquals("Test Description", group.getDescription());
        assertNotNull(group.getCreatedAt());

        Group groupWithConstructor = new Group("Name", "Description");
        assertEquals("Name", groupWithConstructor.getName());
        assertEquals("Description", groupWithConstructor.getDescription());
        assertNotNull(groupWithConstructor.getCreatedAt());
    }

    @Test
    void member_GettersAndSetters() {
        Member member = new Member();
        member.setId(1L);
        member.setName("Test Member");
        member.setEmail("test@example.com");
        member.setPhone("1234567890");
        member.setRole(MemberRole.MEMBER);
        member.setStatus(MemberStatus.ACTIVE);
        member.setJoinedAt(LocalDateTime.now());
        member.setLastActivity(LocalDateTime.now());

        assertEquals(1L, member.getId());
        assertEquals("Test Member", member.getName());
        assertEquals("test@example.com", member.getEmail());
        assertEquals("1234567890", member.getPhone());
        assertEquals(MemberRole.MEMBER, member.getRole());
        assertEquals(MemberStatus.ACTIVE, member.getStatus());
        assertNotNull(member.getJoinedAt());
        assertNotNull(member.getLastActivity());

        Member memberWithConstructor = new Member("Name", "Email", "Phone");
        assertEquals("Name", memberWithConstructor.getName());
        assertEquals("Email", memberWithConstructor.getEmail());
        assertEquals("Phone", memberWithConstructor.getPhone());
        assertEquals(MemberRole.MEMBER, memberWithConstructor.getRole());
        assertEquals(MemberStatus.PENDING, memberWithConstructor.getStatus());
        assertNotNull(memberWithConstructor.getJoinedAt());
    }

    @Test
    void customRepeatConfig_GettersAndSetters() {
        CustomRepeatConfig config = new CustomRepeatConfig();
        config.setId(1L);
        config.setInterval(5);
        config.setFrequency(RepeatFrequency.WEEK);
        config.setDaysOfWeek(Arrays.asList(DayOfWeek.MON, DayOfWeek.WED));

        assertEquals(1L, config.getId());
        assertEquals(5, config.getInterval());
        assertEquals(RepeatFrequency.WEEK, config.getFrequency());
        assertEquals(Arrays.asList(DayOfWeek.MON, DayOfWeek.WED), config.getDaysOfWeek());
    }

    @Test
    void user_GettersAndSetters() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("password");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmail("test@example.com");

        assertEquals(1L, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("password", user.getPassword());
        assertEquals(Role.USER, user.getRole());
        assertTrue(user.isEnabled());
        assertEquals("test@example.com", user.getEmail());

        User userWithConstructor = new User("username", "password", Role.ADMIN);
        assertEquals("username", userWithConstructor.getUsername());
        assertEquals("password", userWithConstructor.getPassword());
        assertEquals(Role.ADMIN, userWithConstructor.getRole());
    }

    @Test
    void enums_AreValid() {
        // Test all enums have valid values
        assertNotNull(ReminderType.PERSONAL);
        assertNotNull(ReminderType.GROUP);

        assertNotNull(ReminderStatus.SCHEDULED);
        assertNotNull(ReminderStatus.SENT);
        assertNotNull(ReminderStatus.PAUSED);
        assertNotNull(ReminderStatus.FAILED);

        assertNotNull(NotificationChannel.EMAIL);
        assertNotNull(NotificationChannel.SMS);
        assertNotNull(NotificationChannel.WHATSAPP);

        assertNotNull(RepeatType.NONE);
        assertNotNull(RepeatType.HOURLY);
        assertNotNull(RepeatType.DAILY);
        assertNotNull(RepeatType.WEEKLY);
        assertNotNull(RepeatType.CUSTOM);

        assertNotNull(MemberRole.ADMIN);
        assertNotNull(MemberRole.MEMBER);

        assertNotNull(MemberStatus.ACTIVE);
        assertNotNull(MemberStatus.PENDING);

        assertNotNull(RepeatFrequency.DAY);
        assertNotNull(RepeatFrequency.WEEK);
        assertNotNull(RepeatFrequency.MONTH);

        assertNotNull(DayOfWeek.MON);
        assertNotNull(DayOfWeek.TUE);
        assertNotNull(DayOfWeek.WED);
        assertNotNull(DayOfWeek.THU);
        assertNotNull(DayOfWeek.FRI);
        assertNotNull(DayOfWeek.SAT);
        assertNotNull(DayOfWeek.SUN);

        assertNotNull(Role.USER);
        assertNotNull(Role.ADMIN);
    }
}