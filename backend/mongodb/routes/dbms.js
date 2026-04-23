// ============================================
// DBMS Concepts Routes - MongoDB Implementation
// Concurrent Transaction Simulation
// Serializability Engine (Conflict & View)
// Deadlock Detection
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');

async function getNextId(db, name) {
    const ret = await db.collection('counters').findOneAndUpdate(
        { _id: name }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true }
    );
    return ret.seq;
}

// ══════════════════════════════════════════════
// 1. CONCURRENT TRANSACTION SIMULATION
// ══════════════════════════════════════════════
router.post('/simulate-concurrent-booking', async (req, res) => {
    const { train_id, seat_number } = req.body;
    const steps = [];

    try {
        if (!train_id || !seat_number) {
            return res.status(400).json({ success: false, message: 'train_id and seat_number are required' });
        }

        const db = getDb();
        const trainIdNum = parseInt(train_id);
        const seatNum = parseInt(seat_number);

        steps.push({ time: 'T0', action: 'SIMULATION START', detail: `Simulating T1 and T2 both trying to book Seat ${seatNum} on Train ${trainIdNum}` });

        // T1: BEGIN
        steps.push({ time: 'T1', transaction: 'T1', action: 'BEGIN TRANSACTION', sql: 'session1.startTransaction()' });
        // T2: BEGIN
        steps.push({ time: 'T2', transaction: 'T2', action: 'BEGIN TRANSACTION', sql: 'session2.startTransaction()' });

        // T1: Read seat
        const seat = await db.collection('seats').findOne({ train_id: trainIdNum, seat_number: seatNum });

        steps.push({
            time: 'T3', transaction: 'T1', action: 'READ SEAT (findOneAndUpdate – ATOMIC LOCK)',
            sql: `db.seats.findOneAndUpdate({train_id: ${trainIdNum}, seat_number: ${seatNum}, is_booked: false}, {$set: {is_booked: true}})`,
            result: seat && !seat.is_booked ? 'AVAILABLE – ATOMICALLY LOCKED BY T1' : (seat ? 'ALREADY BOOKED' : 'NOT FOUND')
        });

        // T2: Attempt
        steps.push({
            time: 'T4', transaction: 'T2', action: 'ATTEMPT READ SEAT (findOneAndUpdate)',
            sql: `db.seats.findOneAndUpdate({train_id: ${trainIdNum}, seat_number: ${seatNum}, is_booked: false}, {$set: {is_booked: true}})`,
            result: '⏳ BLOCKED – T1 already performed atomic update'
        });

        let conflictDetected = false;

        if (seat && !seat.is_booked) {
            // T1 books (simulate via atomic update)
            await db.collection('seats').updateOne(
                { train_id: trainIdNum, seat_number: seatNum },
                { $set: { is_booked: true } }
            );
            steps.push({ time: 'T5', transaction: 'T1', action: 'UPDATE SEAT (BOOK)', sql: `db.seats.updateOne(...)`, result: 'SEAT MARKED AS BOOKED BY T1' });
            steps.push({ time: 'T6', transaction: 'T1', action: 'COMMIT', result: 'T1 COMMITTED – Lock Released' });

            // T2 finds seat already booked
            const seat2 = await db.collection('seats').findOne({ train_id: trainIdNum, seat_number: seatNum });
            steps.push({
                time: 'T7', transaction: 'T2', action: 'READ SEAT (NOW UNBLOCKED)',
                result: seat2.is_booked ? '❌ CONFLICT – Seat already booked by T1' : 'AVAILABLE'
            });

            if (seat2.is_booked) {
                conflictDetected = true;
                steps.push({ time: 'T8', transaction: 'T2', action: 'ROLLBACK', result: 'T2 ROLLED BACK – Cannot book same seat' });
            }

            // Undo T1's change to restore state
            await db.collection('seats').updateOne(
                { train_id: trainIdNum, seat_number: seatNum },
                { $set: { is_booked: false } }
            );
        } else {
            steps.push({ time: 'T5', action: 'BOTH ROLLED BACK', result: 'Seat was already booked' });
        }

        // Log
        const logId = await getNextId(db, 'log_id');
        await db.collection('transaction_logs').insertOne({
            log_id: logId, operation: 'CONCURRENT_SIM',
            status: conflictDetected ? 'CONFLICT' : 'SUCCESS',
            details: JSON.stringify({ train_id: trainIdNum, seat_number: seatNum, conflict: conflictDetected }),
            timestamp: new Date()
        });

        res.json({
            success: true, simulation: 'Concurrent Booking', conflict_detected: conflictDetected, steps,
            dbms_concepts: {
                locking: 'findOneAndUpdate provides atomic read-modify-write (document-level locking)',
                isolation: 'MongoDB uses document-level locking for write operations',
                prevention: 'Atomic operations prevent concurrent modification of same document'
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message, steps });
    }
});

// ══════════════════════════════════════════════
// 2. CONFLICT SERIALIZABILITY ENGINE
// ══════════════════════════════════════════════
router.post('/check-serializability', async (req, res) => {
    try {
        let { transactions } = req.body;
        if (!transactions || transactions.length === 0) {
            transactions = [
                { id: 'T1', operations: [{ type: 'READ', resource: 'A' }, { type: 'WRITE', resource: 'A' }, { type: 'READ', resource: 'B' }] },
                { id: 'T2', operations: [{ type: 'READ', resource: 'A' }, { type: 'WRITE', resource: 'B' }] },
                { id: 'T3', operations: [{ type: 'WRITE', resource: 'A' }, { type: 'READ', resource: 'B' }, { type: 'WRITE', resource: 'B' }] }
            ];
        }

        const schedule = [];
        const maxOps = Math.max(...transactions.map(t => t.operations.length));
        for (let i = 0; i < maxOps; i++) {
            for (const txn of transactions) {
                if (i < txn.operations.length) schedule.push({ transaction: txn.id, ...txn.operations[i] });
            }
        }

        const graph = {};
        const edges = [];
        transactions.forEach(t => { graph[t.id] = []; });

        for (let i = 0; i < schedule.length; i++) {
            for (let j = i + 1; j < schedule.length; j++) {
                const op1 = schedule[i], op2 = schedule[j];
                if (op1.transaction !== op2.transaction && op1.resource === op2.resource && (op1.type === 'WRITE' || op2.type === 'WRITE')) {
                    if (!graph[op1.transaction].includes(op2.transaction)) {
                        graph[op1.transaction].push(op2.transaction);
                        edges.push({ from: op1.transaction, to: op2.transaction, reason: `${op1.type}(${op1.resource}) in ${op1.transaction} conflicts with ${op2.type}(${op2.resource}) in ${op2.transaction}` });
                    }
                }
            }
        }

        let mermaidGraph = 'graph TD\n';
        Object.keys(graph).forEach(node => { mermaidGraph += `  ${node}(("${node}"))\n`; });
        edges.forEach(edge => { mermaidGraph += `  ${edge.from} -->|"${edge.reason.split(' ')[0]}"| ${edge.to}\n`; });

        const cycleResult = detectCycle(graph);

        res.json({
            success: true, simulation: 'Conflict Serializability Check', input_transactions: transactions, schedule, mermaid_graph: mermaidGraph,
            precedence_graph: { nodes: Object.keys(graph), edges, adjacency_list: graph }, cycle_detection: cycleResult,
            result: { is_serializable: !cycleResult.hasCycle, verdict: !cycleResult.hasCycle ? '✅ CONFLICT-SERIALIZABLE — Serialization graph is acyclic.' : '❌ NOT CONFLICT-SERIALIZABLE — Serialization graph contains a cycle.' }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ══════════════════════════════════════════════
// 3. VIEW SERIALIZABILITY ENGINE
// ══════════════════════════════════════════════
router.post('/check-view-serializability', async (req, res) => {
    try {
        let { transactions } = req.body;
        if (!transactions || transactions.length === 0) {
            transactions = [
                { id: 'T1', operations: [{ type: 'READ', resource: 'A' }, { type: 'WRITE', resource: 'A' }] },
                { id: 'T2', operations: [{ type: 'WRITE', resource: 'A' }] },
                { id: 'T3', operations: [{ type: 'WRITE', resource: 'A' }] }
            ];
        }

        const schedule = [];
        const maxOps = Math.max(...transactions.map(t => t.operations.length));
        for (let i = 0; i < maxOps; i++) {
            for (const txn of transactions) {
                if (i < txn.operations.length) schedule.push({ transaction: txn.id, ...txn.operations[i] });
            }
        }

        const permutations = getPermutations(transactions.map(t => t.id));
        let viewSerializableOrder = null;

        for (const p of permutations) {
            const serialSchedule = [];
            p.forEach(tid => {
                const txn = transactions.find(t => t.id === tid);
                txn.operations.forEach(op => serialSchedule.push({ transaction: tid, ...op }));
            });
            if (isViewEquivalent(schedule, serialSchedule)) { viewSerializableOrder = p; break; }
        }

        res.json({
            success: true, simulation: 'View Serializability Check', input_transactions: transactions, schedule,
            result: { is_serializable: !!viewSerializableOrder, equivalent_serial_order: viewSerializableOrder ? viewSerializableOrder.join(' → ') : 'None',
                verdict: viewSerializableOrder ? `✅ VIEW-SERIALIZABLE — View equivalent to serial schedule (${viewSerializableOrder.join(' → ')}).` : '❌ NOT VIEW-SERIALIZABLE — Not equivalent to any serial schedule.' }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ══════════════════════════════════════════════
// 4. DEADLOCK DETECTION & SIMULATION
// ══════════════════════════════════════════════
router.post('/simulate-deadlock', async (req, res) => {
    const steps = [];
    try {
        steps.push({ time: 'T0', action: 'DEADLOCK SIMULATION START', detail: 'T1 holds Lock(A), T2 holds Lock(B). Both request the other.' });
        steps.push({ time: 'T1', transaction: 'T1', action: 'LOCK TRAIN (A)', sql: 'db.trains.findOneAndUpdate({locked: true})', result: '🔒 T1 holds Train' });
        steps.push({ time: 'T2', transaction: 'T2', action: 'LOCK PAYMENT (B)', sql: 'db.payments.findOneAndUpdate({locked: true})', result: '🔒 T2 holds Payment' });
        steps.push({ time: 'T3', transaction: 'T1', action: 'REQUEST PAYMENT (B)', sql: 'db.payments.findOne({...})', result: '⏳ T1 WAITING for T2' });
        steps.push({ time: 'T4', transaction: 'T2', action: 'REQUEST TRAIN (A)', sql: 'db.trains.findOne({...})', result: '⏳ T2 WAITING for T1' });

        const mermaidGraph = `graph TD\n  T1(("T1")) -->|"waiting for Payment"| T2(("T2"))\n  T2 -->|"waiting for Train"| T1\n  style T1 fill:#fee2e2,stroke:#ef4444\n  style T2 fill:#fee2e2,stroke:#ef4444`;

        res.json({
            success: true, deadlock_detected: true, mermaid_graph: mermaidGraph, steps,
            resolution: { method: 'Wait-Die Scheme', victim: 'T2', explanation: 'T2 is aborted to break the cycle.' }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ══════════════════════════════════════════════
// 5. ACID PROPERTIES DEMONSTRATION
// ══════════════════════════════════════════════
router.get('/acid-demo', async (req, res) => {
    try {
        const db = getDb();
        const demos = {};

        // Atomicity demo
        demos.atomicity = { status: 'OK', explanation: 'Atomicity: MongoDB guarantees atomic single-document operations. Multi-document operations use manual rollback patterns.' };

        // Consistency demo
        demos.consistency = { status: 'OK', explanation: 'Consistency: MongoDB enforces schema validation rules and unique indexes to maintain data integrity.' };

        // Isolation demo
        demos.isolation = { status: 'OK', level: 'Document-level locking (WiredTiger)', explanation: 'Isolation: MongoDB uses document-level locking. Concurrent writes to different documents proceed in parallel.' };

        // Durability demo
        demos.durability = { status: 'OK', explanation: 'Durability: MongoDB uses write-ahead journaling (WiredTiger journal) to ensure committed writes survive crashes.' };

        res.json({ success: true, properties: demos });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function detectCycle(graph) {
    const visited = {}, recStack = {};
    function dfs(node) {
        visited[node] = true; recStack[node] = true;
        for (const neighbor of (graph[node] || [])) {
            if (!visited[neighbor]) { if (dfs(neighbor)) return true; }
            else if (recStack[neighbor]) return true;
        }
        recStack[node] = false; return false;
    }
    for (const node of Object.keys(graph)) { if (!visited[node] && dfs(node)) return { hasCycle: true }; }
    return { hasCycle: false };
}

function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    const perms = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        getPermutations(rest).forEach(p => perms.push([arr[i], ...p]));
    }
    return perms;
}

function isViewEquivalent(s1, s2) {
    const rf1 = getReadFrom(s1), rf2 = getReadFrom(s2);
    if (JSON.stringify(rf1) !== JSON.stringify(rf2)) return false;
    const fw1 = getFinalWrites(s1), fw2 = getFinalWrites(s2);
    if (JSON.stringify(fw1) !== JSON.stringify(fw2)) return false;
    return true;
}

function getReadFrom(s) {
    const relations = [], lastWriter = {};
    s.forEach(op => {
        if (op.type === 'WRITE') lastWriter[op.resource] = op.transaction;
        else if (op.type === 'READ') relations.push({ reader: op.transaction, resource: op.resource, writer: lastWriter[op.resource] || 'INITIAL' });
    });
    return relations.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function getFinalWrites(s) {
    const fw = {};
    s.forEach(op => { if (op.type === 'WRITE') fw[op.resource] = op.transaction; });
    return fw;
}

module.exports = router;
