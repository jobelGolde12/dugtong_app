Project Overview
I'm building a blood donation React Native/Expo app with TypeScript and Turso database. I need to enhance the app with modern offline capabilities, including:

Real-time internet connection detection with modern UI alerts

Data persistence in AsyncStorage when offline

Automatic data synchronization when connection is restored

Queue management for pending operations

Current Tech Stack
Frontend: React Native / Expo (TypeScript)

Database: Turso (libSQL/SQLite)

State Management: React Hooks (useState, useEffect)

Storage: AsyncStorage for local persistence

Navigation: React Navigation (likely)

Authentication: JWT tokens + SecureStore

Core Requirements

1. Internet Connection Detection
   typescript
   // Features needed:

- Real-time connection monitoring (WiFi, cellular, none)
- Modern UI/UX for connection status
- Non-intrusive but noticeable alerts
- Connection quality indicators (optional)

2. Offline Data Persistence
   typescript
   // When offline:

- Store CRUD operations in AsyncStorage queue
- Maintain data integrity and relationships
- Handle conflicts (last-write-wins or manual resolution)
- Show pending operations count to user

3. Synchronization System
   typescript
   // When connection restored:

- Automatic background sync
- Batch operations to Turso database
- Conflict resolution strategies
- Sync progress indicators

4. User Experience
   typescript
   // UX Requirements:

- Modern, non-blocking connection alerts (like Instagram/WhatsApp)
- Visual indicators of offline/online status
- Ability to retry failed operations manually
- Clear feedback on sync progress
  Current Project Structure
  text
  app-project/
  ├── src/
  │ ├── lib/
  │ │ └── turso.ts # Database client
  │ ├── api/
  │ │ ├── users.ts
  │ │ ├── donors.ts
  │ │ └── notifications.ts
  │ └── screens/
  │ └── dashboard/
  │ ├── Search.tsx # Working donor search
  │ └── NotificationScreen.tsx # Needs fix
  ├── scripts/
  │ └── seed.ts # Database seeding
  └── turso/
  └── schema.sql # Database schema
  Detailed Implementation Requirements
  Phase 1: Connection Monitoring & Alerts
  1.1 Connection Hook (src/hooks/useConnection.ts)

typescript
// Create a custom hook that:

- Uses NetInfo API for real-time monitoring
- Detects connection type (wifi, cellular, none)
- Tracks connection quality/strength
- Provides boolean isOnline/isOffline
- Exposes connection type for UI
  1.2 Modern Alert Component (src/components/ConnectionAlert.tsx)

typescript
// Design requirements:

- Bottom banner style (non-modal)
- Smooth animations (slide in/out)
- Auto-dismiss after 5 seconds for reconnection
- Persistent for initial offline detection
- Customizable message and icon
- Touch to retry functionality
- Connection strength indicator
  1.3 Connection Provider (src/providers/ConnectionProvider.tsx)

typescript
// Context provider that:

- Manages global connection state
- Provides connection status to entire app
- Handles reconnection logic
- Manages offline queue state
  Phase 2: Offline Storage System
  2.1 AsyncStorage Schema

typescript
// Design storage structure:
{
// Queue of pending operations
"offline_queue": [
{
id: "uuid",
operation: "CREATE|UPDATE|DELETE",
table: "users|donors|notifications",
data: { ... },
timestamp: "ISO string",
retries: 0,
status: "pending|failed|syncing"
}
],

// Cached data for offline access
"cache": {
"users": { ... },
"donors": { ... },
"notifications": { ... }
},

// Sync metadata
"sync_metadata": {
"last_sync": "timestamp",
"pending_count": 0,
"last_error": null
}
}
2.2 Offline Service (src/services/OfflineService.ts)

typescript
// Core service with methods:
class OfflineService {
// Queue management
addToQueue(operation: Operation): Promise<void>
getQueue(): Promise<Operation[]>
clearQueue(): Promise<void>

// Data caching
cacheData(key: string, data: any): Promise<void>
getCachedData(key: string): Promise<any>

// Sync operations
syncQueue(): Promise<SyncResult>
retryFailedOperations(): Promise<void>

// Conflict resolution
resolveConflicts(conflicts: Conflict[]): Promise<void>
}
2.3 Database Proxy (src/lib/turso-offline.ts)

typescript
// Wrap existing Turso client with offline capabilities:
class TursoOfflineClient {
private turso: TursoClient;
private offlineService: OfflineService;
private isOnline: boolean;

// Proxy methods that check connection
async execute(query: string, params?: any): Promise<Result> {
if (this.isOnline) {
return await this.turso.execute(query, params);
} else {
// Store in offline queue
return await this.offlineService.queueOperation({
type: 'query',
query,
params
});
}
}

// Batch operations with offline support
async batch(queries: string[]): Promise<Result[]> {
// Similar offline handling
}
}
Phase 3: Synchronization Engine
3.1 Sync Service (src/services/SyncService.ts)

