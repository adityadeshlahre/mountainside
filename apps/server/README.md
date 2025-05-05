### esbuild

```
    "build": "esbuild ./src/index.ts --bundle --platform=node --target=node18 --outfile=./dist/index.js",
```

- just install esbuild and run above command to compile with esbuild

### TSC -B

```
    "lib": ["es2020"], // not sure of this
    "module": "Node16", || NextNode || CommonJs
    "moduleResolution": "Node16",
```

these three things are need not sure of few things but adding this to your tsconfig.ts under compilerOptions its fixes tsb build up
