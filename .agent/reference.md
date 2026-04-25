# React Initialization Reference

To initialize a React app non-interactively, use the following commands:

### Next.js (Recommended)
```bash
npx create-next-app@latest [dir] --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git
```

### Vite (React + TS)
```bash
npm create vite@latest [dir] -- --template react-ts
```

### NestJS (Backend)
```bash
npx @nestjs/cli new [dir] --package-manager npm --skip-git
```

### Expo (Mobile)
```bash
npx create-expo-app@latest [dir] --template blank --no-install
```

These flags ensure that the CLI tools do not prompt for user input, making them suitable for automated scaffolding.
