package dpi.packet;

import dpi.models.FiveTuple;

public class PacketInfo {

    public long srcIp;
    public long dstIp;

    public int srcPort;
    public int dstPort;

    public int protocol;

    public byte[] payload;

    public String sni;

    public PacketInfo(long srcIp, long dstIp,
                      int srcPort, int dstPort,
                      int protocol,
                      byte[] payload) {

        this.srcIp = srcIp;
        this.dstIp = dstIp;
        this.srcPort = srcPort;
        this.dstPort = dstPort;
        this.protocol = protocol;
        this.payload = payload;
    }

    public FiveTuple getFiveTuple() {
        return new FiveTuple(srcIp, dstIp, srcPort, dstPort, protocol);
    }
}