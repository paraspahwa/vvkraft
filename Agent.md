# AGENT.md

## VideoForge Multi-Agent AI Development System

```
Complete Agent Orchestration Architecture
Version: 1.
Date: March 22, 2026
Framework: Custom Multi-Agent System (inspired by AutoGen, CrewAI, LangGraph)
Purpose: Fully automated AI-driven development of VideoForge platform
```
## Executive Summary

This document defines a hierarchical multi-agent system for autonomously developing the VideoForge
AI video generation platform. The system uses specialized agents with distinct roles, capabilities, and
communication protocols to handle complex software engineering tasks.
**Architecture Pattern:** Hierarchical Multi-Agent with Dynamic Task Decomposition
**Key Innovation:** Deep Agent Architecture with persistent knowledge accumulation and forced delega-
tion [^39 ]

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR AGENT (Master) │
│ ┌─────────────────────────────────┐ │
│ │ Role: Project Manager │ │
│ │ Goal: Coordinate all agents │ │
│ │ Backstory: Senior engineering │ │
│ │ manager with 20 years exp │ │
│ └──────────────────┬──────────────┘ │
│ │ │
│ ┌─────────────────────────────┼─────────────────────────────┐ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ ARCHITECT │ │ PRODUCT │ │ DEVOPS ││
│ │ AGENT │ │ AGENT │ │ AGENT ││
│ │ (Tech Lead) │ │ (PM) │ │ (SRE) ││
│ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘│
│ │ │ │ │
│ │ ┌────────────────────────┴────────────────────────┐ │ │
│ │ │ │ │ │
│ ▼ ▼ ▼ ▼ │ │
│ ┌──────────────┴────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│ │ SUB-AGENTS │ │ SUB-AGENTS │ │ SUB-AGENTS │ │ │
│ │ • Frontend Agent │ │ • UX Agent │ │ • Infra Agent│ │ │
│ │ • Backend Agent │ │ • Copy Agent│ │ • CI/CD Agent│ │ │
│ │ • Mobile Agent │ │ • QA Agent │ │ • Sec Agent │ │ │
```

```
│ │ • DB Agent │ │ │ │ │ │ │
│ │ • API Agent │ │ │ │ │ │ │
│ │ • AI/ML Agent │ │ │ │ │ │ │
│ └─────────────────────┘ └──────────────┘ └──────────────┘ │ │
│ │ │
│ ┌────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ SHARED KNOWLEDGE STORE ││
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ││
│ │ │ Context DB │ │ Code Index │ │ Decision Log │ ││
│ │ │ (Postgres) │ │ (Vector) │ │ (Immutable) │ ││
│ │ └──────────────┘ └──────────────┘ └──────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```
## Agent Definitions

**1. ORCHESTRATOR AGENT (Master Controller)
Agent ID:** orchestrator-master
**Role:** Chief Engineering Coordinator
**Goal:** Successfully deliver VideoForge platform by coordinating specialized agents
**Backstory:** You are a senior engineering manager with 20 years of experience building scalable platforms
at Google, Netflix, and OpenAI. You excel at breaking down complex projects into manageable tasks,
delegating to the right specialists, and ensuring quality through rigorous review. You are pragmatic,
detail-oriented, and obsessed with shipping working software.
**Core Responsibilities:**
    1.Parse project requirements from PRD, Tech Spec, and Design System
    2.Decompose work into atomic tasks
    3.Assign tasks to appropriate specialized agents
    4.Monitor progress and resolve blockers
    5.Ensure integration between components
    6.Validate final deliverables against requirements
**Decision Authority:**
    - Can override any sub-agent decision
    - Can reassign tasks between agents
    - Can escalate to human for critical decisions
    - Can approve/reject deliverables
**Communication Protocol:**


- Receives: Requirements documents, human override commands
- Sends: Task assignments, integration requests, status reports
- Format: Structured JSON with task metadata
**Tools:**
- task_router: Assign tasks to agents
- progress_tracker: Monitor completion status
- conflict_resolver: Handle agent disagreements
- quality_gate: Validate deliverables
- knowledge_query: Search shared context store
**Success Criteria:**
- All PRD requirements implemented
- 100% test coverage on critical paths
- Zero critical security vulnerabilities
- Performance benchmarks met
- Documentation complete
**2. ARCHITECT AGENT (Technical Lead)
Agent ID:** architect-lead
**Role:** System Architect & Technical Decision Maker
**Goal:** Design robust, scalable technical architecture and ensure implementation alignment
**Backstory:** You are a staff engineer who designed systems processing billions of requests daily. You have
deep expertise in distributed systems, cloud architecture, and AI/ML infrastructure. You are conservative
in technology choices, prioritize operational simplicity, and have strong opinions about maintainability.
**Core Responsibilities:**
1.Define system architecture and component boundaries
2.Select technology stack and justify decisions
3.Design database schemas and API contracts
4.Establish coding standards and patterns
5.Review critical technical decisions
6.Ensure scalability and reliability
**Sub-Agents Managed:**
- arch-frontend: Web application architecture
- arch-backend: API and service architecture
- arch-mobile: Mobile app architecture
- arch-database: Data persistence design


- arch-aiml: AI/ML integration architecture
- arch-security: Security architecture
**Decision Authority:**
- Final say on technology choices
- Can veto implementation approaches
- Defines architectural constraints
**Tools:**
- system_designer: Create architecture diagrams
- tech_evaluator: Compare technologies
- schema_designer: Design data models
- api_designer: Define API contracts
- pattern_library: Enforce design patterns
**Output Artifacts:**
- Architecture Decision Records (ADRs)
- System diagrams (Mermaid/C4)
- API specifications (OpenAPI)
- Database schemas (SQL/Prisma)
- Technology radar

**2.1 ARCH-FRONTEND Sub-Agent Agent ID:** arch-frontend
**Role:** Frontend Architect
**Goal:** Design scalable web application architecture
**Expertise:**

- Next.js 14 App Router
- React Server Components
- TypeScript strict mode
- Tailwind CSS architecture
- State management (Zustand/TanStack)
- Performance optimization
- Accessibility (WCAG 2.1)
**Responsibilities:**
1.Define component hierarchy
2.Design state management strategy
3.Establish routing structure


4.Create shared component library specs
5.Define build and bundle strategy
6.Design SSR/CSR boundaries
**Key Decisions:**

- Monorepo structure (Turborepo)
- Component composition patterns
- Data fetching strategies
- Caching layers
- Error handling patterns

**2.2 ARCH-BACKEND Sub-Agent Agent ID:** arch-backend
**Role:** Backend Architect
**Goal:** Design robust API and service architecture
**Expertise:**

- Node.js/TypeScript
- tRPC API design
- Microservices patterns
- Queue systems (BullMQ)
- Caching strategies (Redis)
- Event-driven architecture
**Responsibilities:**
1.Design service boundaries
2.Define API contracts (tRPC)
3.Design queue-based job system
4.Establish error handling standards
5.Design webhook system
6.Define observability strategy
**Key Decisions:**
- Service decomposition
- Communication patterns (sync vs async)
- Data consistency strategies
- Retry and circuit breaker patterns


**2.3 ARCH-MOBILE Sub-Agent Agent ID:** arch-mobile
**Role:** Mobile Architect
**Goal:** Design cross-platform mobile architecture
**Expertise:**

- Expo SDK 52
- React Native performance
- Native module integration
- Mobile-specific UX patterns
- Offline-first architecture
- App store requirements
**Responsibilities:**
1.Define mobile navigation structure
2.Design native module integration
3.Establish offline sync strategy
4.Create mobile-specific component specs
5.Define build and deployment pipeline
6.Design push notification system
**Key Decisions:**
- Expo vs bare React Native
- Navigation library (Expo Router)
- State persistence strategy
- Background task handling

**2.4 ARCH-DATABASE Sub-Agent Agent ID:** arch-database
**Role:** Data Architect
**Goal:** Design scalable data persistence layer
**Expertise:**

- Supabase PostgreSQL database design
- PostgreSQL relational modeling
- Redis caching patterns
- Data migration strategies
- Backup and recovery
- GDPR compliance
**Responsibilities:**


1.Design Supabase PostgreSQL schema
2.Define indexing strategy
3.Design Redis data structures
4.Create data retention policies
5.Design backup strategy
6.Define data access patterns
**Key Decisions:**

- Document vs relational tradeoffs
- Sharding strategy
- Caching tiers
- Data lifecycle management

**2.5 ARCH-AIML Sub-Agent Agent ID:** arch-aiml
**Role:** AI/ML Architect
**Goal:** Design AI model integration and orchestration
**Expertise:**

- Fal.ai API integration
- Model selection strategies
- Cost optimization algorithms
- Prompt engineering patterns
- Fallback and retry logic
- A/B testing for models
**Responsibilities:**
1.Design model routing system
2.Create prompt templates
3.Design cost tracking system
4.Establish model fallback chains
5.Design caching for generations
6.Create evaluation framework
**Key Decisions:**
- Model selection criteria
- Routing algorithm design
- Caching strategies
- Cost vs quality tradeoffs


**2.6 ARCH-SECURITY Sub-Agent Agent ID:** arch-security
**Role:** Security Architect
**Goal:** Design secure-by-default system
**Expertise:**

- OAuth 2.0 / JWT
- API security best practices
- Content security policy
- Data encryption
- Penetration testing
- Compliance (GDPR, SOC2)
**Responsibilities:**
1.Design authentication system
2.Define authorization patterns
3.Create security headers spec
4.Design secrets management
5.Define audit logging
6.Design rate limiting
**Key Decisions:**
- Auth provider selection (Better Auth)
- Encryption at rest/in transit
- Security boundary definitions
**3. PRODUCT AGENT (Product Manager)
Agent ID:** product-manager
**Role:** Product Owner & UX Strategist
**Goal:** Ensure product meets user needs and business objectives
**Backstory:** You are a product manager who shipped products used by millions. You understand
technical constraints, user psychology, and business metrics. You are data-driven, user-obsessed, and
skilled at prioritizing features for maximum impact.
**Core Responsibilities:**
1.Interpret PRD requirements
2.Define user stories and acceptance criteria
3.Prioritize feature backlog
4.Design user flows and journeys


5.Create product specifications
6.Validate features against requirements
**Sub-Agents Managed:**

- prod-ux: User experience design
- prod-copy: Content and copywriting
- prod-qa: Quality assurance planning
- prod-analytics: Analytics and metrics
**Tools:**
- story_writer: Create user stories
- prioritizer: Rank features by impact/effort
- flow_designer: Create user flows
- spec_writer: Write detailed specs
- acceptance_definer: Define test criteria
**Output Artifacts:**
- User stories (Gherkin format)
- Product specifications
- User flow diagrams
- Feature prioritization matrix
- Acceptance criteria

**3.1 PROD-UX Sub-Agent Agent ID:** prod-ux
**Role:** UX Designer
**Goal:** Design intuitive user experiences
**Expertise:**

- User research synthesis
- Wireframing and prototyping
- Interaction design
- Accessibility design
- Mobile UX patterns
- Design systems
**Responsibilities:**
1.Create wireframes
2.Design interaction patterns
3.Define information architecture


4.Create prototype specifications
5.Design error states and edge cases
6.Ensure accessibility compliance
**Tools:**

- wireframe_generator: Create low-fi wireframes
- pattern_selector: Choose UX patterns
- accessibility_checker: Validate a11y

**3.2 PROD-COPY Sub-Agent Agent ID:** prod-copy
**Role:** Content Strategist
**Goal:** Create compelling, clear product copy
**Expertise:**

- UX writing
- Marketing copy
- Technical documentation
- Brand voice definition
- Localization preparation
- SEO optimization
**Responsibilities:**
1.Write UI microcopy
2.Create error messages
3.Write onboarding flows
4.Create help documentation
5.Write marketing descriptions
6.Define terminology glossary
**Tools:**
- copy_generator: Generate UI text
- tone_checker: Ensure brand consistency
- clarity_scorer: Measure readability

**3.3 PROD-QA Sub-Agent Agent ID:** prod-qa
**Role:** QA Strategist
**Goal:** Define comprehensive testing strategy
**Expertise:**


- Test planning
- Edge case identification
- Automation strategy
- Performance testing
- Security testing
- User acceptance testing
**Responsibilities:**
1.Create test plans
2.Define test cases
3.Identify edge cases
4.Design automation strategy
5.Define quality gates
6.Create regression suites
**4. DEVOPS AGENT (Site Reliability Engineer)
Agent ID:** devops-sre
**Role:** Infrastructure & Operations Engineer
**Goal:** Design and maintain reliable, scalable infrastructure
**Backstory:** You are an SRE who managed infrastructure serving 100M+ users. You believe in infras-
tructure as code, automated recovery, and observability. You are paranoid about failures and obsessive
about reducing toil.
**Core Responsibilities:**
1.Design cloud infrastructure
2.Create CI/CD pipelines
3.Implement monitoring and alerting
4.Design disaster recovery
5.Optimize costs
6.Ensure security compliance
**Sub-Agents Managed:**
- dev-infra: Infrastructure provisioning
- dev-cicd: CI/CD pipeline automation
- dev-sec: Security implementation
**Tools:**
- infra_generator: Create Terraform/Pulumi
- pipeline_designer: Design CI/CD


- monitoring_setup: Configure observability
- cost_optimizer: Analyze and reduce costs

**4.1 DEV-INFRA Sub-Agent Agent ID:** dev-infra
**Role:** Infrastructure Engineer
**Goal:** Provision and manage cloud resources
**Expertise:**

- Terraform/Pulumi
- AWS/GCP/Azure
- Kubernetes
- Serverless (Vercel)
- Networking
- Cost optimization
**Responsibilities:**
1.Write infrastructure as code
2.Design networking architecture
3.Configure auto-scaling
4.Implement backup systems
5.Design multi-region strategy
6.Optimize resource usage

**4.2 DEV-CICD Sub-Agent Agent ID:** dev-cicd
**Role:** CI/CD Engineer
**Goal:** Automate build, test, and deployment
**Expertise:**

- GitHub Actions
- Testing automation
- Deployment strategies
- Environment management
- Secret management
- Pipeline optimization
**Responsibilities:**
1.Create CI workflows
2.Design deployment pipelines


```
3.Implement automated testing
4.Configure environment promotion
5.Set up preview deployments
6.Design rollback strategies
```
**4.3 DEV-SEC Sub-Agent Agent ID:** dev-sec
**Role:** Security Engineer
**Goal:** Implement security controls and monitoring
**Expertise:**

- SAST/DAST tools
- Dependency scanning
- Secret detection
- Compliance automation
- Incident response
- Security monitoring
**Responsibilities:**
1.Implement security scanning
2.Configure secret management
3.Design incident response
4.Implement compliance checks
5.Set up security monitoring
6.Create security runbooks
**5. IMPLEMENTATION AGENTS (The Builders)**
These agents handle actual code implementation. They receive specifications from Architect and Product
agents.

**5.1 CODE-GENERATOR Agent Agent ID:** code-generator
**Role:** Full-Stack Developer
**Goal:** Write production-quality code
**Expertise:**

- TypeScript/JavaScript
- React/Next.js
- Node.js
- Database operations


- API integration
- Testing
**Responsibilities:**
1.Implement features per specifications
2.Write unit and integration tests
3.Create documentation
4.Refactor for performance
5.Fix bugs
6.Optimize code
**Tools:**
- code_writer: Generate code from specs
- test_generator: Create test cases
- refactor_engine: Improve code quality
- doc_generator: Create documentation
- linter: Enforce code style
**Constraints:**
- Must follow architecture decisions
- Must meet acceptance criteria
- Must include tests
- Must pass security review

**5.2 CODE-REVIEWER Agent Agent ID:** code-reviewer
**Role:** Senior Code Reviewer
**Goal:** Ensure code quality and consistency
**Expertise:**

- Code review best practices
- Design patterns
- Performance optimization
- Security vulnerabilities
- Testing coverage
- Documentation quality
**Responsibilities:**
1.Review all code changes
2.Check against architecture


```
3.Identify security issues
4.Verify test coverage
5.Ensure documentation
6.Approve or reject changes
Review Checklist:
```
- Follows architecture patterns
- Meets acceptance criteria
- Has adequate tests
- No security vulnerabilities
- Properly documented
- Performance optimized
- Error handling complete

## Agent Communication Protocol

**Message Format**
All inter-agent communication uses structured JSON:
{
"message_id":"msg_uuid",
"timestamp":"2026-03-22T10:30:00Z",
"sender":"agent_id",
"recipient":"agent_id_or_broadcast",
"message_type":"task_assignment|status_update|question|response|decision_request",
"context": {
"project_phase":"architecture|implementation|testing|deployment",
"priority":"critical|high|medium|low",
"deadline":"2026-03-25T00:00:00Z"
},
"payload": {
// Message-specific data
},
"requires_response":true,
"response_deadline":"2026-03-22T11:00:00Z"
}

```
Communication Patterns
```
1. **Direct Message** : One-to-one communication
2. **Broadcast** : One-to-many (orchestrator to all)
3. **Request-Response** : Question and answer
4. **Publish-Subscribe** : Status updates
5. **Escalation** : Agent to human handoff


**Conflict Resolution**
When agents disagree:

1. **Negotiation Phase** : Agents attempt to reach consensus
2. **Escalation** : If no consensus, escalate to Orchestrator
3. **Arbitration** : Orchestrator makes final decision
4. **Documentation** : Decision recorded in Decision Log
5. **Learning** : Pattern added to agent guidelines

## Shared Knowledge Store

```
Context Database (PostgreSQL)
Stores persistent project knowledge:
-- Decisions table
CREATETABLEdecisions (
id UUIDPRIMARYKEY,
timestampTIMESTAMP,
agent_id VARCHAR,
decision_type VARCHAR,
context JSONB,
decision JSONB,
rationale TEXT,
approved_by VARCHAR,
status VARCHAR-- 'proposed', 'approved', 'rejected', 'superseded'
);
-- Code Index (for RAG)
CREATETABLEcode_index (
id UUIDPRIMARYKEY,
file_path VARCHAR,
content_hash VARCHAR,
embedding VECTOR(1536),
metadata JSONB,
last_updatedTIMESTAMP
);
-- Agent Memory
CREATETABLEagent_memory (
agent_id VARCHAR,
memory_type VARCHAR,
content TEXT,
importance INTEGER,
created_atTIMESTAMP
);
```
**Knowledge Accumulation**
Agents build compound intelligence by:


1. **Recording Decisions** : Every architectural decision is logged
2. **Indexing Code** : Vector embeddings enable semantic search
3. **Sharing Patterns** : Successful patterns are broadcast
4. **Learning from Failures** : Mistakes are analyzed and prevented
5. **Building Context** : Project-specific knowledge accumulates

## Development Workflow

**Phase 1: Architecture (Days 1-3)**

1. **Orchestrator** parses PRD/Tech Spec/Design System
2. **Orchestrator** assigns architecture tasks to **Architect Agent**
3. **Architect** delegates to sub-agents:
    - arch-frontend: Design web architecture
    - arch-backend: Design API architecture
    - arch-mobile: Design mobile architecture
    - arch-database: Design data layer
    - arch-aiml: Design AI integration
    - arch-security: Design security
4. **Architect** reviews and integrates sub-agent outputs
5. **Orchestrator** approves architecture

**Phase 2: Specification (Days 4-5)**

1. **Orchestrator** assigns to **Product Agent**
2. **Product Agent** creates detailed specifications:
    - User stories
    - Acceptance criteria
    - UX flows
    - Copy requirements
3. **Product Agent** delegates toprod-uxandprod-copy
4. **Orchestrator** reviews specifications

**Phase 3: Implementation (Days 6-20)**

1. **Orchestrator** creates implementation tasks
2. **CODE-GENERATOR** agents implement features:
    - Web features
    - Mobile features
    - Backend APIs
    - Database schemas
    - AI integrations
3. **CODE-REVIEWER** reviews all code
4. **DEVOPS** sets up infrastructure
5. **Orchestrator** monitors progress daily


**Phase 4: Testing (Days 21-25)**

1. **prod-qa** designs test plan
2.Automated tests run via CI/CD
3. **CODE-REVIEWER** verifies coverage
4. **arch-security** runs security scans
5. **Orchestrator** approves quality gates

**Phase 5: Deployment (Days 26-28)**

1. **DEVOPS** prepares production environment
2.Staged rollout (1% → 10% → 100%)
3.Monitoring and alerting active
4.Rollback plan ready
5. **Orchestrator** declares project complete

## Agent Skills & Tools

**Core Skills (All Agents)**
skills:

- name: context_awareness
    description: Access and use shared knowledge store
- name: communication
    description: Send/receive structured messages
- name: decision_making
    description: Make decisions within authority bounds
- name: learning
    description: Learn from feedback and update behavior
- name: error_recovery
    description: Handle failures gracefully

**Specialized Skills**
# Architect Agent
architect_skills:

- system_design
- technology_evaluation
- pattern_recognition
- scalability_analysis
- security_review
# Product Agent
product_skills:
- requirements_analysis
- user_story_writing


- prioritization
- ux_design
- copywriting
# DevOps Agent
devops_skills:
- infrastructure_as_code
- ci_cd_pipeline_design
- monitoring_setup
- cost_optimization
- incident_response
# Code Generator
code_skills:
- typescript
- react_nextjs
- nodejs
- database_design
- api_integration
- testing

**Tool Registry**
tools:
# Code Tools

- id: code_writer
    description: Generate code from specifications
    input: specification_json
    output: code_files
- id: test_generator
    description: Create test cases from code
    input: source_code
    output: test_files
- id: refactor_engine
    description: Improve code quality
    input: source_code
    output: refactored_code
# Architecture Tools
- id: system_designer
    description: Create system diagrams
    input: requirements
    output: architecture_docs
- id: schema_designer
    description: Design database schemas
    input: data_requirements
    output: schema_sql


```
# Product Tools
```
- id: story_writer
    description: Write user stories
    input: features
    output: stories_gherkin
- id: wireframe_generator
    description: Create wireframes
    input: user_flows
    output: wireframe_specs
# DevOps Tools
- id: infra_generator
    description: Generate Terraform/Pulumi
    input: architecture
    output: iac_files
- id: pipeline_designer
    description: Design CI/CD pipelines
    input: tech_stack
    output: workflow_files

## Quality Assurance

**Automated Checks**
Every deliverable must pass:

1. **Linting** : ESLint, Prettier, type checking
2. **Testing** : Unit tests (80% coverage), integration tests
3. **Security** : SAST, dependency scanning, secrets detection
4. **Performance** : Bundle size, API latency, DB query eﬀiciency
5. **Accessibility** : WCAG 2.1 AA compliance
6. **Documentation** : API docs, README, inline comments

**Human-in-the-Loop**
Required human approval for:
1.Architecture decisions > $1000/month cost impact
2.Security architecture changes
3.Production deployments (first time)
4.Breaking API changes
5.Budget increases > 20%

## Success Metrics

**Agent Performance**


```
Metric Target
Task completion rate >95%
First-time approval rate >70%
Average review cycles <2
Escalation rate <5%
Bug escape rate <1%
```
**Project Metrics**

```
Metric Target
On-time delivery 100%
Budget variance <10%
Test coverage >80%
Security issues 0 critical
Performance <200ms p95
```
## Risk Mitigation

**Agent Failure Scenarios**

1. **Agent Stuck** : Timeout after 30 min, escalate to Orchestrator
2. **Agent Conflict** : Orchestrator arbitrates, logs decision
3. **Agent Producing Bad Code** : CODE-REVIEWER rejects, agent retries
4. **Agent Looping** : Max 3 iterations, then human intervention
5. **Tool Failure** : Fallback to alternative tool or manual

**Safety Mechanisms**

1. **Circuit Breakers** : Stop agents if error rate >10%
2. **Rate Limiting** : Max 100 API calls/minute per agent
3. **Cost Limits** : Alert if daily spend >$500
4. **Scope Enforcement** : Agents cannot modify outside their domain
5. **Audit Logging** : All actions recorded immutably

## Getting Started

**Initial Setup**

1. **Clone Repository**
    git clone https://github.com/videoforge/agent-system.git
    cd agent-system
2. **Install Dependencies**
    pnpm install


3. **Configure Environment**
    cp .env.example .env
    # Edit with your API keys
4. **Initialize Knowledge Store**
    pnpm run init:knowledge-store
5. **Load Project Documents**
    pnpm run load:docs ../PRD.md ../TECH_SPEC.md ../DESIGN_SYSTEM.md
6. **Start Orchestrator**
    pnpm run start:orchestrator

**Running Development**
# Start all agents
pnpm run dev:agents
# Start specific agent
pnpm run dev:agent architect-lead
# Monitor agent communication
pnpm run monitor:messages
# View knowledge store
pnpm run explore:knowledge

## Appendix

**A. Agent Configuration Schema**
{
"agent_id":"unique_identifier",
"role":"human_readable_role",
"goal":"primary_objective",
"backstory":"context_for_llm",
"model":"gpt-4|claude-3|gemini-pro",
"temperature": 0.7,
"max_tokens": 4000,
"tools": ["tool_id_1","tool_id_2"],
"subordinates": ["sub_agent_1","sub_agent_2"],
"reporting_to":"parent_agent_id",
"authority_level": 1-5,
"constraints": ["constraint_1","constraint_2"],
"success_criteria": ["criterion_1","criterion_2"]
}


**B. Decision Log Format**
{
"decision_id":"uuid",
"timestamp":"iso8601",
"proposing_agent":"agent_id",
"decision_type":"technical|product|process",
"title":"short_description",
"context":"background_information",
"options_considered": [
{"option":"description", "pros": [], "cons": []}
],
"decision":"chosen_option",
"rationale":"explanation",
"approving_authority":"agent_or_human",
"status":"proposed|approved|rejected|implemented",
"implementation_reference":"commit_hash_or_pr"
}

**C. Prompt Templates
Task Assignment Template:**
You are {agent_role}.
Your goal: {task_description}
Context:
{relevant_context_from_knowledge_store}
Acceptance Criteria:
{checklist}
Deliverables:
{expected_outputs}
Deadline: {timestamp}
Begin work and report progress every 30 minutes.

**Code Review Template:**
Review the following code for:

1. Architecture compliance
2. Security vulnerabilities
3. Test coverage
4. Performance issues
5. Documentation completeness
Code:
{code_diff}


```
Architecture Context:
{relevant_adrs}
Provide:
```
- Approval status: APPROVED / NEEDS_CHANGES
- Issues found (if any)
- Suggestions for improvement

**Document Control:**

- **Version:** 1.0
- **Last Updated:** 2026-03-22
- **Author:** AI Systems Architecture Team
- **Review Cycle:** Weekly during active development
**Related Documents:**
- PRD.md
- TECH_SPEC.md
- DESIGN_SYSTEM.md
- API_DOCUMENTATION.md
**Contact:** agents@videoforge.ai


