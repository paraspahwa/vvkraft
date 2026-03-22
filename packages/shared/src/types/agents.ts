// Agent system types for VideoForge Multi-Agent AI Development System

// ─── Agent Identity ─────────────────────────────────────────────────────────

/** All defined agent IDs in the system */
export type AgentId =
  | "orchestrator-master"
  | "architect-lead"
  | "arch-frontend"
  | "arch-backend"
  | "arch-mobile"
  | "arch-database"
  | "arch-aiml"
  | "arch-security"
  | "product-manager"
  | "prod-ux"
  | "prod-copy"
  | "prod-qa"
  | "prod-analytics"
  | "devops-sre"
  | "dev-infra"
  | "dev-cicd"
  | "dev-sec"
  | "code-generator"
  | "code-reviewer";

/** Tier/category of an agent */
export type AgentTier = "orchestrator" | "lead" | "sub";

/** Project phases that tasks and messages are scoped to */
export type ProjectPhase =
  | "architecture"
  | "specification"
  | "implementation"
  | "testing"
  | "deployment";

/** Priority levels for tasks and messages */
export type Priority = "critical" | "high" | "medium" | "low";

/** Authority level (1 = lowest, 5 = highest) */
export type AuthorityLevel = 1 | 2 | 3 | 4 | 5;

// ─── Skills & Tools ─────────────────────────────────────────────────────────

/** Core skills shared by all agents */
export type CoreSkill =
  | "context_awareness"
  | "communication"
  | "decision_making"
  | "learning"
  | "error_recovery";

/** Specialized skills for architect agents */
export type ArchitectSkill =
  | "system_design"
  | "technology_evaluation"
  | "pattern_recognition"
  | "scalability_analysis"
  | "security_review";

/** Specialized skills for product agents */
export type ProductSkill =
  | "requirements_analysis"
  | "user_story_writing"
  | "prioritization"
  | "ux_design"
  | "copywriting";

/** Specialized skills for devops agents */
export type DevOpsSkill =
  | "infrastructure_as_code"
  | "ci_cd_pipeline_design"
  | "monitoring_setup"
  | "cost_optimization"
  | "incident_response";

/** Specialized skills for code agents */
export type CodeSkill =
  | "typescript"
  | "react_nextjs"
  | "nodejs"
  | "database_design"
  | "api_integration"
  | "testing";

export type AgentSkill = CoreSkill | ArchitectSkill | ProductSkill | DevOpsSkill | CodeSkill;

/** Tool IDs available in the system */
export type ToolId =
  // Code tools
  | "code_writer"
  | "test_generator"
  | "refactor_engine"
  | "doc_generator"
  | "linter"
  // Architecture tools
  | "system_designer"
  | "tech_evaluator"
  | "schema_designer"
  | "api_designer"
  | "pattern_library"
  // Product tools
  | "story_writer"
  | "prioritizer"
  | "flow_designer"
  | "spec_writer"
  | "acceptance_definer"
  | "wireframe_generator"
  | "pattern_selector"
  | "accessibility_checker"
  | "copy_generator"
  | "tone_checker"
  | "clarity_scorer"
  // DevOps tools
  | "infra_generator"
  | "pipeline_designer"
  | "monitoring_setup"
  | "cost_optimizer"
  // Orchestrator tools
  | "task_router"
  | "progress_tracker"
  | "conflict_resolver"
  | "quality_gate"
  | "knowledge_query";

/** Metadata for a tool */
export interface Tool {
  id: ToolId;
  description: string;
  input: string;
  output: string;
}

// ─── Agent Configuration ─────────────────────────────────────────────────────

/** Full configuration for a single agent */
export interface AgentConfig {
  agentId: AgentId;
  role: string;
  goal: string;
  backstory: string;
  tier: AgentTier;
  /** LLM model to use for this agent */
  model: "gpt-4" | "claude-3" | "gemini-pro";
  temperature: number;
  maxTokens: number;
  authorityLevel: AuthorityLevel;
  skills: AgentSkill[];
  tools: ToolId[];
  /** IDs of direct sub-agents this agent manages (empty for leaf agents) */
  subordinates: AgentId[];
  /** Parent agent this agent reports to (null for orchestrator) */
  reportingTo: AgentId | null;
  responsibilities: string[];
  constraints: string[];
  successCriteria: string[];
}

