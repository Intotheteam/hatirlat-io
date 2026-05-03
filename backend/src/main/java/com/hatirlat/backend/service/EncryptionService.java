package com.hatirlat.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting and decrypting sensitive data using AES-256-GCM.
 * Used primarily for storing API keys and credentials securely in the database.
 *
 * AES-GCM provides both confidentiality and authenticity.
 */
@Service
public class EncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(EncryptionService.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits (recommended for GCM)
    private static final int GCM_TAG_LENGTH = 128; // 128 bits authentication tag

    @Value("${encryption.secret.key:CHANGE_THIS_TO_SECURE_32_CHAR_KEY_IN_PRODUCTION_ENV}")
    private String secretKeyString;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Encrypts plaintext using AES-256-GCM
     *
     * @param plainText The text to encrypt
     * @return Base64-encoded encrypted text with IV prepended
     * @throws RuntimeException if encryption fails
     */
    public String encrypt(String plainText) {
        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher
            SecretKey key = getSecretKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);

            // Encrypt
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // Combine IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            // Encode to Base64
            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            logger.error("Encryption failed", e);
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }

    /**
     * Decrypts ciphertext that was encrypted with encrypt()
     *
     * @param encryptedText Base64-encoded encrypted text with IV prepended
     * @return Decrypted plaintext
     * @throws RuntimeException if decryption fails
     */
    public String decrypt(String encryptedText) {
        try {
            // Decode from Base64
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);

            // Extract IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedBytes);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            // Initialize cipher
            SecretKey key = getSecretKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);

            // Decrypt
            byte[] plainText = cipher.doFinal(cipherText);

            return new String(plainText, StandardCharsets.UTF_8);

        } catch (Exception e) {
            logger.error("Decryption failed", e);
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }

    /**
     * Generates a SecretKey from the configured secret key string.
     * The key must be 32 bytes (256 bits) for AES-256.
     *
     * @return SecretKey for AES encryption
     */
    private SecretKey getSecretKey() {
        // Ensure key is exactly 32 bytes for AES-256
        byte[] keyBytes = secretKeyString.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // Pad with zeros if too short (NOT RECOMMENDED for production!)
            logger.warn("Secret key is too short! Please use a 32-character key in production.");
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
            keyBytes = paddedKey;
        } else if (keyBytes.length > 32) {
            // Truncate if too long
            byte[] truncatedKey = new byte[32];
            System.arraycopy(keyBytes, 0, truncatedKey, 0, 32);
            keyBytes = truncatedKey;
        }

        return new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * Validates if the encryption service is properly configured
     *
     * @return true if configured correctly
     */
    public boolean isProperlyConfigured() {
        try {
            // Test encryption/decryption
            String testString = "test";
            String encrypted = encrypt(testString);
            String decrypted = decrypt(encrypted);
            return testString.equals(decrypted);
        } catch (Exception e) {
            logger.error("Encryption service is not properly configured", e);
            return false;
        }
    }
}
