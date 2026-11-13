## Security Note: Encryption Strategy

- Journal `content` is encrypted with **AES-256-GCM** (Node `crypto`) before it is saved to MongoDB. A fresh 12-byte IV is generated per entry; the stored value is `iv.authTag.ciphertext` (base64).
- The key is derived from the user's passphrase with **scrypt** and a per-user random salt. **The key is never stored.** It exists only in memory for the duration of a request.
- Login passwords are hashed with **bcrypt** (hashing only; it is not used for encryption).
- A database admin sees only ciphertext (see the Privacy Demo screenshot).
- **Trade-off:** a forgotten passphrase means entries cannot be recovered. Because content is encrypted, search happens client-side after decryption.
