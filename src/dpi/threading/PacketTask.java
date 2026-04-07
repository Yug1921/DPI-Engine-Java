package dpi.threading;

public class PacketTask {

    public final byte[] rawPacket;
    public final long tsSec;
    public final long tsUsec;
    public final boolean poison;

    // Keep constructor order compatible with your ReaderWorker usage
    public PacketTask(byte[] rawPacket, long tsSec, long tsUsec) {
        this.rawPacket = rawPacket;
        this.tsSec = tsSec;
        this.tsUsec = tsUsec;
        this.poison = false;
    }

    private PacketTask(boolean poison) {
        this.rawPacket = null;
        this.tsSec = 0L;
        this.tsUsec = 0L;
        this.poison = poison;
    }

    public static PacketTask poison() {
        return new PacketTask(true);
    }

    public boolean isPoison() {
        return poison;
    }
}