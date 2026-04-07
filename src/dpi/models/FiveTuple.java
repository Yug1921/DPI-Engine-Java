package dpi.models;

import java.util.Objects;

public class FiveTuple {

    public long srcIp;
    public long dstIp;
    public int srcPort;
    public int dstPort;
    public int protocol;

    public FiveTuple(long srcIp, long dstIp, int srcPort, int dstPort, int protocol) {
        this.srcIp = srcIp;
        this.dstIp = dstIp;
        this.srcPort = srcPort;
        this.dstPort = dstPort;
        this.protocol = protocol;
    }

    public String formatIp(long ip) {
        return (ip & 0xFF) + "." +
               ((ip >> 8) & 0xFF) + "." +
               ((ip >> 16) & 0xFF) + "." +
               ((ip >> 24) & 0xFF);
    }

    @Override
    public String toString() {
        String proto = (protocol == 6) ? "TCP" :
                       (protocol == 17) ? "UDP" : "?";

        return formatIp(srcIp) + ":" + srcPort +
               " -> " +
               formatIp(dstIp) + ":" + dstPort +
               " (" + proto + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FiveTuple)) return false;
        FiveTuple that = (FiveTuple) o;
        return srcIp == that.srcIp &&
               dstIp == that.dstIp &&
               srcPort == that.srcPort &&
               dstPort == that.dstPort &&
               protocol == that.protocol;
    }

    @Override
    public int hashCode() {
        return Objects.hash(srcIp, dstIp, srcPort, dstPort, protocol);
    }
}