# Flat Production Distribution

This folder contains all files needed for Firebase backend deployment at the root level.

## Files included:
- package.json (at root)
- Source files (client/, server/, shared/)
- Configuration files (at root)
- Build will create dist/ folder during deployment

## To deploy:
Upload ALL files in this folder to the root of your Firebase project.

## To run locally:
```bash
npm install
npm run build
npm start
```

## Important:
Make sure package.json is at the root level of your Firebase project.
The build process will create the dist/ folder during deployment.
