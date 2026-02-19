package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.ContactResponse;
import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.mapper.ContactMapper;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.util.LoggingUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private static final Logger logger = LoggerFactory.getLogger(ContactService.class);

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final LoggingUtil loggingUtil;

    public ContactService(ContactRepository contactRepository, ContactMapper contactMapper, LoggingUtil loggingUtil) {
        this.contactRepository = contactRepository;
        this.contactMapper = contactMapper;
        this.loggingUtil = loggingUtil;
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getAllContacts() {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getAllContacts");
        try {
            List<ContactResponse> contacts = contactRepository.findAll().stream()
                    .map(contactMapper::toDto)
                    .collect(Collectors.toList());
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "getAllContacts", contacts.size() + " contacts retrieved");
            return contacts;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getAllContacts", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ContactResponse getContactById(Long id) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getContactById", id);
        try {
            Contact contact = contactRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", String.valueOf(id)));
            ContactResponse response = contactMapper.toDto(contact);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "getContactById", id);
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getContactById", e);
            throw e;
        }
    }

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "createContact", request.getName());
        try {
            Contact contact = contactMapper.toEntity(request);
            Contact savedContact = contactRepository.save(contact);
            loggingUtil.logDatabaseOperation("CREATE", "Contact", savedContact.getId());
            ContactResponse response = contactMapper.toDto(savedContact);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "createContact", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "createContact", e);
            throw e;
        }
    }

    @Transactional
    public ContactResponse updateContact(String id, ContactRequest request) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "updateContact", id);
        try {
            Long longId = Long.parseLong(id);
            Contact existingContact = contactRepository.findById(longId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", id));

            // Update with new data from request
            existingContact.setName(request.getName());
            existingContact.setPhone(request.getPhone());
            existingContact.setEmail(request.getEmail());

            Contact updatedContact = contactRepository.save(existingContact);
            loggingUtil.logDatabaseOperation("UPDATE", "Contact", updatedContact.getId());
            ContactResponse response = contactMapper.toDto(updatedContact);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "updateContact", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "updateContact", e);
            throw e;
        }
    }

    @Transactional
    public void deleteContact(String id) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "deleteContact", id);
        try {
            Long longId = Long.parseLong(id);
            if (!contactRepository.existsById(longId)) {
                throw new ResourceNotFoundException("Contact", id);
            }
            contactRepository.deleteById(longId);
            loggingUtil.logDatabaseOperation("DELETE", "Contact", longId);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "deleteContact", true);
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "deleteContact", e);
            throw e;
        }
    }
}