// ─── Communication Protocol ──────────────────────────────────────────────────

export type MessageType =
  | "task_assignment"
  | "status_update"
  | "question"
  | "response"
  | "decision_request"
  | "escalation"
  | "broadcast";

export type MessageStatus = "pending" | "delivered" | "acknowledged" | "resolved";

/** Message context metadata */
export interface MessageContext {
  projectPhase: ProjectPhase;
  priority: Priority;
  deadline: string; // ISO 8601
}

/** Structured JSON message used for all inter-agent communication */
export interface AgentMessage {
  messageId: string;
  timestamp: string; // ISO 8601
  sender: AgentId;
  /** Recipient agent ID, or "broadcast" for all agents */
  recipient: AgentId | "broadcast";
  messageType: MessageType;
  context: MessageContext;
  /** Message-specific payload */
  payload: Record<string, unknown>;
  requiresResponse: boolean;
  responseDeadline: string | null; // ISO 8601
  status: MessageStatus;
}

/** A response to an AgentMessage */
export interface AgentMessageResponse {
  responseId: string;
  originalMessageId: string;
  timestamp: string; // ISO 8601
  sender: AgentId;
  recipient: AgentId;
  payload: Record<string, unknown>;
}

// ─── Knowledge Store ─────────────────────────────────────────────────────────

export type DecisionType = "technical" | "product" | "process";

export type DecisionStatus = "proposed" | "approved" | "rejected" | "implemented" | "superseded";

export interface DecisionOption {
  option: string;
  pros: string[];
  cons: string[];
}

/** Architecture / product / process decision logged to the shared knowledge store */
export interface Decision {
  decisionId: string;
  timestamp: string; // ISO 8601
  proposingAgent: AgentId;
  decisionType: DecisionType;
  title: string;
  context: string;
  optionsConsidered: DecisionOption[];
  decision: string;
  rationale: string;
  approvingAuthority: AgentId | "human";
  status: DecisionStatus;
  /** Git commit hash or PR number, set when status is 'implemented' */
  implementationReference: string | null;
}

/** Entry in the vector-indexed code search index */
export interface CodeIndexEntry {
  id: string;
  filePath: string;
  contentHash: string;
  /** 1536-dimension embedding stored externally; typed as number[] here */
  embedding: number[];
  metadata: Record<string, unknown>;
  lastUpdated: string; // ISO 8601
}

export type MemoryType =
  | "architectural_decision"
  | "pattern"
  | "failure"
  | "project_context"
  | "user_preference";

/** Persistent memory entry for an individual agent */
export interface AgentMemory {
  agentId: AgentId;
  memoryType: MemoryType;
  content: string;
  /** Relative importance 1–10; higher = more likely to be retrieved */
  importance: number;
  createdAt: string; // ISO 8601
}

// ─── Task Management ─────────────────────────────────────────────────────────

export type TaskStatus =
  | "backlog"
  | "assigned"
  | "in_progress"
  | "review"
  | "completed"
  | "blocked"
  | "failed";

/** An atomic unit of work assigned to an agent */
export interface AgentTask {
  taskId: string;
  title: string;
  description: string;
  assignedTo: AgentId;
  assignedBy: AgentId;
  projectPhase: ProjectPhase;
  priority: Priority;
  status: TaskStatus;
  acceptanceCriteria: string[];
  expectedOutputs: string[];
  deadline: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /** IDs of tasks that must complete before this one can start */
  dependsOn: string[];
  /** Number of retry attempts (max 3 before human intervention) */
  retryCount: number;
}

/** Status update emitted by an agent on an in-progress task */
export interface TaskProgressUpdate {
  taskId: string;
  agentId: AgentId;
  timestamp: string; // ISO 8601
  percentComplete: number;
  currentStep: string;
  blockers: string[];
}
