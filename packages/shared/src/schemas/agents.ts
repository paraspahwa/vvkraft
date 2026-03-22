import { z } from "zod";

// ─── Primitive enums ─────────────────────────────────────────────────────────

export const agentIdSchema = z.enum([
  "orchestrator-master",
  "architect-lead",
  "arch-frontend",
  "arch-backend",
  "arch-mobile",
  "arch-database",
  "arch-aiml",
  "arch-security",
  "product-manager",
  "prod-ux",
  "prod-copy",
  "prod-qa",
  "prod-analytics",
  "devops-sre",
  "dev-infra",
  "dev-cicd",
  "dev-sec",
  "code-generator",
  "code-reviewer",
]);

export const agentTierSchema = z.enum(["orchestrator", "lead", "sub"]);

export const projectPhaseSchema = z.enum([
  "architecture",
  "specification",
  "implementation",
  "testing",
  "deployment",
]);

export const prioritySchema = z.enum(["critical", "high", "medium", "low"]);

export const authorityLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const toolIdSchema = z.enum([
  // Code tools
  "code_writer",
  "test_generator",
  "refactor_engine",
  "doc_generator",
  "linter",
  // Architecture tools
  "system_designer",
  "tech_evaluator",
  "schema_designer",
  "api_designer",
  "pattern_library",
  // Product tools
  "story_writer",
  "prioritizer",
  "flow_designer",
  "spec_writer",
  "acceptance_definer",
  "wireframe_generator",
  "pattern_selector",
  "accessibility_checker",
  "copy_generator",
  "tone_checker",
  "clarity_scorer",
  // DevOps tools
  "infra_generator",
  "pipeline_designer",
  "monitoring_setup",
  "cost_optimizer",
  // Orchestrator tools
  "task_router",
  "progress_tracker",
  "conflict_resolver",
  "quality_gate",
  "knowledge_query",
]);

export const agentSkillSchema = z.enum([
  // Core skills
  "context_awareness",
  "communication",
  "decision_making",
  "learning",
  "error_recovery",
  // Architect skills
  "system_design",
  "technology_evaluation",
  "pattern_recognition",
  "scalability_analysis",
  "security_review",
  // Product skills
  "requirements_analysis",
  "user_story_writing",
  "prioritization",
  "ux_design",
  "copywriting",
  // DevOps skills
  "infrastructure_as_code",
  "ci_cd_pipeline_design",
  "monitoring_setup",
  "cost_optimization",
  "incident_response",
  // Code skills
  "typescript",
  "react_nextjs",
  "nodejs",
  "database_design",
  "api_integration",
  "testing",
]);

// ─── Agent Configuration ─────────────────────────────────────────────────────

export const agentConfigSchema = z.object({
  agentId: agentIdSchema,
  role: z.string().min(1),
  goal: z.string().min(1),
  backstory: z.string().min(1),
  tier: agentTierSchema,
  model: z.enum(["gpt-4", "claude-3", "gemini-pro"]),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().positive(),
  authorityLevel: authorityLevelSchema,
  skills: z.array(agentSkillSchema),
  tools: z.array(toolIdSchema),
  subordinates: z.array(agentIdSchema),
  reportingTo: agentIdSchema.nullable(),
  responsibilities: z.array(z.string()),
  constraints: z.array(z.string()),
  successCriteria: z.array(z.string()),
});

// ─── Communication Protocol ──────────────────────────────────────────────────

export const messageTypeSchema = z.enum([
  "task_assignment",
  "status_update",
  "question",
  "response",
  "decision_request",
  "escalation",
  "broadcast",
]);

export const messageStatusSchema = z.enum([
  "pending",
  "delivered",
  "acknowledged",
  "resolved",
]);

export const messageContextSchema = z.object({
  projectPhase: projectPhaseSchema,
  priority: prioritySchema,
  deadline: z.string().datetime(),
});

export const agentMessageSchema = z.object({
  messageId: z.string().uuid(),
  timestamp: z.string().datetime(),
  sender: agentIdSchema,
  recipient: z.union([agentIdSchema, z.literal("broadcast")]),
  messageType: messageTypeSchema,
  context: messageContextSchema,
  payload: z.record(z.unknown()),
  requiresResponse: z.boolean(),
  responseDeadline: z.string().datetime().nullable(),
  status: messageStatusSchema,
});

export const agentMessageResponseSchema = z.object({
  responseId: z.string().uuid(),
  originalMessageId: z.string().uuid(),
  timestamp: z.string().datetime(),
  sender: agentIdSchema,
  recipient: agentIdSchema,
  payload: z.record(z.unknown()),
});

// ─── Knowledge Store ─────────────────────────────────────────────────────────

export const decisionTypeSchema = z.enum(["technical", "product", "process"]);

export const decisionStatusSchema = z.enum([
  "proposed",
  "approved",
  "rejected",
  "implemented",
  "superseded",
]);

export const decisionOptionSchema = z.object({
  option: z.string().min(1),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

export const decisionSchema = z.object({
  decisionId: z.string().uuid(),
  timestamp: z.string().datetime(),
  proposingAgent: agentIdSchema,
  decisionType: decisionTypeSchema,
  title: z.string().min(1),
  context: z.string().min(1),
  optionsConsidered: z.array(decisionOptionSchema),
  decision: z.string().min(1),
  rationale: z.string().min(1),
  approvingAuthority: z.union([agentIdSchema, z.literal("human")]),
  status: decisionStatusSchema,
  implementationReference: z.string().nullable(),
});

export const memoryTypeSchema = z.enum([
  "architectural_decision",
  "pattern",
  "failure",
  "project_context",
  "user_preference",
]);

export const agentMemorySchema = z.object({
  agentId: agentIdSchema,
  memoryType: memoryTypeSchema,
  content: z.string().min(1),
  importance: z.number().int().min(1).max(10),
  createdAt: z.string().datetime(),
});

// ─── Task Management ─────────────────────────────────────────────────────────

export const taskStatusSchema = z.enum([
  "backlog",
  "assigned",
  "in_progress",
  "review",
  "completed",
  "blocked",
  "failed",
]);

export const agentTaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  assignedTo: agentIdSchema,
  assignedBy: agentIdSchema,
  projectPhase: projectPhaseSchema,
  priority: prioritySchema,
  status: taskStatusSchema,
  acceptanceCriteria: z.array(z.string()),
  expectedOutputs: z.array(z.string()),
  deadline: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dependsOn: z.array(z.string().uuid()),
  retryCount: z.number().int().min(0).max(3),
});

export const taskProgressUpdateSchema = z.object({
  taskId: z.string().uuid(),
  agentId: agentIdSchema,
  timestamp: z.string().datetime(),
  percentComplete: z.number().min(0).max(100),
  currentStep: z.string().min(1),
  blockers: z.array(z.string()),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type AgentConfigInput = z.infer<typeof agentConfigSchema>;
export type AgentMessageInput = z.infer<typeof agentMessageSchema>;
export type AgentMessageResponseInput = z.infer<typeof agentMessageResponseSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
export type AgentMemoryInput = z.infer<typeof agentMemorySchema>;
export type AgentTaskInput = z.infer<typeof agentTaskSchema>;
export type TaskProgressUpdateInput = z.infer<typeof taskProgressUpdateSchema>;
