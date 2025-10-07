package com.hatirlat.backend.config;

import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.GroupMember;
import com.hatirlat.backend.entity.Member;
import com.hatirlat.backend.entity.MemberRole;
import com.hatirlat.backend.entity.MemberStatus;
import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.entity.ReminderType;
import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.entity.RepeatType;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.repository.GroupMemberRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import com.hatirlat.backend.repository.ReminderRepository;
import com.hatirlat.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private Environment environment;
    
    @Value("${ADMIN_PASSWORD:StrongAdminPass123!}")
    private String adminPassword;
    
    @Value("${TEST_USER_PASSWORD:StrongTestPass123!}")
    private String testPassword;
    
    @Value("${CREATE_TEST_USERS:false}")
    private boolean createTestUsers;

    @Override
    public void run(String... args) throws Exception {
        // Only create users in development environment
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isDev = activeProfiles.length == 0 || java.util.Arrays.stream(activeProfiles).anyMatch("dev"::equals);
        
        // Check if admin user already exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            // Create admin user
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setPremium(true);
            userRepository.save(adminUser);
            
            log.info("Admin user created successfully");
        } else {
            log.info("Admin user already exists");
        }
        
        // Only create test user if explicitly enabled or in dev environment
        if (createTestUsers || isDev) {
            // Check if test user already exists
            if (userRepository.findByUsername("test").isEmpty()) {
                // Create test user
                User testUser = new User();
                testUser.setUsername("test");
                testUser.setPassword(passwordEncoder.encode(testPassword));
                testUser.setRole(Role.USER);
                testUser.setEnabled(true);
                testUser.setPremium(false);
                userRepository.save(testUser);
                
                log.info("Test user created successfully");
            } else {
                log.info("Test user already exists");
            }
        }

        // Seed domain dummy data (contacts, groups, members, reminders) in dev or when enabled
        if (createTestUsers || isDev) {
            // Contacts
            if (contactRepository.count() == 0) {
                Contact alice = new Contact("Alice", "+905551112233", "alice@example.com");
                Contact bob = new Contact("Bob", "+905554445566", "bob@example.com");
                contactRepository.save(alice);
                contactRepository.save(bob);
                log.info("Sample contacts created");
            }

            // Members
            if (memberRepository.count() == 0) {
                Member m1 = new Member("Alice Johnson", "alice@example.com", "+905551112233");
                m1.setRole(MemberRole.ADMIN);
                m1.setStatus(MemberStatus.ACTIVE);

                Member m2 = new Member("Bob Smith", "bob@example.com", "+905554445566");
                m2.setRole(MemberRole.MEMBER);
                m2.setStatus(MemberStatus.ACTIVE);

                memberRepository.save(m1);
                memberRepository.save(m2);
                log.info("Sample members created");
            }

            // Groups
            if (groupRepository.count() == 0) {
                Group g1 = new Group("Family", "Family reminders group");
                Group g2 = new Group("Work", "Work related reminders");
                groupRepository.save(g1);
                groupRepository.save(g2);
                log.info("Sample groups created");
            }

            // Link members to groups (after both are created)
            if (groupMemberRepository.count() == 0) {
                java.util.List<Member> members = memberRepository.findAll();
                java.util.List<Group> groups = groupRepository.findAll();

                if (!members.isEmpty() && !groups.isEmpty()) {
                    // Add first member to first group
                    GroupMember gm1 = new GroupMember();
                    gm1.setGroupId(groups.get(0).getId());
                    gm1.setMemberId(members.get(0).getId());
                    groupMemberRepository.save(gm1);

                    // Add second member to first group
                    GroupMember gm2 = new GroupMember();
                    gm2.setGroupId(groups.get(0).getId());
                    gm2.setMemberId(members.get(1).getId());
                    groupMemberRepository.save(gm2);

                    log.info("Sample group-member associations created");
                }
            }

            // Reminders
            if (reminderRepository.count() == 0) {
                java.util.List<Contact> contacts = contactRepository.findAll();
                java.util.List<Group> groups = groupRepository.findAll();

                Reminder r1 = new Reminder();
                r1.setTitle("Pay electricity bill");
                r1.setType(ReminderType.PERSONAL);
                r1.setMessage("Pay the electricity bill before due date");
                r1.setDateTime(java.time.LocalDateTime.now().plusDays(1));
                r1.setStatus(ReminderStatus.SCHEDULED);
                if (!contacts.isEmpty()) {
                    r1.setContactId(contacts.get(0).getId()); // Set contact ID instead of entity
                }
                r1.setChannels(java.util.List.of(NotificationChannel.EMAIL));
                r1.setRepeat(RepeatType.NONE);

                Reminder r2 = new Reminder();
                r2.setTitle("Team standup");
                r2.setType(ReminderType.GROUP);
                r2.setMessage("Daily standup at 10:00");
                r2.setDateTime(java.time.LocalDateTime.now().plusHours(2));
                r2.setStatus(ReminderStatus.SCHEDULED);
                if (!groups.isEmpty()) {
                    r2.setGroupId(groups.get(0).getId()); // Set group ID instead of entity
                }
                r2.setChannels(java.util.List.of(NotificationChannel.WHATSAPP, NotificationChannel.SMS));
                r2.setRepeat(RepeatType.DAILY);

                reminderRepository.save(r1);
                reminderRepository.save(r2);
                log.info("Sample reminders created");
            }
        }
    }
}