typescript
// Handles background synchronization:
class SyncService {
// Automatic sync on connection restore
startAutoSync(): void

// Manual sync trigger
manualSync(): Promise<SyncResult>

// Batch processing
processQueue(): Promise<void>

// Conflict detection and resolution
detectConflicts(): Promise<Conflict[]>

// Progress tracking
getSyncProgress(): SyncProgress

// Error recovery
handleSyncError(error: Error): Promise<void>
}
3.2 Conflict Resolution Strategies

typescript
// Implement strategies for:
enum ConflictStrategy {
LAST_WRITE_WINS, // Use latest timestamp
CLIENT_WINS, // Prefer local changes
SERVER_WINS, // Prefer remote data
MANUAL, // Require user decision
MERGE // Smart merge where possible
}

// For blood donation app, suggest:

- User profiles: LAST_WRITE_WINS
- Donation records: SERVER_WINS (critical data)
- Notifications: CLIENT_WINS (user interactions)
  Phase 4: User Interface Enhancements
  4.1 Offline Indicator (src/components/OfflineIndicator.tsx)

typescript
// Small status bar indicator:

- Top-right corner icon
- Color coded (green/red/yellow)
- Shows pending sync count badge
- Tap to show sync details
  4.2 Sync Status Screen (app/screens/SyncStatusScreen.tsx)

typescript
// Screen to show:

- Pending operations list
- Sync progress bar
- Manual retry buttons
- Conflict resolution UI
- Sync history/log
  4.3 Enhanced Existing Screens

typescript
// Modify existing screens (Search, Notifications):

- Add offline mode UI states
- Show cached data with "offline" badge
- Disable actions that require network
- Show sync status for each item
  Implementation Priorities
  Priority 1: Critical Features
  Connection detection with NetInfo

Basic offline queue in AsyncStorage

Modern connection banner alert

Turso client wrapper for offline support

Priority 2: Core Sync
Automatic sync on reconnection

Conflict resolution (basic strategies)

Progress indicators

Error handling and retry logic

Priority 3: Advanced Features
Background sync even when app closed

Smart caching strategies

Data compression for storage efficiency

Sync analytics and reporting

Technical Specifications
Dependencies to Add
json
{
"dependencies": {
"@react-native-community/netinfo": "^11.0.0",
"uuid": "^9.0.0",
"redux-persist": "^6.0.0", // Optional for state persistence
"@reduxjs/toolkit": "^2.0.0" // Optional for state management
}
}
Performance Requirements
Offline operations should not block UI

Sync should happen in background

Memory efficient queue management

Battery-conscious polling intervals

Testing Requirements
Mock offline scenarios

Test sync conflict resolution

Performance testing with large queues

Battery impact testing

Expected Deliverables
Complete TypeScript implementation of all services

Modern React Native components for alerts and indicators

Integration guide for existing screens

Testing utilities for offline scenarios

Documentation on how to use the offline system

Success Criteria
✅ User Experience

Users see modern, non-blocking alerts when offline

Can continue using app with clear offline indicators

Data automatically syncs when back online

Conflicts are resolved transparently or with clear UI

✅ Technical Excellence

Type-safe implementation

Efficient memory and battery usage

Robust error handling

Clean integration with existing codebase

✅ Maintainability

Well-documented code

Easy to extend for new features

Follows React Native best practices

Comprehensive error logging

Strict Instructions

Do NOT remove, refactor, or redesign any existing UI or layout.

Do NOT modify any components, styles, or logic that are not directly related to the error.

Preserve all existing design, structure, and functionality.

Apply the smallest possible code changes required to resolve the error.

If a file does not directly contribute to the error, do not change it.

What You Should Do

Identify the exact root cause of the error.

Fix only the code that is causing the error.

Keep component structure, styling, and behavior exactly the same.

Ensure the project builds and runs without the error after the fix.

What You Should NOT Do

Do not reformat unrelated files.

Do not change naming conventions.

Do not remove features.

Do not “clean up” or optimize code unless it is required to fix the error.

Expected Result

The error is resolved.

The UI/design remains pixel-identical.

No unrelated code or behavior is changed.

The fix is isolated, minimal, and reversible.

Please provide a complete implementation plan starting with the connection detection and alert system, then progressing to the offline storage and synchronization engine. Include code examples, component designs, and integration steps with the existing blood donation app screens.
