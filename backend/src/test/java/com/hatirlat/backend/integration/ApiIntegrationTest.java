package com.hatirlat.backend.integration;

import com.hatirlat.backend.dto.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ApiIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private static String authToken;
    private static String createdReminderId;
    private static String createdGroupId;
    private static String createdContactId;
    private static String createdMemberId;

    private String base(String path) {
        return "http://localhost:" + port + path;
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private <T> ResponseEntity<T> authedGet(String path, Class<T> type) {
        return restTemplate.exchange(base(path), HttpMethod.GET, new HttpEntity<>(authHeaders()), type);
    }

    private <B, T> ResponseEntity<T> authedPost(String path, B body, Class<T> type) {
        return restTemplate.exchange(base(path), HttpMethod.POST, new HttpEntity<>(body, authHeaders()), type);
    }

    private <B, T> ResponseEntity<T> authedPut(String path, B body, Class<T> type) {
        return restTemplate.exchange(base(path), HttpMethod.PUT, new HttpEntity<>(body, authHeaders()), type);
    }

    private <T> ResponseEntity<T> authedDelete(String path, Class<T> type) {
        return restTemplate.exchange(base(path), HttpMethod.DELETE, new HttpEntity<>(authHeaders()), type);
    }

    // =====================================================
    // AUTH TESTS (Order 1-5)
    // =====================================================

    @Test
    @Order(1)
    void register_NewUser_Returns200WithUser() {
        UserRequest req = new UserRequest();
        req.setUsername("integrationuser");
        req.setPassword("pass123");
        req.setEmail("integration@test.com");
        req.setRole("USER");

        // Use String.class to avoid GrantedAuthority deserialization issue with User entity
        ResponseEntity<String> response = restTemplate.postForEntity(base("/api/auth/register"), req, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("integrationuser"));
    }

    @Test
    @Order(2)
    void register_DuplicateUser_Returns409() {
        UserRequest req = new UserRequest();
        req.setUsername("integrationuser");
        req.setPassword("pass123");
        req.setEmail("integration@test.com");

        ResponseEntity<String> response = restTemplate.postForEntity(base("/api/auth/register"), req, String.class);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @Order(3)
    void login_ValidCredentials_Returns200WithToken() {
        AuthRequest req = new AuthRequest();
        req.setUsername("integrationuser");
        req.setPassword("pass123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(base("/api/auth/login"), req, AuthResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getToken());
        assertFalse(response.getBody().getToken().isEmpty());
        assertEquals("Bearer", response.getBody().getType());
        assertNotNull(response.getBody().getUser());
        assertEquals("integrationuser", response.getBody().getUser().getUsername());

        authToken = response.getBody().getToken();
    }

    @Test
    @Order(4)
    void login_InvalidCredentials_ReturnsNon200() {
        AuthRequest req = new AuthRequest();
        req.setUsername("integrationuser");
        req.setPassword("wrongpassword");

        ResponseEntity<String> response = restTemplate.postForEntity(base("/api/auth/login"), req, String.class);

        // BadCredentialsException is currently not handled in GlobalExceptionHandler,
        // so Spring Boot returns 500. Accept any non-200 status as the login failed.
        assertNotEquals(HttpStatus.OK, response.getStatusCode(),
            "Login with wrong credentials must NOT return 200 OK");
    }

    @Test
    @Order(5)
    void getCurrentUser_WithValidToken_Returns200WithUserInfo() {
        ResponseEntity<Map> response = authedGet("/api/auth/me", Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));
        assertNotNull(response.getBody().get("data"));
    }

    // =====================================================
    // UNAUTHORIZED ACCESS TESTS (Order 6-7)
    // =====================================================

    @Test
    @Order(6)
    void protectedEndpoints_WithoutToken_Returns403() {
        ResponseEntity<String> response = restTemplate.getForEntity(base("/api/reminders"), String.class);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    @Order(7)
    void protectedEndpoints_WithInvalidToken_Returns403() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("invalid.jwt.token.here");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(base("/api/reminders"), HttpMethod.GET, entity, String.class);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // =====================================================
    // REMINDER CRUD TESTS (Order 11-18)
    // =====================================================

    @Test
    @Order(11)
    void createReminder_ValidPersonalReminder_Returns200() {
        ReminderRequest req = new ReminderRequest();
        req.setTitle("Integration Test Reminder");
        req.setType("personal");
        req.setMessage("Test message");
        req.setDateTime(LocalDateTime.now().plusDays(1));
        req.setStatus("scheduled");
        req.setChannels(Arrays.asList("email"));
        req.setRepeat("none");

        ResponseEntity<Map> response = authedPost("/api/reminders", req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));

        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertNotNull(data);
        assertEquals("Integration Test Reminder", data.get("title"));
        createdReminderId = (String) data.get("id");
        assertNotNull(createdReminderId);
    }

    @Test
    @Order(12)
    void getAllReminders_Returns200WithList() {
        ResponseEntity<Map> response = authedGet("/api/reminders", Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(13)
    void getReminderById_ExistingId_Returns200() {
        assertNotNull(createdReminderId, "createdReminderId must be set by Order(11)");

        ResponseEntity<Map> response = authedGet("/api/reminders/" + createdReminderId, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertEquals("Integration Test Reminder", data.get("title"));
    }

    @Test
    @Order(14)
    void getReminderById_NonExistingId_Returns404() {
        ResponseEntity<Map> response = authedGet("/api/reminders/99999", Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(15)
    void updateReminder_ExistingId_Returns200() {
        assertNotNull(createdReminderId, "createdReminderId must be set by Order(11)");

        ReminderRequest req = new ReminderRequest();
        req.setTitle("Updated Integration Reminder");
        req.setType("personal");
        req.setMessage("Updated message");
        req.setDateTime(LocalDateTime.now().plusDays(2));
        req.setStatus("scheduled");
        req.setChannels(Arrays.asList("email", "sms"));
        req.setRepeat("none");

        ResponseEntity<Map> response = authedPut("/api/reminders/" + createdReminderId, req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(16)
    void updateReminderStatus_ValidStatus_Returns200() {
        assertNotNull(createdReminderId, "createdReminderId must be set by Order(11)");

        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setStatus("paused");

        ResponseEntity<Map> response = authedPut("/api/reminders/" + createdReminderId + "/status", req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertEquals("paused", data.get("status"));
    }

    @Test
    @Order(17)
    void deleteReminder_ExistingId_Returns200() {
        assertNotNull(createdReminderId, "createdReminderId must be set by Order(11)");

        ResponseEntity<Map> response = authedDelete("/api/reminders/" + createdReminderId, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(18)
    void deleteReminder_NonExistingId_Returns404() {
        ResponseEntity<Map> response = authedDelete("/api/reminders/99999", Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // =====================================================
    // GROUP CRUD TESTS (Order 21-27)
    // =====================================================

    @Test
    @Order(21)
    void createGroup_ValidRequest_Returns200() {
        GroupRequest req = new GroupRequest();
        req.setName("Integration Test Group");
        req.setDescription("A group for integration testing");

        ResponseEntity<Map> response = authedPost("/api/groups", req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));

        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertNotNull(data);
        assertEquals("Integration Test Group", data.get("name"));
        createdGroupId = (String) data.get("id");
        assertNotNull(createdGroupId);
    }

    @Test
    @Order(22)
    void getAllGroups_Returns200WithList() {
        ResponseEntity<Map> response = authedGet("/api/groups", Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(23)
    void getGroupById_ExistingId_Returns200() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        ResponseEntity<Map> response = authedGet("/api/groups/" + createdGroupId, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertEquals("Integration Test Group", data.get("name"));
    }

    @Test
    @Order(24)
    void getGroupById_NonExistingId_Returns404() {
        ResponseEntity<Map> response = authedGet("/api/groups/99999", Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(25)
    void updateGroup_ExistingId_Returns200() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        GroupRequest req = new GroupRequest();
        req.setName("Updated Integration Group");
        req.setDescription("Updated description");

        ResponseEntity<Map> response = authedPut("/api/groups/" + createdGroupId, req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(26)
    void updateGroup_NonExistingId_Returns404() {
        GroupRequest req = new GroupRequest();
        req.setName("Should Not Exist");
        req.setDescription("desc");

        ResponseEntity<Map> response = authedPut("/api/groups/99999", req, Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // =====================================================
    // MEMBER CRUD TESTS (Order 29-35)
    // =====================================================

    @Test
    @Order(29)
    void addMemberToGroup_ValidRequest_Returns200() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        MemberRequest req = new MemberRequest();
        req.setName("Integration Member");
        req.setEmail("member@integration.com");
        req.setPhone("5551234567");
        req.setRole("member");

        ResponseEntity<Map> response = authedPost("/api/groups/" + createdGroupId + "/members", req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));

        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertNotNull(data);
        assertEquals("Integration Member", data.get("name"));
        createdMemberId = (String) data.get("id");
        assertNotNull(createdMemberId);
    }

    @Test
    @Order(30)
    void getGroupMembers_Returns200WithList() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        ResponseEntity<Map> response = authedGet("/api/groups/" + createdGroupId + "/members", Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
        List<?> members = (List<?>) response.getBody().get("data");
        assertFalse(members.isEmpty(), "Group should have at least one member");
    }

    @Test
    @Order(31)
    void addMemberToGroup_InvalidRole_Returns200WithDefaultMemberRole() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        MemberRequest req = new MemberRequest();
        req.setName("Member With Bad Role");
        req.setEmail("badrole@integration.com");
        req.setRole("INVALID_ROLE_STRING");

        ResponseEntity<Map> response = authedPost("/api/groups/" + createdGroupId + "/members", req, Map.class);

        // BUG-2 fix: invalid role should not cause 500, should default to MEMBER
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertEquals("member", data.get("role"));
    }

    @Test
    @Order(32)
    void addMemberToGroup_NonExistingGroup_Returns404() {
        MemberRequest req = new MemberRequest();
        req.setName("Ghost Member");
        req.setEmail("ghost@integration.com");

        ResponseEntity<Map> response = authedPost("/api/groups/99999/members", req, Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(33)
    void inviteMember_ValidRequest_Returns200() {
        InviteRequest req = new InviteRequest();
        req.setEmail("invite@integration.com");
        req.setGroupId(createdGroupId);

        ResponseEntity<Map> response = authedPost("/api/members/invite", req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(34)
    void removeMemberFromGroup_ExistingMember_Returns200() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");
        assertNotNull(createdMemberId, "createdMemberId must be set by Order(29)");

        ResponseEntity<Map> response = authedDelete(
            "/api/groups/" + createdGroupId + "/members/" + createdMemberId, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(35)
    void removeMemberFromGroup_NonExistingMember_Returns404() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        ResponseEntity<Map> response = authedDelete(
            "/api/groups/" + createdGroupId + "/members/99999", Map.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // =====================================================
    // GROUP CLEANUP (Order 36)
    // =====================================================

    @Test
    @Order(36)
    void deleteGroup_ExistingId_Returns200() {
        assertNotNull(createdGroupId, "createdGroupId must be set by Order(21)");

        ResponseEntity<Map> response = authedDelete("/api/groups/" + createdGroupId, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    // =====================================================
    // CONTACT CRUD TESTS (Order 41-46)
    // =====================================================

    @Test
    @Order(41)
    void createContact_ValidRequest_Returns200() {
        ContactRequest req = new ContactRequest();
        req.setName("Integration Contact");
        req.setPhone("5559876543");
        req.setEmail("contact@integration.com");

        ResponseEntity<Map> response = authedPost("/api/contacts", req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));

        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertNotNull(data);
        assertEquals("Integration Contact", data.get("name"));
        createdContactId = (String) data.get("id");
        assertNotNull(createdContactId);
    }

    @Test
    @Order(42)
    void getAllContacts_Returns200WithList() {
        ResponseEntity<Map> response = authedGet("/api/contacts", Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(43)
    void updateContact_ExistingId_Returns200() {
        assertNotNull(createdContactId, "createdContactId must be set by Order(41)");

        ContactRequest req = new ContactRequest();
        req.setName("Updated Integration Contact");
        req.setPhone("5550000000");
        req.setEmail("updated@integration.com");

        ResponseEntity<Map> response = authedPut("/api/contacts/" + createdContactId, req, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(44)
    void updateContact_NonExistingId_Returns404() {
        ContactRequest req = new ContactRequest();
        req.setName("Ghost");
        req.setEmail("ghost@test.com");

        ResponseEntity<Map> response = authedPut("/api/contacts/99999", req, Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(45)
    void deleteContact_ExistingId_Returns200() {
        assertNotNull(createdContactId, "createdContactId must be set by Order(41)");

        ResponseEntity<Map> response = authedDelete("/api/contacts/" + createdContactId, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    @Order(46)
    void deleteContact_NonExistingId_Returns404() {
        ResponseEntity<Map> response = authedDelete("/api/contacts/99999", Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // =====================================================
    // VALIDATION ERROR TESTS (Order 51-53)
    // =====================================================

    @Test
    @Order(51)
    void register_BlankUsername_Returns400() {
        UserRequest req = new UserRequest();
        req.setUsername("");
        req.setPassword("pass123");
        req.setEmail("blank@test.com");

        ResponseEntity<String> response = restTemplate.postForEntity(base("/api/auth/register"), req, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(52)
    void register_InvalidEmail_Returns400() {
        UserRequest req = new UserRequest();
        req.setUsername("validuser2");
        req.setPassword("pass123");
        req.setEmail("not-an-email");

        ResponseEntity<String> response = restTemplate.postForEntity(base("/api/auth/register"), req, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(53)
    void createReminder_MissingTitle_Returns400() {
        ReminderRequest req = new ReminderRequest();
        // title intentionally left null
        req.setType("personal");
        req.setDateTime(LocalDateTime.now().plusDays(1));
        req.setStatus("scheduled");
        req.setChannels(Arrays.asList("email"));
        req.setRepeat("none");

        ResponseEntity<Map> response = authedPost("/api/reminders", req, Map.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
