package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.ContactResponse;
import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public List<ContactResponse> getAllContacts() {
        // In a real implementation, you'd filter by the authenticated user
        List<Contact> contacts = contactRepository.findAll();
        return contacts.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public ContactResponse createContact(ContactRequest request) {
        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setPhone(request.getPhone());
        contact.setEmail(request.getEmail());
        Contact savedContact = contactRepository.save(contact);
        return convertToResponse(savedContact);
    }

    public ContactResponse updateContact(String id, ContactRequest request) {
        Contact existingContact = contactRepository.findById(Long.parseLong(id)).orElse(null);
        if (existingContact == null) {
            return null;
        }

        existingContact.setName(request.getName());
        existingContact.setPhone(request.getPhone());
        existingContact.setEmail(request.getEmail());

        Contact updatedContact = contactRepository.save(existingContact);
        return convertToResponse(updatedContact);
    }

    public boolean deleteContact(String id) {
        if (contactRepository.existsById(Long.parseLong(id))) {
            contactRepository.deleteById(Long.parseLong(id));
            return true;
        }
        return false;
    }

    private ContactResponse convertToResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.setId(String.valueOf(contact.getId()));
        response.setName(contact.getName());
        response.setPhone(contact.getPhone());
        response.setEmail(contact.getEmail());
        return response;
    }
}