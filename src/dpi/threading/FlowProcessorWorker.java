package dpi.threading;

import dpi.classifier.AppClassifier;
import dpi.models.*;
import dpi.packet.PacketInfo;
import dpi.parser.PacketParser;
import dpi.pcap.PcapWriter;
import dpi.rules.RuleEngine;
import dpi.tls.SNIExtractor;
import java.util.Map;
import java.util.concurrent.BlockingQueue;

public class FlowProcessorWorker implements Runnable {

    private BlockingQueue<PacketTask> queue;
    private Map<FiveTuple, Flow> flows;
    private RuleEngine rules;
    private PcapWriter writer;

    public int processed = 0;

    private Map<String, AppType> detectedDomains;
    private Map<AppType, Integer> appStats;

    public FlowProcessorWorker(
            BlockingQueue<PacketTask> queue,
            Map<FiveTuple, Flow> flows,
            RuleEngine rules,
            PcapWriter writer,
            Map<AppType, Integer> appStats,
            Map<String, AppType> detectedDomains
    ) {
        this.queue = queue;
        this.flows = flows;
        this.rules = rules;
        this.writer = writer;
        this.appStats = appStats;
        this.detectedDomains = detectedDomains;
    }

    @Override
    public void run() {
        try {
            while (true) {
                PacketTask task = queue.take();

                if (task == null) continue;
                if (task.isPoison()) break; // clean shutdown

                PacketInfo packet = PacketParser.parse(task.rawPacket);
                if (packet == null) continue;

                FiveTuple tuple = packet.getFiveTuple();

                Flow flow = flows.computeIfAbsent(tuple, Flow::new);
                flow.incrementPackets();

                // detect SNI
                if (packet.payload != null) {
                    String sni = SNIExtractor.extract(packet.payload);

                    if (sni != null && !sni.isBlank() && (flow.sni == null || flow.sni.isEmpty())) {
                        flow.setSni(sni);

                        AppType type = AppClassifier.sniToAppType(sni);
                        flow.setAppType(type);

                        appStats.merge(type, 1, Integer::sum);
                        detectedDomains.putIfAbsent(sni.toLowerCase(), type);
                    }
                }

                boolean blocked = rules.isBlocked(
                        Long.toString(packet.srcIp),
                        flow.sni == null ? "" : flow.sni,
                        flow.appType
                );

                if (!blocked) {
                    writer.writePacket(task.tsSec, task.tsUsec, task.rawPacket);
                }

                processed++;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}