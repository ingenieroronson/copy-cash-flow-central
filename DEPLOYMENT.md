
# Deployment Guide for Easypanel

This project is configured to deploy seamlessly on Easypanel.

## Easypanel Configuration

### Build Configuration
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Port**: The application will automatically use `process.env.PORT` or default to 3000
- **Build Output**: `/dist` directory

### Environment Variables
Set the following environment variable in your Easypanel dashboard:
- `NODE_ENV=production`

### Deployment Steps
1. Connect your repository to Easypanel
2. Easypanel will automatically detect this as a Node.js project
3. The build process will run `npm install --legacy-peer-deps && npm run build` to create the production build
4. The application will start with `npm start` using the `serve` package to serve static files
5. Your app will be available on the assigned Easypanel URL

### Manual Deployment (if needed)
If you need to deploy manually:
```bash
npm install --legacy-peer-deps
npm run build
npm start
```

### Technical Details
- Uses Vite for building (outputs to `/dist`)
- Serves static files using the `serve` package with SPA fallback
- Configured for production environment
- Port is dynamically set via environment variable
- Uses legacy peer deps for better package compatibility
- Handles React Router with proper fallback configuration

### Troubleshooting
If you see a blank page:
1. Check browser console for JavaScript errors
2. Verify the build completed successfully
3. Ensure all environment variables are set correctly
4. Check that the serve command includes SPA fallback (`--single`)

The project is ready for deployment - no additional configuration needed!
