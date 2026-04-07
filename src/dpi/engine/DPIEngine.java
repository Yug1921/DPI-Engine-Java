package dpi.engine;

import dpi.models.AppType;
import dpi.models.Flow;
import dpi.models.FiveTuple;
import dpi.pcap.PcapReader;
import dpi.pcap.PcapWriter;
import dpi.rules.RuleEngine;
import dpi.threading.FlowProcessorWorker;
import dpi.threading.PacketTask;
import dpi.threading.ReaderWorker;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;

public class DPIEngine {

    private final RuleEngine rules;

    private final Map<FiveTuple, Flow> flows = new ConcurrentHashMap<>();
    private final Map<AppType, Integer> appStats = new ConcurrentHashMap<>();
    private final Map<String, AppType> detectedDomains = new ConcurrentHashMap<>();

    private int totalPackets = 0;

    public DPIEngine(RuleEngine rules) {
        this.rules = rules;
    }

    /*
        MULTI THREAD ENGINE
     */
    public void run(String inputFile, String outputFile, int maxPackets) throws Exception {

        long t0 = System.currentTimeMillis();

        new File("output").mkdirs();

        PcapReader reader = new PcapReader();
        reader.open(inputFile);

        PcapWriter writer = new PcapWriter(outputFile);

        /*
            THREAD CONFIGURATION
            Keep modest defaults to reduce context-switch overhead for small/medium captures.
         */
        int loadBalancers = 2;
        int flowProcessorsPerLB = 2;
        int totalFP = loadBalancers * flowProcessorsPerLB;

        printBanner(loadBalancers, flowProcessorsPerLB, totalFP);

        /*
            CREATE QUEUES
         */
        List<BlockingQueue<PacketTask>> queues = new ArrayList<>();
        for (int i = 0; i < loadBalancers; i++) {
            queues.add(new LinkedBlockingQueue<>());
        }

        /*
            START READER THREAD
            Assumes ReaderWorker supports (reader, queues, maxPackets).
            If your ReaderWorker currently has only (reader, queues), update it next.
         */
        ReaderWorker readerWorker = new ReaderWorker(reader, queues, maxPackets);
        Thread readerThread = new Thread(readerWorker, "reader-thread");
        readerThread.start();

        /*
            START FLOW PROCESSOR THREADS
         */
        List<FlowProcessorWorker> workers = new ArrayList<>();
        List<Thread> workerThreads = new ArrayList<>();

        for (int i = 0; i < totalFP; i++) {
            BlockingQueue<PacketTask> queue = queues.get(i % loadBalancers);

            FlowProcessorWorker worker = new FlowProcessorWorker(
                    queue,
                    flows,
                    rules,
                    writer,
                    appStats,
                    detectedDomains
            );

            Thread t = new Thread(worker, "fp-" + i);
            workers.add(worker);
            workerThreads.add(t);
            t.start();
        }

        /*
            WAIT READER FINISH
         */
        readerThread.join();

        /*
            SIGNAL WORKERS TO STOP USING POISON TASKS
            One poison per worker on each queue mapping.
            Assumes PacketTask has a static poison factory OR constructor variant.
            We use PacketTask.poison() below.
         */
        for (int i = 0; i < totalFP; i++) {
            BlockingQueue<PacketTask> q = queues.get(i % loadBalancers);
            q.put(PacketTask.poison());
        }

        /*
            WAIT WORKERS TO FINISH
         */
        for (Thread t : workerThreads) {
            t.join();
        }

        reader.close();
        writer.close();

        totalPackets = readerWorker.packetsRead;

        printReport(workers, readerWorker, loadBalancers);
        printAppBreakdown(appStats, totalPackets);
        printDetectedDomains(detectedDomains);

        long t1 = System.currentTimeMillis();
        System.out.println("[PERF] dpiEngineRunMs=" + (t1 - t0));
    }

    /*
        ENGINE BANNER
     */
    private void printBanner(int lbs, int fpsPerLB, int totalFP) {
        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║              DPI ENGINE v2.0 (Multi-threaded)              ║");
        System.out.println("╠═════════════════════════��════════════════════════════════════╣");
        System.out.printf("║ Load Balancers: %-3d FPs per LB: %-3d Total FPs: %-3d       ║\n", lbs, fpsPerLB, totalFP);
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
        System.out.println();
    }

    /*
        REPORT
     */
    private void printReport(List<FlowProcessorWorker> workers, ReaderWorker readerWorker, int loadBalancers) {

        int processed = 0;
        for (FlowProcessorWorker w : workers) {
            processed += w.processed;
        }

        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║                      PROCESSING REPORT                       ║");
        System.out.println("╠══════════════════════════════════════════════════════════════╣");
        System.out.printf("║ Total Packets: %-6d                                         ║\n", readerWorker.packetsRead);
        System.out.printf("║ Processed: %-6d                                             ║\n", processed);
        System.out.printf("║ Active Flows: %-6d                                          ║\n", flows.size());
        System.out.println("╠══════════════════════════════════════════════════════════════╣");
        System.out.println("║ THREAD STATISTICS                                            ║");

        // LOAD BALANCER STATS
        for (int i = 0; i < loadBalancers; i++) {
            System.out.printf("║   LB%-2d dispatched: %-6d                                    ║\n",
                    i,
                    readerWorker.lbDispatchCount[i]);
        }

        // FLOW PROCESSOR STATS
        for (int i = 0; i < workers.size(); i++) {
            System.out.printf("║   FP%-2d processed: %-6d                                     ║\n",
                    i,
                    workers.get(i).processed);
        }

        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }

    /*
        APPLICATION TABLE
     */
    private void printAppBreakdown(Map<AppType, Integer> appStats, int totalPackets) {
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║                   APPLICATION BREAKDOWN                      ║");
        System.out.println("╠══════════════════════════════════════════════════════════════╣");

        if (totalPackets <= 0 || appStats.isEmpty()) {
            System.out.println("║ No application data                                          ║");
            System.out.println("╚══════════════════════════════════════════════════════════════╝");
            return;
        }

        for (AppType app : appStats.keySet()) {
            int count = appStats.get(app);
            double percent = 100.0 * count / totalPackets;
            int bars = (int) (percent / 5);

            StringBuilder bar = new StringBuilder();
            for (int i = 0; i < bars; i++) {
                bar.append("#");
            }

            String blockedLabel = rules.isBlocked("", "", app) ? " (BLOCKED)" : "";

            System.out.printf(
                    "║ %-18s %4d  %5.1f%% %-15s %-10s ║\n",
                    AppType.toDisplayName(app),
                    count,
                    percent,
                    bar,
                    blockedLabel
            );
        }

        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }

    private void printDetectedDomains(Map<String, AppType> domains) {
        System.out.println();
        System.out.println("[Detected Domains/SNIs]");

        if (domains == null || domains.isEmpty()) {
            System.out.println("  (none)");
            return;
        }

        for (String domain : domains.keySet()) {
            System.out.println(
                    "  - " + domain + " -> " + AppType.toDisplayName(domains.get(domain))
            );
        }
    }
}