package dpi.tls;

public class SNIExtractor {

    public static String extract(byte[] payload) {

        if (payload == null || payload.length < 5) {
            return null;
        }

        // TLS record type must be Handshake (0x16)
        if ((payload[0] & 0xFF) != 0x16) {
            return null;
        }

        // Handshake type must be ClientHello (0x01)
        if ((payload[5] & 0xFF) != 0x01) {
            return null;
        }

        int pos = 43;

        if (pos >= payload.length) {
            return null;
        }

        int sessionIdLength = payload[pos] & 0xFF;
        pos += 1 + sessionIdLength;

        if (pos + 2 > payload.length) {
            return null;
        }

        int cipherLen = ((payload[pos] & 0xFF) << 8) | (payload[pos + 1] & 0xFF);
        pos += 2 + cipherLen;

        if (pos >= payload.length) {
            return null;
        }

        int compressionLen = payload[pos] & 0xFF;
        pos += 1 + compressionLen;

        if (pos + 2 > payload.length) {
            return null;
        }

        int extensionsLen = ((payload[pos] & 0xFF) << 8) | (payload[pos + 1] & 0xFF);
        pos += 2;

        int extensionsEnd = pos + extensionsLen;

        while (pos + 4 <= extensionsEnd && pos + 4 <= payload.length) {

            int extType = ((payload[pos] & 0xFF) << 8) | (payload[pos + 1] & 0xFF);
            int extLen = ((payload[pos + 2] & 0xFF) << 8) | (payload[pos + 3] & 0xFF);

            pos += 4;

            if (extType == 0x0000) {

                if (pos + 5 > payload.length) {
                    return null;
                }

                int sniLen = ((payload[pos + 3] & 0xFF) << 8) | (payload[pos + 4] & 0xFF);

                if (pos + 5 + sniLen > payload.length) {
                    return null;
                }

                return new String(payload, pos + 5, sniLen);
            }

            pos += extLen;
        }

        return null;
    }
}