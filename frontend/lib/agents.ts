
export type AgentInfo = {
  logo: string;
  name: string;

  logo_invert: boolean;
}

export enum AgentType {
  HUMAN = "human",
  BOT = "bot",
  CODEX = "codex",
  CLAUDE = "claude",
  DEVIN = "devin",
  CODEGEN = "codegen",
  COPILOT = "copilot",
  JULES = "jules",
  CURSOR = "cursor",
  TEMBO = "tembo",
}

export const agents: Record<AgentType, AgentInfo> = {
  [AgentType.HUMAN]: {
    logo: "/icons/human.svg",
    logo_invert: false,
    name: "Human"
  },
  [AgentType.BOT]: {
    logo: "/icons/bot.png",
    logo_invert: true,
    name: "Bot"
  },
  [AgentType.JULES]: {
    logo: "/icons/jules.svg",
    logo_invert: false,
    name: "Google Jules"
  },
  [AgentType.CODEX]: {
    logo: "icons/openai.svg",
    logo_invert: true,
    name: "OpenAI Codex"
  },
  [AgentType.CLAUDE]: {
    logo: "https://images.seeklogo.com/logo-png/55/1/claude-logo-png_seeklogo-554534.png",
    logo_invert: false,
    name: "Claude Agent"
  },
  [AgentType.DEVIN]: {
    logo: "/icons/devin.svg",
    logo_invert: false,
    name: "Devin"
  },
  [AgentType.CODEGEN]: {
    logo: "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/vwcj8othy51lisku77kw",
    logo_invert: false,
    name: "Codegen"
  },
  [AgentType.COPILOT]: {
    logo: "/icons/copilot.svg",
    logo_invert: true,
    name: "Github Copilot"
  },
  [AgentType.CURSOR]: {
    logo: "/icons/cursor.svg",
    logo_invert: true,
    name: "Cursor Agent"
  },
  [AgentType.TEMBO]: {
    logo: "https://www.tembo.io/favicon.ico",
    logo_invert: false,
    name: "Tembo"
  }
}

export const displayAgents: AgentType[] = [
  AgentType.HUMAN,
  AgentType.BOT,
  AgentType.CODEX,
  AgentType.COPILOT,
  AgentType.JULES,
  AgentType.CURSOR,
  AgentType.DEVIN,
]