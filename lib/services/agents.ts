import {
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from '@/lib/hooks/useFirestore';

export interface Agent {
  id?: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  licenseNumber: string;
  yearsExperience: number;
  status: 'active' | 'inactive' | 'on-leave';
  customersAssigned: number;
  totalSales: number;
  conversionRate: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Add a new agent to Firestore
 */
export async function addAgent(agent: Omit<Agent, 'id'>) {
  try {
    const docId = await addFirestoreDoc('agents', agent);
    return docId;
  } catch (error) {
    throw new Error(`Failed to add agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing agent
 */
export async function updateAgent(agentId: string, updates: Partial<Agent>) {
  try {
    await updateFirestoreDoc('agents', agentId, updates);
  } catch (error) {
    throw new Error(`Failed to update agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an agent
 */
export async function deleteAgent(agentId: string) {
  try {
    await deleteFirestoreDoc('agents', agentId);
  } catch (error) {
    throw new Error(`Failed to delete agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get agent by ID (use hook in components)
 * Example: const { data: agent } = useFirestoreDoc<Agent>('agents', agentId);
 */

/**
 * Get all agents (use hook in components)
 * Example: const { data: agents } = useFirestoreCollection<Agent>('agents');
 */

/**
 * Get agents by region (use hook with constraints)
 * Example:
 * const { data: regionAgents } = useFirestoreCollection<Agent>(
 *   'agents',
 *   [where('region', '==', 'North America')]
 * );
 */
