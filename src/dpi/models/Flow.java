package dpi.models;

public class Flow {

    public FiveTuple tuple;

    public String sni = "";
    public AppType appType = AppType.UNKNOWN;

    public boolean blocked = false;

    public int packetCount = 0;

    public Flow(FiveTuple tuple) {
        this.tuple = tuple;
    }

    public void incrementPackets() {
        packetCount++;
    }

    public void setSni(String sni) {
        this.sni = sni;
    }

    public void setAppType(AppType type) {
        this.appType = type;
    }

    public void block() {
        this.blocked = true;
    }

}