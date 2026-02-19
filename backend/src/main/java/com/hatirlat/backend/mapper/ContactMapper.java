package com.hatirlat.backend.mapper;

import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.ContactResponse;
import com.hatirlat.backend.entity.Contact;
import org.springframework.stereotype.Component;

@Component
public class ContactMapper implements BaseMapper<Contact, ContactResponse> {

    @Override
    public ContactResponse toDto(Contact contact) {
        if (contact == null) {
            return null;
        }

        ContactResponse dto = new ContactResponse();
        dto.setId(String.valueOf(contact.getId()));
        dto.setName(contact.getName());
        dto.setPhone(contact.getPhone());
        dto.setEmail(contact.getEmail());

        return dto;
    }

    @Override
    public Contact toEntity(ContactResponse dto) {
        if (dto == null) {
            return null;
        }

        Contact contact = new Contact();
        if (dto.getId() != null) {
            contact.setId(Long.parseLong(dto.getId()));
        }
        contact.setName(dto.getName());
        contact.setPhone(dto.getPhone());
        contact.setEmail(dto.getEmail());

        return contact;
    }

    /**
     * Convert a ContactRequest to a Contact entity (for create/update operations)
     */
    public Contact toEntity(ContactRequest request) {
        if (request == null) {
            return null;
        }

        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setPhone(request.getPhone());
        contact.setEmail(request.getEmail());

        return contact;
    }
}
