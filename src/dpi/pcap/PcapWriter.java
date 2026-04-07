package dpi.pcap;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class PcapWriter {

    private final FileOutputStream fos;

    public PcapWriter(String filename) throws IOException {
        fos = new FileOutputStream(filename);
        writeGlobalHeader();
    }

    private void writeGlobalHeader() throws IOException {

        ByteBuffer buffer = ByteBuffer.allocate(24);
        buffer.order(ByteOrder.LITTLE_ENDIAN);

        buffer.putInt(0xa1b2c3d4);
        buffer.putShort((short)2);
        buffer.putShort((short)4);
        buffer.putInt(0);
        buffer.putInt(0);
        buffer.putInt(65535);
        buffer.putInt(1);

        fos.write(buffer.array());
    }

    public void writePacket(
            long tsSec,
            long tsUsec,
            byte[] packetData
    ) throws IOException {

        ByteBuffer header = ByteBuffer.allocate(16);
        header.order(ByteOrder.LITTLE_ENDIAN);

        header.putInt((int)tsSec);
        header.putInt((int)tsUsec);
        header.putInt(packetData.length);
        header.putInt(packetData.length);

        fos.write(header.array());
        fos.write(packetData);
    }

    public void close() throws IOException {
        fos.close();
    }
}