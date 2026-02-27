# hidden-pixels Development Patterns

> Auto-generated skill from repository analysis

## Overview

The **hidden-pixels** repository is a TypeScript-based steganography tool built with Vite. The project focuses on hiding and extracting data within images through an interactive web interface. Development follows an iterative pattern with frequent UI enhancements and feature additions to the core steganography functionality.

## Coding Conventions

### File Naming
- Use **camelCase** for all TypeScript files
- Component files follow pattern: `ComponentName.tsx`
- Utility files follow pattern: `utilityName.ts`

### Import/Export Style
```typescript
// Use alias imports
import { StegTool } from '@/components/StegTool'
import type { ImageData } from '@/types'

// Default exports preferred
export default function StegTool() {
  // component logic
}
```

### Project Structure
```
src/
├── components/           # React components (camelCase.tsx)
├── lib/                 # Utility functions
├── pages/               # Page components
├── integrations/        # External service integrations
└── App.tsx             # Main application router
```

## Workflows

### UI Enhancement with Iterations
**Trigger:** When someone wants to add or improve a UI feature
**Command:** `/enhance-ui`

1. Make initial implementation with descriptive commit message
2. Focus changes primarily on `src/components/StegTool.tsx` or related UI components
3. Make follow-up commit titled "Changes" for refinements and tweaks
4. Repeat the "Changes" pattern for additional iterations
5. Test visual improvements in the browser

```typescript
// Example: Adding a new UI control
export default function StegTool() {
  const [newFeature, setNewFeature] = useState(false);
  
  return (
    <div>
      <button onClick={() => setNewFeature(!newFeature)}>
        Toggle New Feature
      </button>
      {/* Existing steganography UI */}
    </div>
  );
}
```

### Steganography Feature Development
**Trigger:** When someone wants to add functionality to the steganography tool
**Command:** `/add-steg-feature`

1. Implement the core feature logic in `src/components/StegTool.tsx`
2. Add any required state management and event handlers
3. Create supporting UI elements for the new functionality
4. Make iterative "Changes" commit for refinements
5. Test the steganography functionality with sample images

```typescript
// Example: Adding new encoding algorithm
const encodeWithNewAlgorithm = (imageData: ImageData, message: string) => {
  // Steganography logic here
  return encodedImageData;
};
```

### Component Creation with Integration
**Trigger:** When someone wants to add a new standalone component feature
**Command:** `/new-component`

1. Create new component file in `src/components/[NewComponent].tsx`
2. Implement component with proper TypeScript types
3. Update `src/components/StegTool.tsx` to import and integrate new component
4. Make follow-up "Changes" commit for integration adjustments
5. Add any required dependencies to package.json if needed

```typescript
// New component example
export default function ImagePreview({ imageData }: { imageData: string }) {
  return (
    <div className="image-preview">
      <img src={imageData} alt="Preview" />
    </div>
  );
}

// Integration in StegTool.tsx
import ImagePreview from './ImagePreview';
```

### Package Dependency Addition
**Trigger:** When someone wants to add external library functionality
**Command:** `/add-package`

1. Install package using npm (automatically updates package.json and package-lock.json)
2. Import and integrate the package in relevant components
3. Update component logic to utilize new library features
4. Make "Changes" commit for integration refinements and bug fixes

```bash
# Example package installation
npm install canvas-manipulation-lib
```

```typescript
// Integration example
import { processImage } from 'canvas-manipulation-lib';

// Use in component
const processedImage = processImage(originalImage, options);
```

### Infrastructure Feature Addition
**Trigger:** When someone wants to add major features requiring routing, database, or utilities
**Command:** `/add-infrastructure`

1. Create utility functions in `src/lib/*.ts`
2. Add database migrations in `supabase/migrations/*.sql` if needed
3. Update routing configuration in `src/App.tsx`
4. Create new page components in `src/pages/*.tsx`
5. Update type definitions in `src/integrations/supabase/types.ts`
6. Make "Changes" commit for integration refinements

```typescript
// Example utility function
// src/lib/imageUtils.ts
export const validateImageFormat = (file: File): boolean => {
  const validTypes = ['image/png', 'image/jpeg', 'image/bmp'];
  return validTypes.includes(file.type);
};

// App.tsx routing update
import { Routes, Route } from 'react-router-dom';
import NewFeaturePage from './pages/NewFeaturePage';
```

## Testing Patterns

Testing files follow the pattern `*.test.*` though the specific testing framework is not determined from the repository analysis. When adding tests:

1. Create test files alongside components: `ComponentName.test.tsx`
2. Follow the established testing patterns found in existing test files
3. Focus on testing steganography functionality and UI interactions

## Commands

| Command | Purpose |
|---------|---------|
| `/enhance-ui` | Add or improve UI features with iterative refinements |
| `/add-steg-feature` | Add new steganography functionality to the main tool |
| `/new-component` | Create standalone components and integrate them |
| `/add-package` | Add external npm dependencies and integrate them |
| `/add-infrastructure` | Add major features requiring routing, database, or utilities |