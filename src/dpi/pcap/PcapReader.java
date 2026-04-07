package dpi.pcap;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class PcapReader {

    // timestamps of current packet
    public long currentTsSec;
    public long currentTsUsec;

    private ByteOrder byteOrder;
    private FileInputStream input;

    /*
        OPEN PCAP FILE
     */
    public void open(String filename) throws IOException {

        input = new FileInputStream(filename);

        byte[] globalHeader = new byte[24];

        int readBytes = input.read(globalHeader);

        if (readBytes != 24) {
            throw new IOException("Invalid PCAP header");
        }

        /*
            Detect endian format
         */
        int magicBig = ByteBuffer.wrap(globalHeader)
                .order(ByteOrder.BIG_ENDIAN)
                .getInt();

        int magicLittle = ByteBuffer.wrap(globalHeader)
                .order(ByteOrder.LITTLE_ENDIAN)
                .getInt();

        if (magicBig == 0xa1b2c3d4) {

            byteOrder = ByteOrder.BIG_ENDIAN;

            System.out.println("PCAP Format: BIG ENDIAN");

        } else if (magicLittle == 0xa1b2c3d4) {

            byteOrder = ByteOrder.LITTLE_ENDIAN;

            System.out.println("PCAP Format: LITTLE ENDIAN");

        } else {

            throw new IOException("Invalid PCAP file format");
        }

        /*
            Print version info
         */
        ByteBuffer buffer = ByteBuffer.wrap(globalHeader);

        buffer.order(byteOrder);

        buffer.getInt(); // skip magic

        int versionMajor = buffer.getShort();

        int versionMinor = buffer.getShort();

        System.out.println("Opened PCAP file: " + filename);

        System.out.println(
                "  Version: "
                        + versionMajor
                        + "."
                        + versionMinor
        );
    }

    /*
        READ NEXT PACKET
     */
    public byte[] readPacket() throws IOException {

        byte[] packetHeader = new byte[16];

        int read = input.read(packetHeader);

        if (read == -1) {
            return null;
        }

        if (read != 16) {
            return null;
        }

        ByteBuffer buffer = ByteBuffer.wrap(packetHeader);

        buffer.order(byteOrder);

        /*
            SAVE timestamps
         */
        currentTsSec = buffer.getInt() & 0xffffffffL;

        currentTsUsec = buffer.getInt() & 0xffffffffL;

        int inclLen = buffer.getInt();

        int origLen = buffer.getInt();

        /*
            safety validation
         */
        if (inclLen <= 0 || inclLen > 65535) {
            return null;
        }

        byte[] packetData = new byte[inclLen];

        int bytesRead = input.read(packetData);

        if (bytesRead != inclLen) {
            return null;
        }

        return packetData;
    }

    /*
        CLOSE FILE
     */
    public void close() throws IOException {

        if (input != null) {
            input.close();
        }
    }
}