# Quick Start: Offline/Online Sync

## Installation Complete ✅

The offline/online sync system is now integrated into your app.

## What You Get

### 1. Automatic Connection Detection
- App monitors internet connection in real-time
- Shows banner when offline/online
- Auto-syncs queued operations when reconnected

### 2. Visual Feedback
- **Red banner**: "No internet connection" (stays visible)
- **Green banner**: "Back online" (auto-dismisses after 3s)

### 3. Offline Queue
- Operations are queued when offline
- Automatically synced when connection restored
- Stored in AsyncStorage (persists across app restarts)

## How to Use in Your Code

### Check Connection Status
```typescript
import { useConnectionContext } from '../contexts/ConnectionContext';

function MyScreen() {
  const { isConnected, type } = useConnectionContext();
  
  return (
    <Text>
      {isConnected ? `Online (${type})` : 'Offline'}
    </Text>
  );
}
```

### Execute Queries with Offline Support
```typescript
import { executeWithOfflineSupport } from '../src/lib/turso-offline';

async function saveDonor(name: string, bloodType: string) {
  await executeWithOfflineSupport(
    'INSERT INTO donors (full_name, blood_type) VALUES (?, ?)',
    [name, bloodType],
    'donors'  // table name for tracking
  );
}
```

### Manual Queue Management
```typescript
import { offlineService } from '../src/services/OfflineService';

// Get pending operations count
const count = await offlineService.getPendingCount();

// Get all queued operations
const queue = await offlineService.getQueue();

// Clear queue (use with caution)
await offlineService.clearQueue();
```

## Testing

1. **Start the app**
   ```bash
   npx expo start
   ```

2. **Test offline mode**
   - Enable airplane mode on device/simulator
   - Verify red banner appears at top
   - Try to perform operations (they'll be queued)

3. **Test reconnection**
   - Disable airplane mode
   - Verify green banner appears
   - Check console for sync activity
   - Banner should auto-dismiss after 3 seconds

## Architecture

```
ConnectionProvider (monitors network)
    ↓
ConnectionContext (provides state)
    ↓
ConnectionAlert (shows banner)
    ↓
OfflineService (manages queue)
    ↓
turso-offline (wraps database)
    ↓
Auto-sync on reconnection
```

## Files Reference

- `hooks/useConnection.ts` - Connection detection
- `contexts/ConnectionContext.tsx` - State management
- `lib/ConnectionAlert.tsx` - UI banner
- `src/services/OfflineService.ts` - Queue management
- `src/lib/turso-offline.ts` - Database wrapper

## Common Patterns

### Disable UI when offline
```typescript
const { isConnected } = useConnectionContext();

<Button 
  disabled={!isConnected}
  title="Save"
/>
```

### Show offline indicator
```typescript
{!isConnected && (
  <View style={styles.offlineBadge}>
    <Text>Offline Mode</Text>
  </View>
)}
```

### Cache data for offline viewing
```typescript
import { offlineService } from '../src/services/OfflineService';

// Save for offline
await offlineService.cacheData('donors', donorsList);

// Retrieve when offline
const cachedDonors = await offlineService.getCachedData('donors');
```

## Troubleshooting

**Banner not showing?**
- Check ConnectionProvider is in _layout.tsx
- Verify NetInfo is installed: `npm list @react-native-community/netinfo`

**Sync not working?**
- Check console for errors
- Verify operations are being queued: `offlineService.getQueue()`
- Ensure connection is actually restored

**Operations not queued?**
- Use `executeWithOfflineSupport()` instead of direct `db.execute()`
- Check AsyncStorage permissions

## Next Steps

To fully integrate offline support into existing screens:

1. Replace `db.execute()` calls with `executeWithOfflineSupport()`
2. Add connection checks before network-dependent operations
3. Show cached data when offline
4. Add pending operations indicator in UI

See `OFFLINE_SYNC_IMPLEMENTATION.md` for detailed documentation.
