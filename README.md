## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stackai
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration values. The project uses `@t3-oss/env-nextjs` for type-safe environment variable validation.

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Key Decisions

- use TRPC to get typed api query and response
- create routers for connections and knowledge bases
- Used jotai for global state management only when needed
- Use hooks to handle paginated data
