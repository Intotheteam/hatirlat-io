package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.ContactResponse;
import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private ContactRequest contactRequest;
    private Contact contact;

    @BeforeEach
    void setUp() {
        contactRequest = new ContactRequest();
        contactRequest.setName("Test Contact");
        contactRequest.setEmail("test@example.com");
        contactRequest.setPhone("1234567890");

        contact = new Contact();
        contact.setId(1L);
        contact.setName("Test Contact");
        contact.setEmail("test@example.com");
        contact.setPhone("1234567890");
    }

    @Test
    void getAllContacts_ReturnsListOfContacts() {
        when(contactRepository.findAll()).thenReturn(Arrays.asList(contact));

        List<ContactResponse> contacts = contactService.getAllContacts();

        assertEquals(1, contacts.size());
        assertEquals("Test Contact", contacts.get(0).getName());
        verify(contactRepository, times(1)).findAll();
    }

    @Test
    void createContact_ValidRequest_ReturnsCreatedContact() {
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        ContactResponse response = contactService.createContact(contactRequest);

        assertNotNull(response);
        assertEquals("Test Contact", response.getName());
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void updateContact_ExistingContact_ReturnsUpdatedContact() {
        contactRequest.setName("Updated Contact");
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        ContactResponse response = contactService.updateContact("1", contactRequest);

        assertNotNull(response);
        assertEquals("Updated Contact", response.getName());
        verify(contactRepository, times(1)).findById(1L);
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void updateContact_NonExistingContact_ReturnsNull() {
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(com.hatirlat.backend.exception.ResourceNotFoundException.class, () -> {
            contactService.updateContact("999", contactRequest);
        });
        
        verify(contactRepository, times(1)).findById(999L);
    }

    @Test
    void deleteContact_ExistingContact_ReturnsTrue() {
        when(contactRepository.existsById(1L)).thenReturn(true);

        boolean result = contactService.deleteContact("1");

        assertTrue(result);
        verify(contactRepository, times(1)).existsById(1L);
        verify(contactRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteContact_NonExistingContact_ReturnsFalse() {
        when(contactRepository.existsById(999L)).thenReturn(false);

        assertThrows(com.hatirlat.backend.exception.ResourceNotFoundException.class, () -> {
            contactService.deleteContact("999");
        });
        
        verify(contactRepository, times(1)).existsById(999L);
        verify(contactRepository, never()).deleteById(999L);
    }
}