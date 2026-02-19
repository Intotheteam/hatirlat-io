package com.hatirlat.backend.mapper;

/**
 * Generic mapper interface to convert between entity and DTO
 * @param <E> Entity type
 * @param <D> DTO type
 */
public interface BaseMapper<E, D> {
    D toDto(E entity);
    E toEntity(D dto);
}