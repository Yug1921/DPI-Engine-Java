package dpi.parser;

import dpi.packet.PacketInfo;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class PacketParser {

    public static PacketInfo parse(byte[] data) {

        // Minimum Ethernet + IP header
        if (data.length < 34) {
            return null;
        }

        ByteBuffer buffer = ByteBuffer.wrap(data);
        buffer.order(ByteOrder.BIG_ENDIAN);

        // -----------------------------
        // Ethernet Header
        // -----------------------------
        buffer.position(12);
        int etherType = buffer.getShort() & 0xFFFF;

        int ipStart;

        // VLAN support
        if (etherType == 0x8100) {
            buffer.position(16);
            etherType = buffer.getShort() & 0xFFFF;
            ipStart = 18;
        } else {
            ipStart = 14;
        }

        // Only IPv4
        if (etherType != 0x0800) {
            return null;
        }

        // -----------------------------
        // IP Header
        // -----------------------------
        buffer.position(ipStart);
        int ipHeaderStart = buffer.position();

        int versionIhl = buffer.get() & 0xFF;

        int version = (versionIhl >> 4);
        if (version != 4) {
            return null;
        }

        int ihl = (versionIhl & 0x0F) * 4;

        buffer.position(ipHeaderStart + 9);
        int protocol = buffer.get() & 0xFF;

        // Source + Destination IP
        buffer.position(ipHeaderStart + 12);
        long srcIp = Integer.toUnsignedLong(buffer.getInt());
        long dstIp = Integer.toUnsignedLong(buffer.getInt());

        // -----------------------------
        // Transport Layer (SAFE)
        // -----------------------------
        int srcPort = 0;
        int dstPort = 0;
        byte[] payload = new byte[0];

        int transportStart = ipHeaderStart + ihl;

        // Only parse ports/payload if TCP or UDP
        if (protocol == 6 || protocol == 17) {

            if (transportStart + 4 > data.length) {
                return null;
            }

            buffer.position(transportStart);

            srcPort = buffer.getShort() & 0xFFFF;
            dstPort = buffer.getShort() & 0xFFFF;

            int headerLength;

            if (protocol == 6) { // TCP
                if (transportStart + 13 > data.length) {
                    return null;
                }

                buffer.position(transportStart + 12);
                int dataOffset = ((buffer.get() & 0xFF) >> 4);
                headerLength = dataOffset * 4;

            } else {
                headerLength = 8; // UDP
            }

            int payloadStart = transportStart + headerLength;

            if (payloadStart < data.length) {
                int payloadLength = data.length - payloadStart;
                payload = new byte[payloadLength];
                System.arraycopy(data, payloadStart, payload, 0, payloadLength);
            }
        }

        return new PacketInfo(
                srcIp,
                dstIp,
                srcPort,
                dstPort,
                protocol,
                payload
        );
    }
}