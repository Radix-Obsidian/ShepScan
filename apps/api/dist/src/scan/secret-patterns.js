"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILE_SIZE = exports.SKIP_DIRECTORIES = exports.SKIP_EXTENSIONS = exports.SECRET_PATTERNS = void 0;
exports.SECRET_PATTERNS = [
    {
        name: 'AWS Access Key ID',
        type: 'AWS_ACCESS_KEY',
        regex: /(?<![A-Z0-9])(A3T[A-Z0-9]|AKIA|ABIA|ACCA|AGPA|AIDA|AIPA|ANPA|ANVA|APKA|AROA|ASCA|ASIA)[A-Z0-9]{16}(?![A-Z0-9])/g,
        severity: 'critical',
        description: 'AWS Access Key ID can provide access to AWS resources',
    },
    {
        name: 'AWS Secret Access Key',
        type: 'AWS_SECRET_KEY',
        regex: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g,
        severity: 'critical',
        description: 'AWS Secret Key paired with Access Key ID grants full AWS access',
    },
    {
        name: 'GitHub Token',
        type: 'GITHUB_TOKEN',
        regex: /ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9]{22}_[A-Za-z0-9]{59}|gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|ghr_[A-Za-z0-9]{36}/g,
        severity: 'critical',
        description: 'GitHub token can access repositories and perform actions as the user',
    },
    {
        name: 'Stripe Secret Key',
        type: 'STRIPE_SECRET',
        regex: /sk_live_[A-Za-z0-9]{24,}|sk_test_[A-Za-z0-9]{24,}/g,
        severity: 'critical',
        description: 'Stripe secret key can process payments and access customer data',
    },
    {
        name: 'JWT/API Secret',
        type: 'JWT_SECRET',
        regex: /(?:jwt[_-]?secret|api[_-]?key|api[_-]?secret|secret[_-]?key)\s*[=:]\s*['"]([A-Za-z0-9_\-]{16,})['"]|['"]([A-Za-z0-9_\-]{32,})['"]\s*(?:\/\/|#)?\s*(?:jwt|secret|key)/gi,
        severity: 'high',
        description: 'JWT secrets can be used to forge authentication tokens',
    },
    {
        name: 'Database Connection String',
        type: 'DATABASE_URL',
        regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|mssql|redis):\/\/[^\s'"<>]+:[^\s'"<>]+@[^\s'"<>]+/gi,
        severity: 'critical',
        description: 'Database credentials expose direct access to your data',
    },
    {
        name: 'Google API Key',
        type: 'GOOGLE_API_KEY',
        regex: /AIza[A-Za-z0-9_\-]{35}/g,
        severity: 'high',
        description: 'Google API key can access Google Cloud services and incur charges',
    },
    {
        name: 'Slack Token',
        type: 'SLACK_TOKEN',
        regex: /xox[baprs]-[A-Za-z0-9\-]{10,250}/g,
        severity: 'high',
        description: 'Slack tokens can read messages and access workspace data',
    },
    {
        name: 'Discord Token',
        type: 'DISCORD_TOKEN',
        regex: /[MN][A-Za-z0-9]{23,}\.[\w-]{6}\.[\w-]{27,}/g,
        severity: 'high',
        description: 'Discord bot tokens can control bots and access server data',
    },
    {
        name: 'Private Key',
        type: 'PRIVATE_KEY',
        regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?:\sBLOCK)?-----/g,
        severity: 'critical',
        description: 'Private keys can be used for authentication and decryption',
    },
    {
        name: 'OpenAI API Key',
        type: 'OPENAI_KEY',
        regex: /sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}|sk-proj-[A-Za-z0-9\-_]{80,}/g,
        severity: 'high',
        description: 'OpenAI API key can access AI services and incur charges',
    },
    {
        name: 'Anthropic API Key',
        type: 'ANTHROPIC_KEY',
        regex: /sk-ant-api[A-Za-z0-9\-_]{80,}/g,
        severity: 'high',
        description: 'Anthropic API key can access Claude AI services',
    },
    {
        name: 'Environment Variable Secret',
        type: 'ENV_SECRET',
        regex: /(?:PASSWORD|SECRET|TOKEN|API_KEY|APIKEY|AUTH|CREDENTIAL)[A-Z_]*\s*[=:]\s*['"]?([A-Za-z0-9_\-\/+=]{16,})['"]?/gi,
        severity: 'medium',
        description: 'Potential secret found in environment variable pattern',
    },
];
exports.SKIP_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp3', '.mp4', '.wav', '.avi', '.mov',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.exe', '.dll', '.so', '.dylib',
    '.pyc', '.class', '.o', '.obj',
    '.lock', '.sum',
]);
exports.SKIP_DIRECTORIES = new Set([
    'node_modules',
    '.git',
    'vendor',
    'dist',
    'build',
    '.next',
    '__pycache__',
    '.venv',
    'venv',
    '.idea',
    '.vscode',
    'coverage',
]);
exports.MAX_FILE_SIZE = 1024 * 1024;
//# sourceMappingURL=secret-patterns.js.map