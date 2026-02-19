package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.ContactResponse;
import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.mapper.ContactMapper;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.util.LoggingUtil;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private ContactMapper contactMapper;

    @Mock
    private LoggingUtil loggingUtil;

    @InjectMocks
    private ContactService contactService;

    private Contact contact;
    private ContactRequest contactRequest;
    private ContactResponse contactResponse;

    @BeforeEach
    void setUp() {
        contact = new Contact();
        contact.setId(1L);
        contact.setName("Test Contact");
        contact.setPhone("123-456-7890");
        contact.setEmail("test@example.com");

        contactRequest = new ContactRequest();
        contactRequest.setName("Test Contact");
        contactRequest.setPhone("123-456-7890");
        contactRequest.setEmail("test@example.com");

        contactResponse = new ContactResponse();
        contactResponse.setId("1");
        contactResponse.setName("Test Contact");
        contactResponse.setPhone("123-456-7890");
        contactResponse.setEmail("test@example.com");
    }

    @Test
    void testGetAllContacts() {
        // Given
        when(contactRepository.findAll()).thenReturn(Arrays.asList(contact));
        when(contactMapper.toDto(contact)).thenReturn(contactResponse);

        // When
        List<ContactResponse> result = contactService.getAllContacts();

        // Then
        assertEquals(1, result.size());
        assertEquals("Test Contact", result.get(0).getName());
        verify(contactRepository, times(1)).findAll();
        verify(contactMapper, times(1)).toDto(contact);
    }

    @Test
    void testGetContactById() {
        // Given
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactMapper.toDto(contact)).thenReturn(contactResponse);

        // When
        ContactResponse result = contactService.getContactById(1L);

        // Then
        assertEquals("1", result.getId());
        assertEquals("Test Contact", result.getName());
        verify(contactRepository, times(1)).findById(1L);
    }

    @Test
    void testGetContactById_NotFound() {
        // Given
        when(contactRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            contactService.getContactById(1L);
        });
        verify(contactRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateContact() {
        // Given
        when(contactMapper.toEntity(any(ContactRequest.class))).thenReturn(contact);
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);
        when(contactMapper.toDto(any(Contact.class))).thenReturn(contactResponse);

        // When
        ContactResponse result = contactService.createContact(contactRequest);

        // Then
        assertEquals("1", result.getId());
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void testUpdateContact() {
        // Given
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);
        when(contactMapper.toDto(any(Contact.class))).thenReturn(contactResponse);

        // When
        ContactResponse result = contactService.updateContact("1", contactRequest);

        // Then
        assertEquals("1", result.getId());
        verify(contactRepository, times(1)).findById(1L);
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void testUpdateContact_NotFound() {
        // Given
        when(contactRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            contactService.updateContact("1", contactRequest);
        });
        verify(contactRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteContact() {
        // Given
        when(contactRepository.existsById(1L)).thenReturn(true);

        // When
        contactService.deleteContact("1");

        // Then
        verify(contactRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteContact_NotFound() {
        // Given
        when(contactRepository.existsById(1L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            contactService.deleteContact("1");
        });
        verify(contactRepository, times(1)).existsById(1L);
    }
}
