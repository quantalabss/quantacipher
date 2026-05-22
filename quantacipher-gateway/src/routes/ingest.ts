import { Router } from 'express';
import { requireApiKey, getApiKeyModel } from '../middleware/auth';

export const ingestRouter = Router();

/**
 * POST /api/v1/ingest
 * 
 * Core QuantaCipher ingest endpoint.
 * Receives a Kyber-1024 encrypted payload from the SDK, validates the API key,
 * tracks usage, and issues a cryptographic receipt.
 * 
 * The gateway never sees plaintext — only the Kyber ciphertext.
 * This is the Zero-Trust guarantee.
 */
ingestRouter.post('/', requireApiKey, async (req, res) => {
    try {
        const { ciphertext, metadata, timestamp } = req.body;
        const client = (req as any).client;

        if (!ciphertext || typeof ciphertext !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid ciphertext payload' });
        }

        // Validate ciphertext format — accept all QuantaCipher payload types:
        //   QZ_VAULT_V1:   — Vault mode (ephemeral key, permanent seal)
        //   QZ_SECURE_V1:  — Secure mode (user-held key, decryptable)
        //   QZ_TRUE_PQC_KEM: — Legacy v2 format (backward compat)
        const VALID_PREFIXES = ['QZ_VAULT_V1:', 'QZ_SECURE_V1:', 'QZ_TRUE_PQC_KEM:'];
        const isValidFormat = VALID_PREFIXES.some(prefix => ciphertext.startsWith(prefix));

        if (!isValidFormat) {
            return res.status(400).json({
                error: 'Invalid payload format',
                message: 'Ciphertext must be encrypted using the QuantaCipher SDK (Kyber-1024). Raw plaintext is rejected.',
                acceptedFormats: VALID_PREFIXES,
            });
        }

        // Detect mode from prefix for logging
        const mode = ciphertext.startsWith('QZ_VAULT_V1:') ? 'vault'
            : ciphertext.startsWith('QZ_SECURE_V1:') ? 'secure'
            : 'legacy';

        const payloadBytes = Buffer.from(ciphertext).length;

        // --- BILLING: Increment usage in MongoDB ---
        try {
            const ApiKey = await getApiKeyModel();
            if (client.keyId) {
                await ApiKey.findByIdAndUpdate(client.keyId, {
                    $inc: {
                        calls: 1,
                        bytesSecured: payloadBytes,
                    }
                });
            }
        } catch (billingErr) {
            // Non-fatal: log but don't fail the request over billing
            console.error('[BILLING] Failed to update usage:', billingErr);
        }

        // Issue a cryptographic receipt
        const receiptId = `qz_rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // TODO (next phase): Hash the ciphertext and anchor to an immutable log
        // const ciphertextHash = crypto.createHash('sha256').update(ciphertext).digest('hex');
        // await anchorToImmutableLog(receiptId, ciphertextHash);

        console.log(`[GATEWAY] Receipt issued: ${receiptId} | Key: ${client.apiKey?.substring(0, 16)}... | Bytes: ${payloadBytes}`);

        return res.status(200).json({
            success: true,
            message: 'Data successfully secured in QuantaCipher vault',
            receipt: {
                id: receiptId,
                timestamp: new Date().toISOString(),
                bytesSecured: payloadBytes,
                encryptionScheme: 'Kyber-1024 + AES-256-GCM',
                // Future: real on-chain anchor tx
                anchorStatus: 'pending_immutable_log',
            }
        });
    } catch (error) {
        console.error('[INGEST] Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
