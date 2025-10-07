package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.ContactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactControllerTest {

    @Mock
    private ContactService contactService;

    @InjectMocks
    private ContactController contactController;

    private ContactRequest contactRequest;
    private ContactResponse contactResponse;

    @BeforeEach
    void setUp() {
        contactRequest = new ContactRequest();
        contactRequest.setName("Test Contact");
        contactRequest.setEmail("test@example.com");
        contactRequest.setPhone("1234567890");

        contactResponse = new ContactResponse();
        contactResponse.setId("1");
        contactResponse.setName("Test Contact");
        contactResponse.setEmail("test@example.com");
        contactResponse.setPhone("1234567890");
    }

    @Test
    void getAllContacts_ReturnsListOfContacts() {
        List<ContactResponse> contacts = Arrays.asList(contactResponse);
        when(contactService.getAllContacts()).thenReturn(contacts);

        ResponseEntity<BaseResponse<List<ContactResponse>>> response = contactController.getAllContacts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Test Contact", response.getBody().getData().get(0).getName());
        verify(contactService, times(1)).getAllContacts();
    }

    @Test
    void createContact_ValidRequest_ReturnsCreatedContact() {
        when(contactService.createContact(any(ContactRequest.class))).thenReturn(contactResponse);

        ResponseEntity<BaseResponse<ContactResponse>> response = contactController.createContact(contactRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Contact", response.getBody().getData().getName());
        verify(contactService, times(1)).createContact(any(ContactRequest.class));
    }

    @Test
    void updateContact_ExistingContact_ReturnsUpdatedContact() {
        when(contactService.updateContact(eq("1"), any(ContactRequest.class))).thenReturn(contactResponse);

        ResponseEntity<BaseResponse<ContactResponse>> response = contactController.updateContact("1", contactRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Contact", response.getBody().getData().getName());
        verify(contactService, times(1)).updateContact(eq("1"), any(ContactRequest.class));
    }

    @Test
    void updateContact_NonExistingContact_ReturnsNotFound() {
        when(contactService.updateContact(eq("999"), any(ContactRequest.class))).thenReturn(null);

        ResponseEntity<BaseResponse<ContactResponse>> response = contactController.updateContact("999", contactRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertNull(response.getBody().getData());
        verify(contactService, times(1)).updateContact(eq("999"), any(ContactRequest.class));
    }

    @Test
    void deleteContact_ExistingContact_ReturnsSuccess() {
        when(contactService.deleteContact("1")).thenReturn(true);

        ResponseEntity<BaseResponse<Void>> response = contactController.deleteContact("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(contactService, times(1)).deleteContact("1");
    }

    @Test
    void deleteContact_NonExistingContact_ReturnsNotFound() {
        when(contactService.deleteContact("999")).thenReturn(false);

        ResponseEntity<BaseResponse<Void>> response = contactController.deleteContact("999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        verify(contactService, times(1)).deleteContact("999");
    }
}