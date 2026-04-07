package dpi.threading;

import dpi.pcap.PcapReader;
import java.util.List;
import java.util.concurrent.BlockingQueue;

public class ReaderWorker implements Runnable {

    private final PcapReader reader;
    private final List<BlockingQueue<PacketTask>> queues;
    private final int maxPackets; // -1 means unlimited

    public int packetsRead = 0;

    // statistics
    public int[] lbDispatchCount;

    public ReaderWorker(
            PcapReader reader,
            List<BlockingQueue<PacketTask>> queues
    ) {
        this(reader, queues, -1);
    }

    public ReaderWorker(
            PcapReader reader,
            List<BlockingQueue<PacketTask>> queues,
            int maxPackets
    ) {
        this.reader = reader;
        this.queues = queues;
        this.maxPackets = maxPackets;
        this.lbDispatchCount = new int[queues.size()];
    }

    @Override
    public void run() {
        try {
            byte[] rawPacket;
            int index = 0;

            while ((rawPacket = reader.readPacket()) != null) {
                if (maxPackets > 0 && packetsRead >= maxPackets) {
                    break;
                }

                int lbIndex = index % queues.size();

                PacketTask task = new PacketTask(
                        rawPacket,
                        reader.currentTsSec,
                        reader.currentTsUsec
                );

                queues.get(lbIndex).put(task);
                lbDispatchCount[lbIndex]++;

                index++;
                packetsRead++;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}