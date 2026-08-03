# Action Migration Report

The accepted `canonical_action_system_v1` remains authoritative. No action definitions, timing contracts, queues, or safety policies were removed.

Each existing action now has normalized cost, requirement, reward, queue, and canonical action profiles. These profiles reference the original action definition and duration/queue contracts. Active action instances, timer state, queue state, player modifiers, and saves remain Game-owned.
